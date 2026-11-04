<script setup>
const ATIIC = 'https://github.com/aguegu/atiic';
const hasWebUsb = 'usb' in navigator;
</script>

<template>
  <main>
    <h1>i2c.ninja</h1>
    <p class="lead">
      I2C devices live in the browser: a CH341 USB-to-I2C dongle over WebUSB,
      the device drivers from <a :href="ATIIC">atiic</a>, their readings charted.
    </p>

    <section>
      <h2>Coming back</h2>
      <p>
        i2c.ninja is being rebuilt on atiic 1.0, with WCH's CH341 as the bridge
        in place of the old Atiic serial and Bluetooth modules. Device pages
        return one at a time, each once its driver has run on a real device,
        the MPU-6050 first.
      </p>
    </section>

    <section>
      <h2>The bench</h2>
      <p>
        A CH341T dongle with its jumpers on I2C and 3V3, four wires to the
        device: <a :href="`${ATIIC}/blob/main/docs/setup.md`">the setup, step by step</a>.
      </p>
      <p
        v-if="!hasWebUsb"
        class="warn"
      >
        This browser has no WebUSB: the device pages will need Chrome, Edge or
        another Chromium.
      </p>
    </section>
  </main>
</template>

<style>
:root {
  --bg: #ffffff;
  --fg: #1d1f23;
  --muted: #5d636b;
  --link: #1f5fa8;
  --warn: #b3261e;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15171a;
    --fg: #e4e6ea;
    --muted: #9aa1aa;
    --link: #7fb2f0;
    --warn: #f28b82;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.6 system-ui, sans-serif;
}

main {
  max-width: 44rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  margin: 0 0 0.25rem;
}

h2 {
  font-size: 1.1rem;
  margin: 1.75rem 0 0.25rem;
}

.lead {
  color: var(--muted);
}

a {
  color: var(--link);
}

.warn {
  color: var(--warn);
}
</style>
