// The sensors a physics page can read, by what they measure: for each chip,
// its page (its wiring is there), the addresses to look at, how to know it
// there (its own ID register), and how to read it, in the physics' unit, as
// [x, y, z] (readMs: how often, when slower than the page's pace). family: the
// module a chip shares with chips of other quantities (an MPU's two halves
// at one address), so a page needing two quantities takes them from one board when
// it can (lib/useSources.js). A page's Live card
// scans for every chip of its quantity (lib/useSource.js).
import { Adxl345, Mpu6050, Mpu6500, Itg3200, Hmc5883l, Qmc5883l, Bmx055Accel, Bmx055Gyro, Bmx055Mag } from 'atiic';

const idAt = async (bus, address, reg) => (await bus.writeRead(address, [reg], 1))[0];

// a Bosch BMX055: three chips in one package at three addresses, one family
// (so a page wanting two quantities takes both from the module), each known
// by its chip ID; its PS pin high, or it isn't on I2C. Its magnetometer is
// turned inside the package against the accelerometer and gyro (Bosch's
// BST-BMX055-DS000 rev 1.1, 14.2, Figure 41 and Table 71: a_x along -B_y,
// a_y along B_x, a_z along B_z): bmx055Field() gives the field in theirs,
// so the module's three quantities share one set of axes
const BMX055 = 'BMX055';
export const bmx055Field = (m) => [-m.y, m.x, m.z];
const bmxDetect = (Driver) => (bus, a) => idAt(bus, a, Driver.chip.idRegister).then((id) => id === Driver.chip.whoAmI);

// an MPU-6050 or -6500 by its WHO_AM_I (0x75); the ITG-3200, also at 0x68,
// reads 0 there and isn't taken for one
// part: 'accelerometers' or 'gyroscopes', the MPU's half to read
const mpu = (Driver, name, to, part = 'accelerometers') => ({
  name,
  to,
  family: name,
  sameAddress: true,
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
    {
      name: BMX055,
      to: '/bmx055',
      family: BMX055,
      addresses: Bmx055Accel.addresses,
      detect: bmxDetect(Bmx055Accel),
      open: async (bus, a) => {
        const d = new Bmx055Accel(bus, a);
        await d.init();
        return { read: async () => { const { accelerometers: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
  ],
};

// the MPUs first: their WHO_AM_I tells them apart; an address one holds isn't
// asked again (the ITG-3200's wake-up, a write, never reaches an MPU). The
// BMX055's gyro, a read of its chip ID, before the ITG-3200 for the same reason
export const GYROSCOPES = {
  noun: 'gyroscope',
  unit: '°/s',
  chips: [
    mpu(Mpu6050, 'MPU-6050', '/mpu6050', 'gyroscopes'),
    mpu(Mpu6500, 'MPU-6500', '/mpu6500', 'gyroscopes'),
    {
      name: BMX055,
      to: '/bmx055',
      family: BMX055,
      addresses: Bmx055Gyro.addresses,
      detect: bmxDetect(Bmx055Gyro),
      open: async (bus, a) => {
        const d = new Bmx055Gyro(bus, a);
        await d.init();
        return { read: async () => { const { gyroscopes: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
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
    {
      name: 'QMC5883L',
      to: '/qmc5883l',
      addresses: Qmc5883l.addresses,
      readMs: 20, // its 50 Hz (atiic's default): faster repeats the sample
      detect: (bus, a) => Qmc5883l.chip.identify(bus, a),
      open: async (bus, a) => {
        const d = new Qmc5883l(bus, a, { range: '2G' });
        await d.init();
        return { read: async () => { const { magnetometers: v } = await d.measure(); return [v.x, v.y, v.z]; } };
      },
    },
    {
      name: BMX055,
      to: '/bmx055',
      family: BMX055,
      addresses: Bmx055Mag.addresses,
      readMs: 100, // its 10 Hz (atiic's setting): faster repeats the sample
      // asleep its chip ID reads 0: woken first (its idWake)
      detect: async (bus, a) => {
        await bus.write(a, Bmx055Mag.chip.idWake);
        await new Promise((resolve) => setTimeout(resolve, Bmx055Mag.chip.idWakeMs));
        return (await idAt(bus, a, Bmx055Mag.chip.idRegister)) === Bmx055Mag.chip.whoAmI;
      },
      open: async (bus, a) => {
        const d = new Bmx055Mag(bus, a);
        await d.init();
        let last = [0, 0, 0];
        return {
          read: async () => {
            const { magnetometers: v } = await d.measure();
            // an axis past the chip's range reads null: the reading before holds
            if (v.x !== null && v.y !== null && v.z !== null) last = bmx055Field(v);
            return last;
          },
        };
      },
    },
  ],
};
