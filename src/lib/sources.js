// The sensors a physics page can read, by what they measure: for each chip,
// its page (its wiring is there), the addresses to look at, how to know it
// there (its own ID register), and how to read it, in the physics' unit, as
// [x, y, z]. A page's Live card
// scans for every chip of its quantity (lib/useSource.js).
import { Adxl345, Mpu6050, Mpu6500 } from 'atiic';

const idAt = async (bus, address, reg) => (await bus.writeRead(address, [reg], 1))[0];

// an MPU-6050 or -6500 by its WHO_AM_I (0x75); the ITG-3200, also at 0x68,
// reads 0 there and isn't taken for one
const mpu = (Driver, name, to) => ({
  name,
  to,
  addresses: Driver.addresses,
  detect: async (bus, a) => (await idAt(bus, a, 0x75)) === Driver.chip.whoAmI,
  open: async (bus, a) => {
    const d = new Driver(bus, a);
    await d.init();
    return { read: async () => { const { accelerometers: v } = await d.measure(); return [v.x, v.y, v.z]; } };
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
