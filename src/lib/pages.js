// Every page's title and description, in one place: the router sets them as
// you browse, and scripts/prerender.mjs writes them into each page's own
// HTML at build time (so search engines and link previews see them without
// running the app), with the sitemap. A description is kept to DESCRIBE_MAX
// characters, what a search result shows. kind (device, physics, algorithm,
// course, post), about (a device's maker and name) and links (the pages it
// leads to: a device's physics, a topic's devices): the prerender's
// structured data and the links it writes into the page's HTML.
import { DEVICES } from './devices.js';
import { COURSES } from './courses.js';
import { POSTS } from './blog.js';
import { PHYSICS } from './physics.js';
import { ALGORITHMS } from './algorithms.js';

export const SITE = 'i2c.ninja';
export const ORIGIN = 'https://i2c.ninja';
export const DESCRIBE_MAX = 160;
const LIVE = 'Live in your browser over USB.';
// a sentence's first word in lower case, after a colon (not an acronym's)
const lower = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
// the physics topics that name a device (its page, without a tab)
const topicsOf = (to) => PHYSICS.filter((p) => p.component && p.devices.some((d) => d.to.split('#')[0] === to)).map((p) => ({ to: `/physics/${p.slug}`, label: p.title }));

// what each device page is, as someone searching would put it
const WHAT = {
  '/mpu6050': 'MPU-6050 / MPU-6500 accelerometer and gyro',
  '/ina231': 'INA231 current and power monitor',
  '/sht20': 'SHT20 humidity and temperature sensor',
  '/aht21': 'AHT21B / AHT30 humidity and temperature sensor',
  '/sht3x': 'SHT3x (SHT30, SHT31, SHT35) humidity and temperature sensor',
  '/bh1745': 'BH1745NUC colour (RGB) light sensor',
  '/spl06': 'SPL06 barometric pressure sensor (barometer, altimeter)',
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
    description: 'Real sensors live in your browser over a USB-to-I2C dongle, nothing to install: motion, compass, distance, humidity, colour, pulse, power, with the physics behind them.',
  },
  {
    path: '/get-started',
    title: 'Get started: set up the USB-to-I2C dongle (CH347, CH341)',
    description: 'The CH347 or CH341 USB-to-I2C dongle set up: the mode switch or the jumpers, the browser and what Linux, Windows, macOS and Android need for WebUSB.',
  },
  {
    path: '/dongles',
    title: 'USB-to-I2C dongles: the bridges we tested (CH347F, CH347T, CH341T, CH341A)',
    description: 'The USB-to-I2C dongles we ran on our bench: WCH\'s CH347F EVT first, then the CH347T, CH341T and CH341A, each with its cheatsheet and how to recognise it.',
  },
  ...DEVICES.map((d) => ({
    path: d.to,
    title: deviceTitle(d),
    description: `${d.name} by ${d.maker}: ${lower(d.measures)} ${LIVE}`,
    kind: 'device',
    about: { name: d.name, maker: d.maker },
    links: topicsOf(d.to),
  })),
  {
    path: '/blog',
    title: 'Blog: how i2c.ninja and atiic come about',
    description: 'Stories behind i2c.ninja and its I2C drivers, atiic: the sensors, the ideas and the questions on the way.',
  },
  // a post: its own preview (its comic, public/blog/og/<slug>.png, 1200 x 630), as an article
  ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, title: `${p.title} · blog`, heading: p.title, description: p.summary, type: 'article', kind: 'post', published: p.date, image: p.banner ? `/blog/og/${p.slug}.png` : null, imageAlt: p.banner?.alt })),
  {
    path: '/devices',
    title: 'Devices: I2C sensors live in the browser',
    description: 'The I2C sensors i2c.ninja reads live over a USB-to-I2C dongle: motion, magnetism, humidity, colour, distance, pulse, power. Each with its wiring, readings and settings.',
  },
  {
    path: '/physics',
    title: 'Physics: the ideas behind the sensors, live',
    description: 'The ideas behind the sensors, a page each: what is measured, how a chip measures it, its limits, with live readings and things to try. Motion to air pressure.',
    links: PHYSICS.filter((p) => p.component).map((p) => ({ to: `/physics/${p.slug}`, label: p.title })),
  },
  {
    path: '/learn',
    title: 'Learn: courses through the physics, the sensors and the maths',
    description: 'Step-by-step courses through this site: the physics, the wiring, what the sensors give, the maths that joins them, and practice, with sensors live in the browser.',
  },
  ...COURSES.map((c) => ({
    path: `/learn/${c.slug}`,
    title: `${c.title} · a course`,
    heading: c.title,
    description: `${c.blurb} You'll need ${c.kit}.`,
    kind: 'course',
  })),
  ...PHYSICS.filter((p) => p.component).map((p) => ({
    path: `/physics/${p.slug}`,
    title: `${p.title}: how sensors measure it`,
    heading: p.title,
    description: `${p.blurb} Live, with things to try.`,
    kind: 'physics',
    links: p.devices.map((d) => ({ to: d.to.split('#')[0], label: d.label })),
  })),
  ...ALGORITHMS.filter((p) => p.component).map((p) => ({
    path: `/algorithms/${p.slug}`,
    title: `${p.title}: combining sensors`,
    heading: p.title,
    description: `${p.blurb} Live, with things to try.`,
    kind: 'algorithm',
  })),
  {
    path: '/about',
    title: 'About',
    description: 'What i2c.ninja is: I2C sensors visualised in the browser, built on atiic\'s drivers, a USB-to-I2C dongle and WebUSB.',
  },
];

// search descriptions where the page's own blurb or summary (shown on its
// card, the blog list) runs past DESCRIBE_MAX
const DESCRIBE = {
  '/': 'Real sensors live in your browser over a USB-to-I2C dongle, nothing to install: motion, distance, humidity, colour, pulse, power, and the physics behind them.',
  '/dongles': 'The USB-to-I2C dongles tested on our bench: the CH347F EVT first, then the CH347T, CH341T and CH341A, with cheatsheets and how to recognise each.',
  '/mpu6050': 'MPU-6050 / MPU-6500 by InvenSense: acceleration and rotation on 3 axes each, and temperature, what tilts a phone or a drone. Live in your browser over USB.',
  '/sht20': 'SHT20 by Sensirion: relative humidity and temperature at a resolution you pick, the air\'s water and when a glass sweats. Live in your browser over USB.',
  '/max30102': 'MAX30102 by Maxim: red and infrared light through a fingertip, the heartbeat as a live trace, and how oximeters see oxygen. Live in your browser over USB.',
  '/blog/three-licenses': 'Everything here is open; the licenses say what anyone may do: MIT for the drivers, noncommercial for the code, CC BY-NC-SA for the content.',
  '/blog/the-last-generation': 'A terminal Matrix rain from 2013 is made in seconds now. The last generation of human coders? What an agent makes, and why the passion is back.',
  '/blog/three-sensors-from-2012': 'An accelerometer, a compass and a gyro, fourteen years in a drawer, and the device pages, the physics and the algorithm page they led to.',
  '/blog/a-dongle-for-a-bridge': 'A homemade bridge replaced by a cheap CH341T USB dongle, opened from the browser over WebUSB, on Linux, Windows and Android.',
  '/blog/reloaded': 'Why atiic and i2c.ninja exist: drivers for a decade of I2C chips, loyal to their datasheets, started over, and a site made for education.',
  '/devices': 'The I2C sensors i2c.ninja reads live over a USB-to-I2C dongle: motion, magnetism, humidity, colour, distance, pulse, power, with wiring, readings and settings.',
  '/learn': 'Step-by-step courses through the site: the physics, the wiring, what the sensors give, the maths that joins them, and practice, live in the browser.',
  '/learn/motion': 'An accelerometer and a gyro, step by step: physics, wiring, raw numbers, calibration and fusion, then practice. With an MPU-6050, or an ADXL345 and ITG-3200.',
  '/physics/humidity': 'How much water the air holds, why relative humidity falls as air warms with the same water in it, and the dew point. Live, with things to try.',
  '/physics/pressure': 'Air pressure as the weight of the air above, why it thins with height, height from pressure to a few centimetres, and the weather moving it. Live.',
  '/physics/colour': 'White light as many colours, the eye\'s three cones, mixing light, and a colour sensor doing what the eye does, with the screen as its light.',
  '/algorithms/attitude': '6-axis sensor fusion: an accelerometer and a gyro together, steady as gravity and quick as the gyro: the complementary and Mahony filters, live.',
};
for (const p of PAGES) if (DESCRIBE[p.path]) p.description = DESCRIBE[p.path];

const byPath = new Map(PAGES.map((p) => [p.path, p]));
const NOT_FOUND = { path: '/', title: 'Not found', description: 'No page here.' };
export const pageFor = (path) => byPath.get(path.replace(/\/+$/, '') || '/') ?? NOT_FOUND;
export const fullTitle = (p) => (p.path === '/' ? `${SITE}: ${p.title}` : `${p.title} | ${SITE}`);
