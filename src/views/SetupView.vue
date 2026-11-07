<script setup>
import SvgDrawing from '../components/SvgDrawing.vue';
import { ref } from 'vue';
import SetupCheck from '../components/SetupCheck.vue';
import { detectPlatform } from '../lib/dongle.js';

// tried: whether these steps have run on our bench; the others are what the
// platforms document, waiting for a bench to try them
const PLATFORMS = [
  { id: 'linux', label: 'Linux', tried: true }, // r8845: Manjaro 7.2.9, Chromium, 2026-11-04
  { id: 'windows', label: 'Windows', tried: false },
  { id: 'macos', label: 'macOS', tried: false },
  { id: 'android', label: 'Android', tried: true }, // the user's phone, Chrome over an OTG adapter, 2026-11-05
  { id: 'chromeos', label: 'ChromeOS', tried: false },
];
const platform = ref(detectPlatform());

const UDEV_RULE = 'SUBSYSTEM=="usb", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="5512", TAG+="uaccess"';
const UDEV_COMMANDS = `echo '${UDEV_RULE}' | sudo tee /etc/udev/rules.d/70-ch341.rules
sudo udevadm control --reload`;
const RELEASE_COMMAND = `sudo sh -c 'for i in /sys/bus/usb/drivers/spi-ch341/*:*; do [ -e "$i" ] && echo "\${i##*/}" && echo -n "\${i##*/}" > /sys/bus/usb/drivers/spi-ch341/unbind; done'`;
const BLOCK_COMMANDS = `echo 'blacklist spi_ch341' | sudo tee /etc/modprobe.d/ch341-no-spi.conf
sudo rmmod spi_ch341`;

// the dongles this site has run on, so a reader can find the same board:
// what to look for on it, the words that find it in a shop's search. The
// sheets are atiic's (docs/ch341t-board.svg, docs/ch341a-board.svg), drawn
// from the boards' own photos
const DONGLES = [
  {
    name: 'CH341T "2-in-1" (USB to I2C / TTL)',
    sheet: '/dongles/ch341t-2in1.svg',
    alt: 'The CH341T 2-in-1 dongle drawn to scale, USB down: its 6-pin header with each pin in I2C and TTL mode, the two jumpers, the crystal and LEDs',
    look: [
      'A small blue board, about 35 x 18 mm, a USB-A plug on one end',
      'A 6-pin header on the other: RXD, TXD, SDA, SCL, GND, VCC',
      'A yellow jumper marked TTL / I2C and a green one marked 3.3 / 5V',
      'A CH341T chip (20 pins), a 12.000 crystal, two LEDs marked TNOW and RDY',
    ],
    search: 'CH341T 2-in-1 module USB to I2C TTL',
    note: 'The one this site is built on: every sensor page runs on it.',
  },
  {
    name: 'CH341A "V357" (USB to UART / I2C / SPI)',
    sheet: '/dongles/ch341a-v357.svg',
    alt: 'The CH341A V357 dongle, USB down: its 2x8 header and two 10-hole rows, each hole\'s chip pin and role, the jumpers, the crystal and regulator',
    look: [
      'A blue board with a USB-A plug, "V357" printed by the chip, "LC Technology" on the back',
      'A 2x8 header: GND, RXD, TXD, VCC, GND, SCL, SDA, VCC beside MISO, MOSI, SCK, CS2, CS1, CS0, GND, VCC',
      'Two rows of 10 holes along its sides, named on the back (D0-D7, WR, VCC; SLCT ... WAIT, GND, 3V3)',
      'A CH341A chip (28 pins), a 12.0M crystal, an AMS1117 3.3 V regulator, jumpers marked 3V3 and I2C/SPI / UART',
    ],
    search: 'CH341A V357 USB to UART IIC SPI TTL',
    note: 'Set its jumpers to 3V3 and I2C/SPI; I2C is on the header\'s SCL and SDA. It also brings out SPI and more lines, which atiic uses for displays.',
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
      What a CH341 dongle needs before this site can use it: a browser with
      WebUSB, the dongle's jumpers, once per computer a permission, then a
      check.
    </p>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">1. A browser with WebUSB</h2>
      <p class="max-w-3xl leading-relaxed">
        Chrome, Edge, Opera, Brave or another Chromium, on a computer or on
        Android. Firefox and Safari have no WebUSB.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">2. The dongle</h2>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <p class="leading-relaxed lg:w-2/5">
          A CH341T "2-in-1" dongle (USB to I2C / TTL). Set its jumpers with it
          unplugged: <b>yellow on I2C</b> (on TTL it's a serial port instead),
          <b>green on 3V3</b> (VCC and the bus at 3.3V). Then four wires to the
          device: SDA, SCL, GND, VCC.
        </p>
        <SvgDrawing src="/setup.svg" alt="A CH341T dongle, yellow jumper on I2C and green on 3V3, wired SDA, SCL, GND and VCC to a GY-521 (MPU-6050) board" class="mx-auto w-full lg:w-3/5" />
      </div>

      <h3 class="mt-6 mb-1 font-semibold">The ones we tested</h3>
      <p class="mb-3 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        CH341 dongles come in many boards under many names. These two ran
        this site on our bench; any CH341 that shows up as USB ID 1A86 5512
        in I2C mode should do, but these are the ones we know.
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="d in DONGLES" :key="d.name" class="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <h4 class="font-semibold">{{ d.name }}</h4>
          <SvgDrawing :src="d.sheet" :alt="d.alt" class="mx-auto w-full max-w-xs" />
          <a :href="d.sheet" target="_blank" rel="noopener" class="text-center text-sm text-emerald-600 underline">Open the full cheatsheet</a>
          <div>
            <p class="text-sm font-medium">How to recognise it</p>
            <ul class="list-disc pl-5 text-sm leading-relaxed">
              <li v-for="l in d.look" :key="l">{{ l }}</li>
            </ul>
          </div>
          <p class="text-sm">
            <span class="font-medium">Search for:</span>
            <code class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-900">{{ d.search }}</code>
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ d.note }}</p>
        </article>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        A CH347T board (LXC-CH347, in its mode 1) runs atiic too, faster, but
        not this site yet.
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
          gives the dongle to whoever is logged in at the computer:
        </p>
        <pre :class="code">{{ UDEV_COMMANDS }}</pre>
        <p>
          Then unplug the dongle and plug it back in. The rule's file name has
          to sort before <code>73-seat-late.rules</code>, which turns the
          <code>uaccess</code> tag into your access: <code>70-ch341.rules</code>
          does.
        </p>
        <p>
          Recent kernels also have <code>spi-ch341</code>, a driver for the
          CH341 as an SPI master. It takes the dongle each time it's plugged in,
          and the browser can't take it back. Release the dongle from it, each
          time after plugging it in:
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

      <div v-else-if="platform === 'windows'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Windows lets a browser open only devices on its WinUSB driver, and
          the CH341 doesn't ask for it by itself. Bind it with
          <a href="https://zadig.akeo.ie" class="text-emerald-600 underline">Zadig</a>:
        </p>
        <ol class="list-decimal pl-6">
          <li>Plug the dongle in and start Zadig.</li>
          <li>Options, List All Devices.</li>
          <li>Pick the device whose USB ID reads 1A86 5512.</li>
          <li>Choose WinUSB as the driver, then Install (or Replace) Driver.</li>
        </ol>
        <p>
          WCH's own CH341 driver and tools then no longer see this dongle,
          until its driver is switched back.
        </p>
      </div>

      <div v-else-if="platform === 'macos'" class="max-w-3xl leading-relaxed">
        <p>
          Nothing to do: macOS lets the browser open the dongle. If WCH's own
          CH341 driver is installed and holds the dongle, the check below says
          it's busy.
        </p>
      </div>

      <div v-else-if="platform === 'android'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Chrome on the phone, the dongle on a USB OTG adapter or cable. Chrome
          asks once whether this site may use it.
        </p>
        <p>Some phones keep OTG off until it's switched on in their settings.</p>
      </div>

      <div v-else class="max-w-3xl leading-relaxed">
        <p>Nothing to do: Chrome asks once whether this site may use the dongle.</p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">4. Check</h2>
      <p class="mb-3 max-w-3xl leading-relaxed">
        Pick the dongle in the browser's list: the site opens it and asks
        which I2C addresses answer.
      </p>
      <SetupCheck :platform="platform" />
    </section>
  </main>
</template>
