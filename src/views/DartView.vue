<script setup>
// Dart — our own wireless USB-to-I2C bridge, over Bluetooth LE. Still in
// development; this page is its manual. The Bluetooth-connect steps live here
// (not on Get started) so that page stays about the plain USB bridges.
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const code = 'whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900';
const link = 'text-emerald-700 underline dark:text-emerald-400';
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
      <p class="mb-3 max-w-3xl leading-relaxed">
        That menu appears only when the browser has <b>Web Bluetooth</b>:
        Chrome, Edge or another Chromium, on a computer or on Android. Firefox
        and Safari have none; on an iPhone or iPad it takes a Web Bluetooth
        browser, such as Bluefy.
      </p>
      <div class="flex max-w-3xl flex-col gap-3 leading-relaxed">
        <p>Android, macOS and Windows have Web Bluetooth on already.</p>
        <p>
          On <b>Linux</b> it is still experimental, so Chrome keeps it behind a
          flag and the caret stays hidden until you turn it on: open
          <code>chrome://flags</code>, enable <b>Experimental Web Platform
            features</b> (or, if your build lists it, <b>Web Bluetooth</b>), and
          restart the browser. It also wants BlueZ&nbsp;5.41 or newer.
        </p>
        <p>
          On an <b>iPhone or iPad</b>, no built-in browser has Web Bluetooth
          (they all run on Safari's engine), so install a Web Bluetooth browser
          &mdash; <b>Bluefy</b>, from the App Store &mdash; turn Bluetooth on in
          Settings, and open <b>i2c.ninja</b> inside Bluefy (not Safari). Tested
          on an iPad with Bluefy.
        </p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Over USB</h2>
      <p class="mb-3 max-w-3xl leading-relaxed">
        A Dart also enumerates as a USB device (ID <code>ffff:da92</code>) for
        WebUSB, like any bridge. On <b>Linux</b> give it a udev rule:
      </p>
      <pre :class="code">{{ DART_UDEV }}</pre>
      <p class="mt-3 max-w-3xl leading-relaxed">
        then unplug it and plug it back in. On <b>Windows</b> it needs no Zadig
        &mdash; it asks for WinUSB itself; <b>macOS</b> and <b>Android</b> need
        nothing.
      </p>
    </section>
  </main>
</template>
