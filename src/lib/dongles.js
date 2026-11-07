// The USB dongles we know, the recommended one first: each one run on our bench, drawn from the board
// itself (atiic's cheatsheets, public/dongles/) and its chip's datasheet.
// site: whether this site runs on it; effort: setting it up for this site,
// 1 (easy) to 3 stars, and why (Get started's steps); look: how to recognise one; search:
// the words that find it in a shop. No shop links: the boards come from
// many sellers under many names.
export const ATIIC_DOCS = 'https://github.com/aguegu/atiic/blob/main/docs';

export const DONGLES = [
  {
    id: 'ch347t',
    name: 'LXC-CH347 (CH347T)',
    kind: 'USB to UART / I2C / SPI / JTAG, high speed',
    sheet: '/dongles/ch347t-lxc.svg',
    alt: 'The LXC-CH347 board, USB-C down: its two 16-pin rows, each pin\'s silkscreen, back label and role in mode 1, the mode switch',
    site: true,
    recommended: true,
    effort: 1,
    effortWhy: 'one switch; on Linux, only the udev rule',
    look: [
      'A purple board with a USB-C socket',
      'Two rows of 16 pins, in groups printed UART1, UART0, SPI, JTAG, I2C',
      'A two-way switch, S1 and S2, that picks the mode',
      'A CH347T chip (20 pins), an 8 MHz crystal, IO0 to IO7 printed on the back',
    ],
    search: 'CH347T USB to UART I2C SPI JTAG module',
    note: 'Mode 1 (S1 on, S2 off). Faster than a CH341 (high-speed USB), and every byte\'s ack comes back, so a refused write is caught. Its SPI (to 60 MHz) and I/O lines drive displays in atiic.',
    doc: `${ATIIC_DOCS}/ch347.md`,
  },
  {
    id: 'ch341t',
    name: 'CH341T "2-in-1"',
    kind: 'USB to I2C / TTL',
    sheet: '/dongles/ch341t-2in1.svg',
    alt: 'The CH341T 2-in-1 dongle drawn to scale, USB down: its 6-pin header with each pin in I2C and TTL mode, the two jumpers, the crystal and LEDs',
    site: true,
    effort: 2,
    effortWhy: 'two jumpers; on Linux, spi-ch341 released after each plug-in (or blocked once)',
    look: [
      'A small blue board, about 35 x 18 mm, a USB-A plug on one end',
      'A 6-pin header on the other: RXD, TXD, SDA, SCL, GND, VCC',
      'A yellow jumper marked TTL / I2C and a green one marked 3.3 / 5V',
      'A CH341T chip (20 pins), a 12.000 crystal, two LEDs marked TNOW and RDY',
    ],
    search: 'CH341T 2-in-1 module USB to I2C TTL',
    note: 'The one this site was built on: the sensor pages\' wiring drawings show it. Jumpers: yellow on I2C, green on 3.3.',
    doc: `${ATIIC_DOCS}/ch341.md`,
  },
  {
    id: 'ch341a',
    name: 'CH341A "V357"',
    kind: 'USB to UART / I2C / SPI',
    sheet: '/dongles/ch341a-v357.svg',
    alt: 'The CH341A V357 dongle, USB down: its 2x8 header and two 10-hole rows, each hole\'s chip pin and role, the jumpers, the crystal and regulator',
    site: true,
    effort: 3,
    effortWhy: 'two jumpers; on Linux, spi-ch341 as on the CH341T; I2C on a 2x8 header among many pins',
    look: [
      'A blue board with a USB-A plug, "V357" printed by the chip, "LC Technology" on the back',
      'A 2x8 header: GND, RXD, TXD, VCC, GND, SCL, SDA, VCC beside MISO, MOSI, SCK, CS2, CS1, CS0, GND, VCC',
      'Two rows of 10 holes along its sides, named on the back',
      'A CH341A chip (28 pins), a 12.0M crystal, an AMS1117 3.3 V regulator, jumpers marked 3V3 / 5V and I2C/SPI / UART',
    ],
    search: 'CH341A V357 USB to UART IIC SPI TTL',
    note: 'Jumpers on 3V3 and I2C/SPI; I2C is on the header\'s SCL and SDA. Its SPI and D0 to D7 drive displays in atiic.',
    doc: `${ATIIC_DOCS}/ch341.md`,
  },
];

// side by side; a row's cells in DONGLES' order
export const STARS = (n) => '\u2605'.repeat(n) + '\u2606'.repeat(3 - n);
export const EFFORT = ['', 'easy', 'some steps', 'more steps'];

export const COMPARE = [
  { label: 'Setting up', cells: DONGLES.map((d) => `${STARS(d.effort)} ${EFFORT[d.effort]}`) },
  { label: 'On this site', cells: ['yes, every page', 'yes, every page', 'yes, every page'] },
  { label: 'USB', cells: ['high speed (480 Mbit/s), USB-C', 'full speed (12 Mbit/s), USB-A', 'full speed (12 Mbit/s), USB-A'] },
  { label: 'I2C', cells: ['20, 100, 400, 750 kHz; every byte\'s ack read back', '20, 100, 400, 750 kHz', '20, 100, 400, 750 kHz'] },
  { label: 'SPI', cells: ['yes, up to 60 MHz', 'no', 'yes'] },
  { label: 'Digital I/O lines', cells: ['5: IO2, IO4, IO5, IO6, IO7', 'none', '8: D0 to D5 in and out, D6 and D7 in'] },
  { label: 'Serial port', cells: ['beside I2C and SPI, always', 'instead of I2C (yellow jumper on TTL)', 'instead of I2C/SPI (jumper on UART)'] },
  { label: 'Voltage', cells: ['3.3 V', '3.3 or 5 V (green jumper)', '3.3 or 5 V (jumper)'] },
];
