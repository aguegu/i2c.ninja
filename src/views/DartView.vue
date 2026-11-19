<script setup>
// Dart — our own wireless USB-to-I2C bridge, over Bluetooth LE. Still in
// development; this page is its manual. The per-OS setup is in tabs, as Get
// started's is; iPhone/iPad (Bluefy) is added since Dart reaches those over
// Bluetooth. The Bluetooth-connect steps live here (not on Get started) so
// that page stays about the plain USB bridges.
import { ref } from 'vue';
import { detectPlatform } from '../lib/dongle.js';

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const code = 'whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const TAB_ON = 'border-emerald-600 bg-emerald-600 text-white';
const TAB_OFF = 'border-slate-300 dark:border-slate-600';

const PLATFORMS = [
  { id: 'linux', label: 'Linux' },
  { id: 'windows', label: 'Windows' },
  { id: 'macos', label: 'macOS' },
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iPhone / iPad' },
];
// detectPlatform() doesn't know iOS (its USB page has no iOS tab); a Dart
// reaches iPhone/iPad over Bluetooth, so detect it here — iPad in desktop mode
// reports as a Mac, told apart by its touch points
const detect = () => {
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && (navigator.maxTouchPoints || 0) > 1)) return 'ios';
  return detectPlatform();
};
const platform = ref(detect());

const DART_UDEV = `echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="ffff", ATTRS{idProduct}=="da92", TAG+="uaccess"' | sudo tee /etc/udev/rules.d/70-dart.rules
sudo udevadm control --reload`;
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">Dart — a wireless bridge</h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      <b>Dart</b> is a USB-to-I²C bridge of our own that also works over
      <b>Bluetooth&nbsp;LE</b>: the same sensors and the same i2c.ninja pages,
      with no USB bridge and no wires, running from a coin cell. It is still in
      <b>development</b> — this page is its manual. For a plain USB bridge
      instead, see <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </p>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Connect over Bluetooth</h2>
      <p class="mb-3 max-w-3xl leading-relaxed">
        On the <b>Connect</b> button, pick <i>Dart over Bluetooth</i> from the
        caret (<span aria-hidden="true">&#9662;</span>) menu beside it, instead
        of a USB bridge, and choose your Dart (it shows as
        <code>Dart-XXXX</code>) in the browser's chooser. No udev rule and no
        driver: it's Bluetooth, not USB.
      </p>
      <p class="max-w-3xl leading-relaxed">
        That menu appears only when the browser has <b>Web Bluetooth</b>:
        Chrome, Edge or another Chromium, on a computer or on Android. Firefox
        and Safari have none; on an iPhone or iPad it takes a Web Bluetooth
        browser, such as Bluefy.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">What your system needs</h2>
      <p class="mb-3 max-w-3xl leading-relaxed">
        For Web Bluetooth (the caret), and for USB — a Dart also enumerates as a
        USB device (ID <code>ffff:da92</code>) for WebUSB, like any bridge. Pick
        yours:
      </p>
      <div class="mb-4 flex flex-wrap gap-2" role="tablist">
        <button v-for="p in PLATFORMS" :key="p.id" role="tab" :aria-selected="platform === p.id" class="rounded-full border px-3 py-1 text-sm" :class="platform === p.id ? TAB_ON : TAB_OFF" @click="platform = p.id">
          {{ p.label }}
        </button>
      </div>

      <div v-if="platform === 'linux'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          <b>Bluetooth:</b> still experimental on Linux, so Chrome keeps it
          behind a flag and the caret stays hidden until you turn it on: open
          <code>chrome://flags</code>, enable <b>Experimental Web Platform
            features</b> (or, if your build lists it, <b>Web Bluetooth</b>), and
          restart the browser. It also wants BlueZ&nbsp;5.41 or newer.
        </p>
        <p><b>USB:</b> give it a udev rule, then unplug it and plug it back in:</p>
        <pre :class="code">{{ DART_UDEV }}</pre>
      </div>

      <div v-else-if="platform === 'windows'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p><b>Bluetooth:</b> Web Bluetooth is on already — just turn Bluetooth on.</p>
        <p>
          <b>USB:</b> no Zadig needed — a Dart asks Windows for the WinUSB driver
          itself, so the browser can open it.
        </p>
      </div>

      <div v-else-if="platform === 'macos'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p><b>Bluetooth:</b> Web Bluetooth is on already — just turn Bluetooth on.</p>
        <p><b>USB:</b> nothing to set up; macOS lets the browser open it.</p>
      </div>

      <div v-else-if="platform === 'android'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p><b>Bluetooth:</b> Web Bluetooth is on already in Chrome — just turn Bluetooth on.</p>
        <p>
          <b>USB:</b> over an OTG adapter, Chrome prompts for the device; nothing
          to install.
        </p>
      </div>

      <div v-else-if="platform === 'ios'" class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>
          <b>Bluetooth:</b> no built-in browser has Web Bluetooth (they all run
          on Safari's engine), so install a Web Bluetooth browser &mdash;
          <a href="https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055" :class="link"><b>Bluefy</b></a>, from the App Store &mdash; turn Bluetooth on in
          Settings, and open <b>i2c.ninja</b> inside Bluefy (not Safari). Tested
          on an iPad with Bluefy.
        </p>
        <p><b>USB:</b> iOS has no WebUSB at all — reach a Dart over Bluetooth.</p>
      </div>
    </section>
  </main>
</template>
