// The device pages: one each, by group (DEVICE_GROUPS: what a sensor
// senses), in the order shown, each group's together.
// A page joins only once its driver has run on a real device (atiic's board
// tests) and the page itself on the bench.
import { COURSES } from './courses.js';

// the groups, in the order shown, each its colour (a CSS variable: style.css);
// a group with no device yet isn't shown
export const DEVICE_GROUPS = [
  { name: 'Motion', color: '--group-motion', blurb: 'How it moves, turns and points: acceleration, rotation, and Earth\'s magnetic field.' },
  { name: 'Air', color: '--group-air', blurb: 'The air around it: humidity, temperature and pressure.' },
  { name: 'Light', color: '--group-light', blurb: 'Sensing by light: colour, distance by timing light, temperature by infrared.' },
  { name: 'Body', color: '--group-body', blurb: 'The body: the pulse, by light through the skin.' },
  { name: 'Electricity', color: '--group-electricity', blurb: 'Voltage, current and power.' },
];

export const DEVICES = [
  {
    to: '/mpu6050',
    name: 'MPU-6050 / MPU-6500',
    maker: 'InvenSense',
    kind: 'IMU',
    group: 'Motion',
    measures: 'Acceleration and rotation on 3 axes each, and temperature: what tilts and spins a phone or a drone.',
    bus: 'I2C 0x68 / 0x69',
  },
  {
    to: '/adxl345',
    name: 'ADXL345',
    maker: 'Analog Devices',
    kind: 'Accelerometer',
    group: 'Motion',
    measures: 'Acceleration on three axes, so gravity and tilt at rest; a self test that pushes its own mass.',
    bus: 'I2C 0x53',
  },
  {
    to: '/itg3200',
    name: 'ITG-3200',
    maker: 'InvenSense',
    kind: 'Gyroscope',
    group: 'Motion',
    measures: 'How fast it turns about three axes, the angle that adds up to, and how a gyro drifts.',
    bus: 'I2C 0x68',
  },
  {
    to: '/hmc5883l',
    name: 'HMC5883L',
    maker: 'Honeywell',
    kind: 'Magnetometer',
    group: 'Motion',
    measures: 'Earth\'s magnetic field on three axes, so a compass; calibrated against the board\'s own field.',
    bus: 'I2C 0x1E',
  },
  {
    to: '/sht20',
    name: 'SHT20',
    maker: 'Sensirion',
    kind: 'Humidity',
    group: 'Air',
    measures: 'Relative humidity and temperature, at a resolution you pick: the air\'s water, and when a cold glass starts to sweat.',
    bus: 'I2C 0x40',
  },
  {
    to: '/sht3x',
    name: 'SHT3x',
    maker: 'Sensirion',
    kind: 'Humidity',
    group: 'Air',
    measures: 'Relative humidity and temperature, four times a second: the SHT20\'s faster, more accurate successor.',
    bus: 'I2C 0x44 / 0x45',
  },
  {
    to: '/aht21',
    name: 'AHT21B / AHT30',
    maker: 'Aosong',
    kind: 'Humidity',
    group: 'Air',
    measures: 'Relative humidity and temperature: another maker\'s answer to the same air.',
    bus: 'I2C 0x38',
  },
  {
    to: '/spl06',
    name: 'SPL06',
    maker: 'Goertek',
    kind: 'Pressure',
    group: 'Air',
    measures: 'Air pressure and temperature: the weather, and the board lifted by a few centimetres.',
    bus: 'I2C 0x77 / 0x76',
  },
  {
    to: '/agr12',
    name: 'AGR12 / AGN12 / AGP12',
    maker: 'Aosong',
    kind: 'Pressure',
    group: 'Air',
    measures: 'Gauge pressure in a tube: a breath, a squeezed bulb, a suck below the room\'s air.',
    bus: 'I2C 0x50, 30 kHz at most',
  },
  {
    to: '/bh1745',
    name: 'BH1745NUC',
    maker: 'ROHM',
    kind: 'Colour',
    group: 'Light',
    measures: 'Red, green, blue and clear light as counts: the tint of a lamp, a window, a coloured card.',
    bus: 'I2C 0x38 / 0x39',
  },
  {
    to: '/vl53l1x',
    name: 'VL53L1X',
    maker: 'STMicroelectronics',
    kind: 'Distance',
    group: 'Light',
    measures: 'Distance up to about 4 m by timing light: a laser ruler, live. Wave a hand over it.',
    bus: 'I2C 0x29',
  },
  {
    to: '/mlx90614',
    name: 'MLX90614',
    maker: 'Melexis',
    kind: 'IR thermometer',
    group: 'Light',
    measures: 'The temperature of what it points at, without touching it, and its own: a thermometer gun.',
    bus: 'I2C 0x5A',
  },
  {
    to: '/max30102',
    name: 'MAX30102',
    maker: 'Maxim (Analog Devices)',
    kind: 'Pulse',
    group: 'Body',
    measures: 'Red and infrared light through a fingertip: the heartbeat as a live trace, and how oximeters see oxygen.',
    bus: 'I2C 0x57',
  },
  {
    to: '/ina231',
    name: 'INA231',
    maker: 'Texas Instruments',
    kind: 'Power monitor',
    group: 'Electricity',
    measures: 'Voltage, current and power through a shunt resistor, and the energy used: a USB meter of your own.',
    bus: 'I2C 0x40-0x4F',
  },
];

// the devices of each group, in DEVICE_GROUPS' order, the empty ones left out
export const DEVICES_BY_GROUP = DEVICE_GROUPS.map((g) => ({ ...g, devices: DEVICES.filter((d) => d.group === g.name) })).filter((g) => g.devices.length);

// the other cards: the courses (lib/courses.js)
export const GUIDES = COURSES.map((c) => ({ to: `/learn/${c.slug}`, name: c.title, kind: 'Course', measures: c.blurb }));
