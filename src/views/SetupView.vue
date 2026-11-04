<script setup>
import { ref } from 'vue';
import SetupCheck from '../components/SetupCheck.vue';

// the platform the page opened on, picked by default
function detect() {
  const p = (navigator.userAgentData?.platform || navigator.userAgent).toLowerCase();
  if (p.includes('android')) return 'android';
  if (p.includes('cros') || p.includes('chrome os')) return 'chromeos';
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  return 'linux';
}

// tried: whether these steps have run on our bench; the others are what the
// platforms document, waiting for a bench to try them
const PLATFORMS = [
  { id: 'linux', label: 'Linux', tried: true }, // r8845: Manjaro 7.2.9, Chromium, 2026-11-04
  { id: 'windows', label: 'Windows', tried: false },
  { id: 'macos', label: 'macOS', tried: false },
  { id: 'android', label: 'Android', tried: false },
  { id: 'chromeos', label: 'ChromeOS', tried: false },
];
const platform = ref(detect());

const UDEV_RULE = 'SUBSYSTEM=="usb", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="5512", TAG+="uaccess"';
const UDEV_COMMANDS = `echo '${UDEV_RULE}' | sudo tee /etc/udev/rules.d/70-ch341.rules
sudo udevadm control --reload`;
const RELEASE_COMMAND = `sudo sh -c 'for i in /sys/bus/usb/drivers/spi-ch341/*:*; do [ -e "$i" ] && echo "\${i##*/}" && echo -n "\${i##*/}" > /sys/bus/usb/drivers/spi-ch341/unbind; done'`;
const BLOCK_COMMANDS = `echo 'blacklist spi_ch341' | sudo tee /etc/modprobe.d/ch341-no-spi.conf
sudo rmmod spi_ch341`;

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const code = 'overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900';
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">
      Setup
    </h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      What a CH341 dongle needs before this site can use it: a browser with
      WebUSB, the dongle's jumpers, once per computer a permission, then a
      check.
    </p>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">
        1. A browser with WebUSB
      </h2>
      <p class="leading-relaxed">
        Chrome, Edge, Opera, Brave or another Chromium, on a computer or on
        Android. Firefox and Safari have no WebUSB.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">
        2. The dongle
      </h2>
      <p class="mb-3 leading-relaxed">
        A CH341T "2-in-1" dongle (USB to I2C / TTL). Set its jumpers with it
        unplugged: <b>yellow on I2C</b> (on TTL it's a serial port instead),
        <b>green on 3V3</b> (VCC and the bus at 3.3V). Then four wires to the
        device: SDA, SCL, GND, VCC.
      </p>
      <img
        src="/setup.svg"
        alt="A CH341T dongle, yellow jumper on I2C and green on 3V3, wired SDA, SCL, GND and VCC to a GY-521 (MPU-6050) board"
        class="w-full rounded-lg bg-white"
      >
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">
        3. Once per computer: let the browser open it
      </h2>
      <div
        class="mb-4 flex flex-wrap gap-2"
        role="tablist"
      >
        <button
          v-for="p in PLATFORMS"
          :key="p.id"
          role="tab"
          :aria-selected="platform === p.id"
          class="rounded-full border px-3 py-1 text-sm"
          :class="platform === p.id
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 dark:border-slate-600'"
          @click="platform = p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <p
        v-if="!PLATFORMS.find((p) => p.id === platform).tried"
        class="mb-3 text-sm text-slate-500 dark:text-slate-400"
      >
        Not tried on our bench yet: these are the platform's documented steps.
      </p>

      <div
        v-if="platform === 'linux'"
        class="flex flex-col gap-3 leading-relaxed"
      >
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

      <div
        v-else-if="platform === 'windows'"
        class="flex flex-col gap-3 leading-relaxed"
      >
        <p>
          Windows lets a browser open only devices on its WinUSB driver, and
          the CH341 doesn't ask for it by itself. Bind it with
          <a
            href="https://zadig.akeo.ie"
            class="text-emerald-600 underline"
          >Zadig</a>:
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

      <div
        v-else-if="platform === 'macos'"
        class="leading-relaxed"
      >
        <p>
          Nothing to do: macOS lets the browser open the dongle. If WCH's own
          CH341 driver is installed and holds the dongle, the check below says
          it's busy.
        </p>
      </div>

      <div
        v-else-if="platform === 'android'"
        class="flex flex-col gap-3 leading-relaxed"
      >
        <p>
          Chrome on the phone, the dongle on a USB OTG adapter or cable. Chrome
          asks once whether this site may use it.
        </p>
        <p>
          Some phones keep OTG off until it's switched on in their settings.
        </p>
      </div>

      <div
        v-else
        class="leading-relaxed"
      >
        <p>
          Nothing to do: Chrome asks once whether this site may use the dongle.
        </p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">
        4. Check
      </h2>
      <p class="mb-3 leading-relaxed">
        Pick the dongle in the browser's list: the site opens it and asks
        which I2C addresses answer.
      </p>
      <SetupCheck :platform="platform" />
    </section>
  </main>
</template>
