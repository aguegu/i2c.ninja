<script setup>
import SvgDrawing from '../components/SvgDrawing.vue';
import { ref } from 'vue';
import SetupCheck from '../components/SetupCheck.vue';
import { detectPlatform } from '../lib/dongle.js';
import { ATIIC } from '../lib/nav.js';

// tried: whether these steps have run on our bench; the others are what the
// platforms document, waiting for a bench to try them
const PLATFORMS = [
  { id: 'linux', label: 'Linux', tried: true }, // r8845: Manjaro 7.2.9, Chromium, 2026-11-04
  { id: 'windows', label: 'Windows', tried: true }, // the user, 2026-11-08: a CH347T, once on WinUSB (Zadig); a CH341 not tried
  { id: 'macos', label: 'macOS', tried: true }, // the user's Mac (Intel), 2026-11-12: a CH347, nothing set up, as the steps say; the Apple silicon accessory prompt is Apple's documented step, not tried
  { id: 'android', label: 'Android', tried: true }, // the user's phone, Chrome over an OTG adapter, 2026-11-05
  { id: 'chromeos', label: 'ChromeOS', tried: false },
];
const platform = ref(detectPlatform());

// a rule of its own for each bridge, its file named to sort before
// 73-seat-late.rules (which turns uaccess into the user's access): the CH341
// in I2C mode (1a86:5512), the CH347T in mode 1 (55db) and the CH347F (55de),
// a dart (ffff:da92)
const udev = (file, vendor, products) => `echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="${vendor}", ATTRS{idProduct}=="${products}", TAG+="uaccess"' | sudo tee /etc/udev/rules.d/${file}
sudo udevadm control --reload`;
const UDEV_RULES = [
  { name: 'A CH341', commands: udev('70-ch341.rules', '1a86', '5512') },
  { name: 'A CH347', commands: udev('70-ch347.rules', '1a86', '55db|55de') },
  { name: 'A dart', commands: udev('70-dart.rules', 'ffff', 'da92') },
];
const RELEASE_COMMAND = `sudo sh -c 'for i in /sys/bus/usb/drivers/spi-ch341/*:*; do [ -e "$i" ] && echo "\${i##*/}" && echo -n "\${i##*/}" > /sys/bus/usb/drivers/spi-ch341/unbind; done'`;
const BLOCK_COMMANDS = `echo 'blacklist spi_ch341' | sudo tee /etc/modprobe.d/ch341-no-spi.conf
sudo rmmod spi_ch341`;

// the bridges with a wiring drawing, in Bridges' order: each one's setup in
// a sentence or two (its steps: our own markup, shown as HTML)
const DONGLE_SETUPS = [
  {
    name: 'CH347F EVT (WCH)',
    drawing: '/setup-ch347f.svg',
    alt: 'WCH\'s CH347F evaluation board, USB-B down, JP1 on its bottom pair, wired from its P5 header straight across to a GY-521 (MPU-6050): SDA to SDA, SCL to SCL, GND to GND, 3V3 (VIO) to VCC',
    steps: [
      'I2C, SPI, two serial ports and eight I/O lines at once, high speed. No modes to set: just check that <b>JP1</b> joins its bottom pair (3V3 to VIO).',
      'Four wires from its <b>P5</b> header: <b>SDA</b>, <b>SCL</b>, <b>GND</b>, and the pin printed <b>3V3</b> (VIO, 3.3 V) for the device\'s VCC.',
    ],
    sheet: '/dongles/ch347f-evt.svg',
  },
  {
    name: 'CH347T board (LXC-CH347)',
    drawing: '/setup-ch347t.svg',
    alt: 'A CH347T board (LXC-CH347), USB-C down, its switch S1 on and S2 off, wired from its right-hand row to a GY-521 (MPU-6050): SDA to SDA, SCL to SCL, GND to GND, 3V3 to VCC',
    steps: [
      'USB to UART, I2C, SPI, high speed. Its switch <b>S1 on, S2 off</b> (mode 1: I2C and SPI beside a serial port).',
      'Four wires: <b>SDA</b> and <b>SCL</b> from its I2C header, <b>GND</b>, and <b>3V3</b> for the device\'s VCC (the 5V pins are USB\'s own 5 V).',
    ],
    sheet: '/dongles/ch347t-lxc.svg',
  },
  {
    name: 'CH341T "2-in-1"',
    drawing: '/setup-ch341t.svg',
    alt: 'A CH341T 2-in-1 bridge, USB-A to the left, yellow jumper on I2C and green on 3V3, its header\'s SDA, SCL, GND and VCC wired straight across to a GY-521 (MPU-6050)',
    steps: [
      'USB to I2C or TTL. Its jumpers <b>yellow on I2C</b> (on TTL it\'s a serial port instead), <b>green on 3V3</b> (VCC and the bus at 3.3 V).',
      'Four wires: <b>SDA</b>, <b>SCL</b>, <b>GND</b>, <b>VCC</b>.',
    ],
    sheet: '/dongles/ch341t-2in1.svg',
  },
];
// step 5: what the site gives each kind of reader, once the bridge works;
// icons as Home's cards (24-unit SVG paths): a mortarboard, a whiteboard, a wrench
const GAINS = [
  {
    who: 'Students and hobbyists',
    icon: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6',
    text: 'The science first: a sensor\'s readings live and explained, what it measures, how the chip measures it, the physics and the maths behind it. Then play and experiment: the things to try on each page, then your own questions, with the raw readings logged and charted for the report. A home assignment worth an A+.',
    links: [{ to: '/devices', label: 'Devices' }, { to: '/physics', label: 'Physics' }],
  },
  {
    who: 'Teachers',
    icon: 'M3 4h18M4 4v11h16V4M12 15v3M8 21l4-3 4 3M8 11l3-3 2 2 3-3',
    text: 'Lessons and experiments with nothing to install: a browser and a bridge, and once visited the site works offline. Class demos on the projector, every live chart a click from full screen; lab work and home assignments, the raw readings logged and charted for the students\' reports. Its drawings and explanations are free for your slides and handouts, with credit, paid courses included.',
    links: [{ to: '/algorithms', label: 'Algorithms' }, { to: '/blog/three-licenses', label: 'The licenses' }],
  },
  {
    who: 'Makers and engineers',
    icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
    text: 'A module checked in a minute: found by its ID, its readings live. The drivers behind every page are atiic\'s, MIT, field-tested here with real modules: use them as they are, or as a reference for your own driver or project. And measured facts about the bridges and chips that their datasheets leave out.',
    links: [{ href: ATIIC, label: 'atiic' }, { to: '/bridges', label: 'Bridges' }],
  },
];
const TAB_ON = 'border-emerald-600 bg-emerald-600 text-white';
const TAB_OFF = 'border-slate-300 dark:border-slate-600';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const code = 'whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">Get started</h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      What a USB-to-I²C bridge (a CH347 or a CH341 board, or a devkit) needs before this site can use
      it: a browser with WebUSB, the bridge set for I2C, once per computer a
      permission, then a check.
    </p>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Where to buy?</h2>
      <div class="grid gap-4 leading-relaxed md:grid-cols-2">
        <div>
          <h3 class="mb-1 font-semibold">The bridge</h3>
          <p>
            CH341 and CH347 boards are common and cheap: online marketplaces
            (Amazon, AliExpress, Taobao) and electronics shops carry them, from
            many sellers under many names. Search by the chip, not the shop: each
            board's card on
            <RouterLink to="/bridges" class="text-emerald-700 underline dark:text-emerald-400">Bridges</RouterLink>
            gives the words that find it and how to recognise it when it comes.
            The CH347F evaluation board is WCH's own: search for its name,
            <i>WCH CH347F EVT</i>.
          </p>
        </div>
        <div>
          <h3 class="mb-1 font-semibold">The sensors</h3>
          <p>
            The same chip comes on many small boards (modules, breakouts) from
            many makers: an MPU-6050 is often sold as a GY-521, but not only.
            What counts is the chip, and that's what this site looks for. Search
            for the chip's name and <i>module</i>.
          </p>
          <p class="mt-2">
            Boards for the same chip still differ: the order and names of their
            pins (wire by what's printed on yours), whether they take 3.3 V only
            or carry a regulator for 5 V, their pull-up resistors, an address pin.
            Each page under
            <RouterLink to="/devices" class="text-emerald-700 underline dark:text-emerald-400">Devices</RouterLink>
            shows the board we ran and its wiring. When yours comes, check that
            the chip printed on it is the one the listing names.
          </p>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        i2c.ninja is vendor and dealer neutral: no shop, brand or seller is
        favoured. A sponsor's link, if there is one, is marked as a sponsor's.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">1. A browser with WebUSB</h2>
      <p class="max-w-3xl leading-relaxed">
        Chrome, Edge, Opera, Brave or another Chromium, on a computer or on
        Android. Firefox and Safari have no WebUSB.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">2. The bridge</h2>
      <p class="mb-4 leading-relaxed">
        Any of these: set it as its card says, with it unplugged, then four
        wires to the device. Each drawing opens full screen (its corner button).
      </p>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="d in DONGLE_SETUPS" :key="d.name" class="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <h3 class="font-semibold">{{ d.name }}</h3>
          <SvgDrawing :src="d.drawing" :alt="d.alt" class="w-full" />
          <p v-for="(t, i) in d.steps" :key="i" class="text-sm leading-relaxed" v-html="t" />
          <p class="mt-auto text-sm text-slate-500 dark:text-slate-400">
            Every pin of the board: its
            <a :href="d.sheet" target="_blank" rel="noopener" class="text-emerald-700 underline dark:text-emerald-400">cheatsheet</a>.
          </p>
        </div>
      </div>

      <p class="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Another board, or not sure which you have?
        <RouterLink to="/bridges" class="text-emerald-700 underline dark:text-emerald-400">Bridges</RouterLink>:
        the ones we tested side by side, how to recognise each and what to search for.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">3. Once per computer: let the browser open it</h2>
      <div class="mb-4 flex flex-wrap gap-2" role="tablist">
        <button v-for="p in PLATFORMS" :key="p.id" role="tab" :aria-selected="platform === p.id" class="rounded-full border px-3 py-1 text-sm" :class="platform === p.id ? TAB_ON : TAB_OFF" @click="platform = p.id">
          {{ p.label }}
        </button>
      </div>

      <p v-if="!PLATFORMS.find((p) => p.id === platform).tried" class="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Not tried on our bench yet: these are the platform's documented steps.
      </p>

      <div v-if="platform === 'linux'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          The browser runs as you, and USB devices belong to root. A udev rule
          gives the bridge to whoever is logged in at the computer:
        </p>
        <template v-for="r in UDEV_RULES" :key="r.name">
          <p class="font-semibold">{{ r.name }}:</p>
          <pre :class="code">{{ r.commands }}</pre>
        </template>
        <p>
          Then unplug the bridge and plug it back in. A rule's file name has
          to sort before <code>73-seat-late.rules</code>, which turns the
          <code>uaccess</code> tag into your access: the <code>70-</code>
          files do. One rule set up before 1.6.1, for all three in
          <code>70-ch341.rules</code>, keeps working.
        </p>
        <p>A CH347 or a dart is ready then. A CH341 has step 3.1 too.</p>
      </div>

      <div v-else-if="platform === 'windows'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Windows lets a browser open only devices on its WinUSB driver, and
          the CH341 and CH347 don't ask for it by themselves. Bind it with
          <a href="https://zadig.akeo.ie" class="text-emerald-600 underline">Zadig</a>:
        </p>
        <ol class="list-decimal pl-6">
          <li>Plug the bridge in and start Zadig.</li>
          <li>Options, List All Devices.</li>
          <li>Pick the device whose USB ID reads 1A86 55DB, Interface 2 (a CH347T in mode 1), or 1A86 5512 (a CH341).</li>
          <li>Choose WinUSB as the driver, then Install (or Replace) Driver.</li>
        </ol>
        <p>
          WCH's own CH341 driver and tools then no longer see this bridge,
          until its driver is switched back.
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Tried on our bench with a CH347T (its Interface 2 on WinUSB); a CH341
          the same way, not tried yet.
        </p>
        <p>
          A dart needs none of this: it asks Windows for WinUSB itself.
        </p>
      </div>

      <div v-else-if="platform === 'macos'" class="max-w-3xl leading-relaxed">
        <p>
          Nothing to do: macOS lets the browser open the bridge. If WCH's own
          CH341 driver is installed and holds the bridge, the check below says
          it's busy.
        </p>
        <p class="mt-3">
          On a laptop with Apple silicon (an M-series chip), macOS 13 and
          later asks the first time a new USB accessory is plugged in:
          choose Allow, or the bridge won't show in the browser's list.
          This is Apple's documented step; our Mac (Intel) never asked it.
        </p>
      </div>

      <div v-else-if="platform === 'android'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Chrome on the phone, the bridge on a USB OTG adapter or cable. Chrome
          asks once whether this site may use it.
        </p>
        <p>Some phones keep OTG off until it's switched on in their settings.</p>
      </div>

      <div v-else class="max-w-3xl leading-relaxed">
        <p>Nothing to do: Chrome asks once whether this site may use the bridge.</p>
      </div>
    </section>

    <section v-if="platform === 'linux'" :class="card">
      <h2 class="mb-1 text-lg font-semibold">3.1 Optional, a CH341 on Linux: the kernel's spi-ch341</h2>
      <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">A CH347 skips this: the kernel takes only its serial port and leaves the rest to the browser.</p>
      <div class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Recent kernels have <code>spi-ch341</code>, a driver
          for the CH341 as an SPI master. It takes the bridge each time it's
          plugged in, and the browser can't take it back. Release the bridge
          from it, each time after plugging it in:
        </p>
        <pre :class="code">{{ RELEASE_COMMAND }}</pre>
        <p>
          It prints the interface it released (as <code>1-2:1.0</code>);
          nothing printed, nothing was held.
        </p>
        <p>
          Or, if you never use a CH341 through the kernel's SPI
          (<code>spidev</code>, an SPI flash as an MTD device), keep the driver
          from loading at all, once:
        </p>
        <pre :class="code">{{ BLOCK_COMMANDS }}</pre>
        <p>
          This doesn't stop SPI through WebUSB or programs on libusb
          (flashrom, ch341prog): they talk to the chip themselves. Undo it by
          deleting <code>/etc/modprobe.d/ch341-no-spi.conf</code>.
        </p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">4. Check</h2>
      <p class="mb-3 max-w-3xl leading-relaxed">
        Pick the bridge in the browser's list: the site opens it and asks
        which I2C addresses answer.
      </p>
      <SetupCheck :platform="platform" />
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">5. What it gives you</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="g in GAINS" :key="g.who" class="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <h3 class="flex items-center gap-2 font-semibold">
            <svg viewBox="0 0 24 24" class="h-7 w-7 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="g.icon" /></svg>
            {{ g.who }}
          </h3>
          <p class="text-sm leading-relaxed">{{ g.text }}</p>
          <p class="mt-auto flex flex-wrap gap-x-3 text-sm">
            <template v-for="l in g.links" :key="l.label">
              <a v-if="l.href" :href="l.href" class="text-emerald-700 underline dark:text-emerald-400">{{ l.label }}</a>
              <RouterLink v-else :to="l.to" class="text-emerald-700 underline dark:text-emerald-400">{{ l.label }}</RouterLink>
            </template>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
