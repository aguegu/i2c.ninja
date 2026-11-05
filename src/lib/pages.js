// Every page's title and description, in one place: the router sets them as
// you browse, and scripts/prerender.mjs writes them into each page's own
// HTML at build time (so search engines and link previews see them without
// running the app), with the sitemap.
import { DEVICES } from './devices.js';
import { IMU_STEPS } from '../views/learn/imuSteps.js';

export const SITE = 'i2c.ninja';
export const ORIGIN = 'https://i2c.ninja';
const HOW = 'live in the browser over a CH341 USB dongle (WebUSB): nothing to install.';

// what each device page is, as someone searching would put it
const WHAT = {
  '/mpu6050': 'MPU-6050 / MPU-6500 accelerometer and gyro',
  '/ina231': 'INA231 current and power monitor',
  '/sht20': 'SHT20 humidity and temperature sensor',
  '/aht21': 'AHT21B humidity and temperature sensor',
  '/max30102': 'MAX30102 heart-rate and pulse oximeter sensor',
  '/vl53l1x': 'VL53L1X time-of-flight distance sensor',
  '/mlx90614': 'MLX90614 infrared thermometer',
  '/adxl345': 'ADXL345 accelerometer',
  '/hmc5883l': 'HMC5883L magnetometer (compass)',
  '/itg3200': 'ITG-3200 gyroscope',
};
const deviceTitle = (d) => `${WHAT[d.to] ?? d.name}, live in your browser`;

export const PAGES = [
  {
    path: '/',
    title: 'Sensors live and explained, for STEM lessons and the bench',
    description: `STEM education with real sensors: plug one into a CH341 USB dongle and watch it ${HOW} Live charts and how each sensor measures, for lessons, digital experiments and smoke-testing modules: IMUs, a compass, a gyro, distance, pulse, humidity, power.`,
  },
  {
    path: '/get-started',
    title: 'Get started: set up the CH341 USB to I2C dongle',
    description: 'The CH341 dongle in I2C mode: the jumpers, the browser (Chrome, Edge, Firefox) and what Linux, Windows, macOS and Android need for WebUSB.',
  },
  ...DEVICES.filter((d) => d.to !== '/learn/imu').map((d) => ({
    path: d.to,
    title: deviceTitle(d),
    description: `${d.maker} ${d.name}: ${d.measures} ${HOW[0].toUpperCase()}${HOW.slice(1)}`,
  })),
  {
    path: '/learn/imu',
    title: 'Learn the IMU: accelerometer and gyro, step by step',
    description: 'From raw counts to gravity, tilt, gyro angles, sensor fusion (complementary, Mahony), quaternions and calibration, with an MPU-6050 live in the browser.',
  },
  ...IMU_STEPS.filter((s) => s.component).map((s) => ({
    path: `/learn/imu/${s.slug}`,
    title: `${s.title} · Learn the IMU`,
    description: `${s.blurb} Learn the IMU, with an MPU-6050 live in the browser.`,
  })),
  {
    path: '/about',
    title: 'About i2c.ninja',
    description: 'What i2c.ninja is: I2C sensors visualised in the browser, built on atiic\'s drivers, the CH341 dongle and WebUSB.',
  },
];

const byPath = new Map(PAGES.map((p) => [p.path, p]));
export const pageFor = (path) => byPath.get(path.replace(/\/+$/, '') || '/') ?? PAGES[0];
export const fullTitle = (p) => (p.path === '/' ? `${SITE}: ${p.title}` : `${p.title} | ${SITE}`);
