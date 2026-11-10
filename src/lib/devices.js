// The device pages, for the home page's cards: one each, in the order shown.
// A page joins only once its driver has run on a real device (atiic's board
// tests) and the page itself on the bench.
import { COURSES } from './courses.js';

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
  {
    to: '/sht20',
    name: 'SHT20',
    maker: 'Sensirion',
    kind: 'Humidity',
    measures: 'Relative humidity and temperature, at a resolution you pick: the air\'s water, and when a cold glass starts to sweat.',
    bus: 'I2C 0x40',
  },
  {
    to: '/sht3x',
    name: 'SHT3x',
    maker: 'Sensirion',
    kind: 'Humidity',
    measures: 'Relative humidity and temperature, four times a second: the SHT20\'s faster, more accurate successor.',
    bus: 'I2C 0x44 / 0x45',
  },
  {
    to: '/aht21',
    name: 'AHT21B',
    maker: 'Aosong',
    kind: 'Humidity',
    measures: 'Relative humidity and temperature: another maker\'s answer to the same air.',
    bus: 'I2C 0x38',
  },
  {
    to: '/bh1745',
    name: 'BH1745NUC',
    maker: 'ROHM',
    kind: 'Colour',
    measures: 'Red, green, blue and clear light as counts: the tint of a lamp, a window, a coloured card.',
    bus: 'I2C 0x38 / 0x39',
  },
  {
    to: '/max30102',
    name: 'MAX30102',
    maker: 'Maxim (Analog Devices)',
    kind: 'Pulse',
    measures: 'Red and infrared light through a fingertip: the heartbeat as a live trace, and how oximeters see oxygen.',
    bus: 'I2C 0x57',
  },
  {
    to: '/vl53l1x',
    name: 'VL53L1X',
    maker: 'STMicroelectronics',
    kind: 'Distance',
    measures: 'Distance up to about 4 m by timing light: a laser ruler, live. Wave a hand over it.',
    bus: 'I2C 0x29',
  },
  {
    to: '/mlx90614',
    name: 'MLX90614',
    maker: 'Melexis',
    kind: 'IR thermometer',
    measures: 'The temperature of what it points at, without touching it, and its own: a thermometer gun.',
    bus: 'I2C 0x5A',
  },
  {
    to: '/adxl345',
    name: 'ADXL345',
    maker: 'Analog Devices',
    kind: 'Accelerometer',
    measures: 'Acceleration on three axes, so gravity and tilt at rest; a self test that pushes its own mass.',
    bus: 'I2C 0x53',
  },
  {
    to: '/hmc5883l',
    name: 'HMC5883L',
    maker: 'Honeywell',
    kind: 'Magnetometer',
    measures: 'Earth\'s magnetic field on three axes, so a compass; calibrated against the board\'s own field.',
    bus: 'I2C 0x1E',
  },
  {
    to: '/itg3200',
    name: 'ITG-3200',
    maker: 'InvenSense',
    kind: 'Gyroscope',
    measures: 'How fast it turns about three axes, the angle that adds up to, and how a gyro drifts.',
    bus: 'I2C 0x68',
  },
];

// the other cards: the courses (lib/courses.js)
export const GUIDES = COURSES.map((c) => ({ to: `/learn/${c.slug}`, name: c.title, kind: 'Course', measures: c.blurb }));
