// Every page's title and description, in one place: the router sets them as
// you browse, and scripts/prerender.mjs writes them into each page's own
// HTML at build time (so search engines and link previews see them without
// running the app), with the sitemap.
import { DEVICES } from './devices.js';
import { COURSES } from './courses.js';
import { POSTS } from './blog.js';
import { PHYSICS } from './physics.js';
import { ALGORITHMS } from './algorithms.js';

export const SITE = 'i2c.ninja';
export const ORIGIN = 'https://i2c.ninja';
const HOW = 'live in the browser over a CH347 or CH341 USB dongle (WebUSB): nothing to install.';

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
    title: 'Get started: set up the USB to I2C dongle (CH347, CH341)',
    description: 'The CH347 or CH341 dongle set for I2C: the mode switch or the jumpers, the browser and what Linux, Windows, macOS and Android need for WebUSB.',
  },
  {
    path: '/dongles',
    title: 'Dongles: the USB to I2C bridges we tested (CH347T, CH341T, CH341A)',
    description: 'The USB dongles we ran on our bench, side by side: the CH347T (LXC-CH347), recommended, the CH341T 2-in-1 and the CH341A V357. Each with its cheatsheet, how to recognise it and the words that find it.',
  },
  ...DEVICES.map((d) => ({
    path: d.to,
    title: deviceTitle(d),
    description: `${d.maker} ${d.name}: ${d.measures} ${HOW[0].toUpperCase()}${HOW.slice(1)}`,
  })),
  {
    path: '/blog',
    title: 'Blog: how i2c.ninja and atiic come about',
    description: 'Stories behind i2c.ninja and its I2C drivers, atiic: the sensors, the ideas and the questions on the way.',
  },
  // a post: its own preview (its comic, public/blog/og/<slug>.png, 1200 x 630), as an article
  ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, title: `${p.title} · blog`, description: p.summary, type: 'article', published: p.date, image: p.banner ? `/blog/og/${p.slug}.png` : null, imageAlt: p.banner?.alt })),
  {
    path: '/devices',
    title: 'Devices: I2C sensors live in the browser',
    description: 'The sensors i2c.ninja reads live over a USB dongle (CH347, CH341): motion, magnetism, humidity, temperature, distance, pulse, power. Each with its wiring, its readings explained and its settings.',
  },
  {
    path: '/learn',
    title: 'Learn: courses through the physics, the sensors and the maths',
    description: 'Step-by-step courses through this site: the physics, the wiring, what the sensors give, the maths that joins them, and practice, with sensors live in the browser.',
  },
  ...COURSES.map((c) => ({
    path: `/learn/${c.slug}`,
    title: `${c.title} · a course`,
    description: `${c.blurb} You'll need ${c.kit}.`,
  })),
  ...PHYSICS.filter((p) => p.component).map((p) => ({
    path: `/physics/${p.slug}`,
    title: `${p.title}: how sensors measure it`,
    description: `${p.blurb} With the sensors that measure it live in the browser, and things to try in class.`,
  })),
  ...ALGORITHMS.filter((p) => p.component).map((p) => ({
    path: `/algorithms/${p.slug}`,
    title: `${p.title}: combining sensors`,
    description: `${p.blurb} Live in the browser, with things to try in class.`,
  })),
  {
    path: '/about',
    title: 'About',
    description: 'What i2c.ninja is: I2C sensors visualised in the browser, built on atiic\'s drivers, a CH347 or CH341 dongle and WebUSB.',
  },
];

const byPath = new Map(PAGES.map((p) => [p.path, p]));
const NOT_FOUND = { path: '/', title: 'Not found', description: 'No page here.' };
export const pageFor = (path) => byPath.get(path.replace(/\/+$/, '') || '/') ?? NOT_FOUND;
export const fullTitle = (p) => (p.path === '/' ? `${SITE}: ${p.title}` : `${p.title} | ${SITE}`);
