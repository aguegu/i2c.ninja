// The sensors a physics page can read, by what they measure: for each chip,
// its page (its wiring is there), the addresses to look at, how to know it
// there (its own ID register), and how to read it, in the physics' unit, as
// [x, y, z] (readMs: how often, when slower than the page's pace). A page's Live card
// scans for every chip of its quantity (lib/useSource.js).
import { Adxl345, Mpu6050, Mpu6500, Itg3200, Hmc5883l } from 'atiic';

const idAt = async (bus, address, reg) => (await bus.writeRead(address, [reg], 1))[0];

// an MPU-6050 or -6500 by its WHO_AM_I (0x75); the ITG-3200, also at 0x68,
// reads 0 there and isn't taken for one
// part: 'accelerometers' or 'gyroscopes', the MPU's half to read
const mpu = (Driver, name, to, part = 'accelerometers') => ({
  name,
  to,
  addresses: Driver.addresses,
  detect: async (bus, a) => (await idAt(bus, a, 0x75)) === Driver.chip.whoAmI,
  open: async (bus, a) => {
    const d = new Driver(bus, a);
    await d.init();
    return { read: async () => { const v = (await d.measure())[part]; return [v.x, v.y, v.z]; } };
  },
});

export const ACCELEROMETERS = {
  noun: 'accelerometer',
  unit: 'g',
  chips: [
    {
      name: 'ADXL345',
      to: '/adxl345',
      addresses: Adxl345.addresses,
      detect: async (bus, a) => (await idAt(bus, a, 0x00)) === Adxl345.chip.whoAmI,
      open: async (bus, a) => {
        const d = new Adxl345(bus, a);
        await d.init();
        return { read: async () => { const { accelerometers: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
    mpu(Mpu6050, 'MPU-6050', '/mpu6050'),
    mpu(Mpu6500, 'MPU-6500', '/mpu6500'),
  ],
};

// the MPUs first: their WHO_AM_I tells them apart; an address one holds isn't
// asked again (the ITG-3200's wake-up, a write, never reaches an MPU)
export const GYROSCOPES = {
  noun: 'gyroscope',
  unit: '°/s',
  chips: [
    mpu(Mpu6050, 'MPU-6050', '/mpu6050', 'gyroscopes'),
    mpu(Mpu6500, 'MPU-6500', '/mpu6500', 'gyroscopes'),
    {
      name: 'ITG-3200',
      to: '/itg3200',
      addresses: Itg3200.addresses,
      // asleep its WHO_AM_I reads 0: woken first (its idWake)
      detect: async (bus, a) => {
        await bus.write(a, Itg3200.chip.idWake);
        await new Promise((resolve) => setTimeout(resolve, Itg3200.chip.idWakeMs));
        return Itg3200.chip.identify(bus, a);
      },
      open: async (bus, a) => {
        const d = new Itg3200(bus, a);
        await d.init();
        return { read: async () => { const { gyroscopes: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
  ],
};

export const MAGNETOMETERS = {
  noun: 'magnetometer',
  unit: 'µT',
  chips: [
    {
      name: 'HMC5883L',
      to: '/hmc5883l',
      addresses: Hmc5883l.addresses,
      readMs: 67, // its 15 Hz (atiic's setting): faster repeats the sample
      detect: (bus, a) => Hmc5883l.chip.identify(bus, a),
      open: async (bus, a) => {
        const d = new Hmc5883l(bus, a);
        await d.init();
        return { read: async () => { const { magnetometers: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
  ],
};
