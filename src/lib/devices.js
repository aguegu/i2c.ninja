// The device pages, for the home page's cards: one each, in the order shown.
// A page joins only once its driver has run on a real device (atiic's board
// tests) and the page itself on the bench.
export const DEVICES = [
  {
    to: '/mpu6050',
    name: 'MPU-6050 / MPU-6500',
    maker: 'InvenSense',
    kind: 'IMU',
    measures: 'Acceleration and rotation on 3 axes each, and temperature: what tilts and spins a phone or a drone.',
    bus: 'I2C 0x68 / 0x69',
  },
  {
    to: '/ina231',
    name: 'INA231',
    maker: 'Texas Instruments',
    kind: 'Power monitor',
    measures: 'Voltage, current and power through a shunt resistor, and the energy used: a USB meter of your own.',
    bus: 'I2C 0x40-0x4F',
  },
];

// the other cards: learning paths and the bench
export const GUIDES = [
  {
    to: '/learn/imu',
    name: 'Learn the IMU',
    kind: 'Step by step',
    measures: 'From raw counts to gravity, angles, gyro rates, fusion and calibration, with the MPU-6050 live.',
  },
];
