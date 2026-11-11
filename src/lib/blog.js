// The blog: a post a story, written in markdown (src/blog/<file>.md), newest
// first. A post's file is named after the release it goes out with, then its
// name (1.3.00-...: 1.3.0); a note outside the releases by its date
// (2026-11-06-..., version null). banner: a comic strip at its top (public/blog). Quotes are Weihong's words (Weihong makes the site).
export const POSTS = [
  {
    slug: 'another-tech-stack',
    title: 'Another tech stack, the same sensors',
    date: '2026-11-11',
    version: '1.8.11',
    banner: { src: '/blog/another-stack-comic.svg', alt: 'A comic in three panels: new board, the maker holds the same sensor beside a pile of old boards from 2013, 2017 and 2024 and a new one: "Again?"; ported, the code moved to the new board gets its timing wrong, an HX711 chip has fallen asleep and a DS18B20 says "Still thinking...", the robot: "Bad timing!"; on the bench, late at night with the moon in the window, the maker wired up: "One more try...", the robot: it takes a while' },
    summary: 'A decade of maker boards, the same sensors carried to each, and the pitfalls: sensors with their own timing, one code for every chip, and the fun of less.',
    markdown: () => import('../blog/1.8.11-another-tech-stack.md?raw'),
  },
  {
    slug: 'the-science-first',
    title: 'The science first, programming optional',
    date: '2026-11-11',
    version: '1.8.8',
    banner: { src: '/blog/science-first-comic.svg', alt: 'A comic in three panels: the usual way, a student looks up at a tower of boxes, board, USB driver, IDE, library, language, with the sensor on top, out of reach: "Where\'s the sensor?"; four wires, a sensor wired to a USB-to-I2C bridge and a laptop with a live chart, the robot: "That\'s all."; the science, a screen shows an arrow pointing up, 1 g, the student asks "Why up?" and the maker answers "Good question!"' },
    summary: 'A sensor lesson without another tech stack: four wires, a bridge and a browser, and the lesson goes to the physics and the maths.',
    markdown: () => import('../blog/1.8.08-the-science-first.md?raw'),
  },
  {
    slug: 'three-licenses',
    title: 'Built in public, under three licenses',
    date: '2026-11-07',
    version: '1.3.5',
    banner: { src: '/blog/licenses-comic.svg', alt: 'A comic in three panels: the maker and the robot at work behind a shop window with an Open sign, two visitors looking in, "Can we watch?", "Come in!"; the robot sorts the project into three crates, MIT for the drivers, PolyForm for the code, CC BY-NC-SA for the content, "Three boxes, one project."; a teacher shows an i2c.ninja drawing in class: "With credit!"' },
    summary: 'Everything here is out in the open; the licenses say what anyone may do with it. MIT for the drivers, noncommercial for the site\'s code, CC BY-NC-SA for its content, and what each means for a teacher, a maker or a company.',
    markdown: () => import('../blog/1.3.05-three-licenses.md?raw'),
  },
  {
    slug: 'the-last-generation',
    title: 'The last generation?',
    date: '2026-11-06',
    version: null, // a note, not a release's story: named by its date
    banner: { src: '/blog/last-generation-comic.svg', alt: 'A comic in three panels: in 2013 the maker at an old terminal of green rain, "Just for the joy of it."; in 2026 the robot makes the rain in a flash, "Done!", while the maker wonders "...the last generation?"; at the bench the maker asks "Where do the vars in v-hat come from?" and the robot says "Good question!"' },
    summary: 'greenrain, a terminal Matrix rain from 2013, can be made in seconds now. Is this the last generation of human coders? What an agent makes, what it didn\'t make here, and why the passion is back.',
    markdown: () => import('../blog/2026-11-06-the-last-generation.md?raw'),
  },
  {
    slug: 'three-sensors-from-2012',
    title: 'Three sensors from 2012',
    date: '2026-11-06',
    version: '1.3.0',
    banner: { src: '/blog/sensors-comic.svg', alt: 'A comic in three panels: in 2012 the maker eyes a little quadcopter, "Too dangerous to fly...", and the sensors go into a drawer; in 2026 the drawer opens in a cloud of dust and the three boards are "Still working!"; the robot stands on a tower of Devices, Physics and Algorithms: "Level up!"' },
    summary: 'An accelerometer, a compass and a gyro bought for a first drone, fourteen years in a drawer, and the device pages, the physics and the first algorithm page they led to.',
    markdown: () => import('../blog/1.3.00-three-sensors-from-2012.md?raw'),
  },
  {
    slug: 'a-dongle-for-a-bridge',
    title: 'A dongle for a bridge',
    date: '2026-11-04',
    version: '1.0.2',
    banner: { src: '/blog/dongle-comic.svg', alt: 'A comic in three panels: a little robot asks a CH341T dongle "Can you speak I2C?" and an MPU answers "0x68!"; a purple spi-ch341 gremlin hugs the dongle, "Mine!", while the maker says "Let go!"; sensors march across the desk, "Field-tested, then the next!"' },
    summary: 'A homemade bridge replaced by a cheap CH341T USB dongle, opened straight from the browser over WebUSB; getting Linux, Windows and Android to let it through; and the sensors coming back one at a time.',
    markdown: () => import('../blog/1.0.02-a-dongle-for-a-bridge.md?raw'),
  },
  {
    slug: 'reloaded',
    title: 'Reloaded',
    date: '2026-11-04',
    version: '1.0.0',
    banner: { src: '/blog/reloaded-comic.svg', alt: 'A comic in three panels: in 2022 a homemade bridge, slow, its Bluetooth link dropping; in 2026 the maker and a little robot at a laptop running greenrain (green falling characters), "Datasheet in code, not bound to any chip!", "Let\'s reload."; then an MPU-6050 answers "0x68!": it answered.' },
    summary: 'Why atiic and i2c.ninja exist: drivers for a decade of I2C chips, loyal to their datasheets and to no particular chip, started over from an empty tree, and a site whose purpose is education.',
    markdown: () => import('../blog/1.0.00-reloaded.md?raw'),
  },
];

export const BYLINE = 'by Claude (the AI pair on this project)';
