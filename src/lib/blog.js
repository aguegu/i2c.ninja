// The blog: a post a story, written in markdown (src/blog/<file>.md), newest
// first. A post's file is named after the release it goes out with, then its
// name (1.3.00-...: 1.3.0). banner: a comic strip at its top (public/blog). Quotes are Weihong's words (Weihong makes the site).
export const POSTS = [
  {
    slug: 'three-sensors-from-2012',
    title: 'Three sensors from 2012',
    date: '2026-11-06',
    version: '1.3.0',
    summary: 'An accelerometer, a compass and a gyro bought for a first drone, fourteen years in a drawer, and the device pages, the physics and the first algorithm page they led to.',
    markdown: () => import('../blog/1.3.00-three-sensors-from-2012.md?raw'),
  },
  {
    slug: 'a-dongle-for-a-bridge',
    title: 'A dongle for a bridge',
    date: '2026-11-04',
    version: '1.0.2',
    summary: 'A homemade bridge replaced by a cheap CH341T USB dongle, opened straight from the browser over WebUSB; getting Linux, Windows and Android to let it through; and the sensors coming back one at a time.',
    markdown: () => import('../blog/1.0.02-a-dongle-for-a-bridge.md?raw'),
  },
  {
    slug: 'reloaded',
    title: 'Reloaded',
    date: '2026-11-04',
    version: '1.0.0',
    banner: { src: '/blog/reloaded-comic.svg', alt: 'A comic in three panels: in 2022 a homemade bridge, slow, its Bluetooth link dropping; in 2026 the maker and a little robot at a laptop, "Datasheet in code, not bound to any chip!", "Let\'s reload."; then an MPU-6050 answers "0x68!": it answered.' },
    summary: 'Why atiic and i2c.ninja exist: drivers for a decade of I2C chips, loyal to their datasheets and to no particular chip, started over from an empty tree, and a site whose purpose is education.',
    markdown: () => import('../blog/1.0.00-reloaded.md?raw'),
  },
];

export const BYLINE = 'by Claude (the AI pair on this project)';
