<script setup>
import SvgDrawing from '../components/SvgDrawing.vue';
import { ref } from 'vue';
import SetupCheck from '../components/SetupCheck.vue';
import { detectPlatform } from '../lib/dongle.js';

// tried: whether these steps have run on our bench; the others are what the
// platforms document, waiting for a bench to try them
const PLATFORMS = [
  { id: 'linux', label: 'Linux', tried: true }, // r8845: Manjaro 7.2.9, Chromium, 2026-11-04
  { id: 'windows', label: 'Windows', tried: true }, // the user, 2026-11-08: a CH347T, once on WinUSB (Zadig); a CH341 not tried
  { id: 'macos', label: 'macOS', tried: false },
  { id: 'android', label: 'Android', tried: true }, // the user's phone, Chrome over an OTG adapter, 2026-11-05
  { id: 'chromeos', label: 'ChromeOS', tried: false },
];
const platform = ref(detectPlatform());

// the CH341 in I2C mode (5512), the CH347T in mode 1 (55db), the CH347F (55de)
const UDEV_RULE = 'SUBSYSTEM=="usb", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="5512|55db|55de", TAG+="uaccess"';
const UDEV_COMMANDS = `echo '${UDEV_RULE}' | sudo tee /etc/udev/rules.d/70-ch341.rules
sudo udevadm control --reload`;
const RELEASE_COMMAND = `sudo sh -c 'for i in /sys/bus/usb/drivers/spi-ch341/*:*; do [ -e "$i" ] && echo "\${i##*/}" && echo -n "\${i##*/}" > /sys/bus/usb/drivers/spi-ch341/unbind; done'`;
const BLOCK_COMMANDS = `echo 'blacklist spi_ch341' | sudo tee /etc/modprobe.d/ch341-no-spi.conf
sudo rmmod spi_ch341`;

const TAB_ON = 'border-emerald-600 bg-emerald-600 text-white';
const TAB_OFF = 'border-slate-300 dark:border-slate-600';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const code = 'whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">Get started</h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      What a USB dongle (a CH347, or a CH341) needs before this site can use
      it: a browser with WebUSB, the dongle set for I2C, once per computer a
      permission, then a check.
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
        <div class="flex flex-col gap-2 leading-relaxed lg:w-2/5">
          <p>
            <b>Recommended: a CH347T board</b> (LXC-CH347; USB to UART, I2C,
            SPI, high speed). Set its switch with it unplugged:
            <b>S1 on, S2 off</b> (mode 1: I2C and SPI beside a serial port).
          </p>
          <p>
            Then four wires to the device: <b>SDA</b> and <b>SCL</b> from its
            I2C header, <b>GND</b>, and <b>3V3</b> for the device's VCC (3.3 V;
            the 5V pins are USB's own 5 V).
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Every pin of the board: its
            <a href="/dongles/ch347t-lxc.svg" target="_blank" rel="noopener" class="text-emerald-700 underline dark:text-emerald-400">cheatsheet</a>.
          </p>
        </div>
        <SvgDrawing src="/setup-ch347t.svg" alt="A CH347T board (LXC-CH347), USB-C down, its switch S1 on and S2 off, wired from its right-hand row to a GY-521 (MPU-6050): SDA to SDA, SCL to SCL, GND to GND, 3V3 to VCC" class="mx-auto w-full lg:w-3/5" />
      </div>

      <h3 class="mt-6 mb-2 font-semibold">Or a CH341T "2-in-1"</h3>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <p class="leading-relaxed lg:w-2/5">
          A CH341T "2-in-1" dongle (USB to I2C / TTL). Set its jumpers with it
          unplugged: <b>yellow on I2C</b> (on TTL it's a serial port instead),
          <b>green on 3.3</b> (VCC and the bus at 3.3 V). Then four wires to the
          device: SDA, SCL, GND, VCC.
        </p>
        <SvgDrawing src="/setup-ch341t.svg" alt="A CH341T 2-in-1 dongle, USB-A to the left, yellow jumper on I2C and green on 3.3, its header's SDA, SCL, GND and VCC wired straight across to a GY-521 (MPU-6050)" class="mx-auto w-full lg:w-3/5" />
      </div>

      <p class="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Another board, or not sure which you have?
        <RouterLink to="/dongles" class="text-emerald-700 underline dark:text-emerald-400">Dongles</RouterLink>:
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
          gives the dongle to whoever is logged in at the computer:
        </p>
        <pre :class="code">{{ UDEV_COMMANDS }}</pre>
        <p>
          Then unplug the dongle and plug it back in. The rule's file name has
          to sort before <code>73-seat-late.rules</code>, which turns the
          <code>uaccess</code> tag into your access: <code>70-ch341.rules</code>
          does.
        </p>
        <p>A CH347 is ready then. A CH341 has step 3.1 too.</p>
      </div>

      <div v-else-if="platform === 'windows'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Windows lets a browser open only devices on its WinUSB driver, and
          the CH341 and CH347 don't ask for it by themselves. Bind it with
          <a href="https://zadig.akeo.ie" class="text-emerald-600 underline">Zadig</a>:
        </p>
        <ol class="list-decimal pl-6">
          <li>Plug the dongle in and start Zadig.</li>
          <li>Options, List All Devices.</li>
          <li>Pick the device whose USB ID reads 1A86 55DB, Interface 2 (a CH347T in mode 1), or 1A86 5512 (a CH341).</li>
          <li>Choose WinUSB as the driver, then Install (or Replace) Driver.</li>
        </ol>
        <p>
          WCH's own CH341 driver and tools then no longer see this dongle,
          until its driver is switched back.
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Tried on our bench with a CH347T (its Interface 2 on WinUSB); a CH341
          the same way, not tried yet.
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

    <section v-if="platform === 'linux'" :class="card">
      <h2 class="mb-1 text-lg font-semibold">3.1 Optional, a CH341 on Linux: the kernel's spi-ch341</h2>
      <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">A CH347 skips this: the kernel takes only its serial port and leaves the rest to the browser.</p>
      <div class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          Recent kernels have <code>spi-ch341</code>, a driver
          for the CH341 as an SPI master. It takes the dongle each time it's
          plugged in, and the browser can't take it back. Release the dongle
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
        Pick the dongle in the browser's list: the site opens it and asks
        which I2C addresses answer.
      </p>
      <SetupCheck :platform="platform" />
    </section>
  </main>
</template>
