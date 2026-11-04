<script setup>
const hasWebUsb = 'usb' in navigator;
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <p class="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">
      I2C devices live in the browser: a CH341 USB-to-I2C dongle over WebUSB,
      the device drivers from atiic, their readings charted.
    </p>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB: the device pages will need Chrome, Edge or
      another Chromium (Chrome on Android too, with an OTG cable).
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <section class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <h2 class="mb-2 text-lg font-semibold">Coming back</h2>
        <p class="leading-relaxed">
          i2c.ninja is being rebuilt on atiic 1.0, with WCH's CH341 as the
          bridge in place of the old Atiic serial and Bluetooth modules. Device
          pages return one at a time, each once its driver has run on a real
          device, the MPU-6050 first.
        </p>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <h2 class="mb-2 text-lg font-semibold">The bench</h2>
        <p class="mb-3 leading-relaxed">
          A CH341T dongle with its jumpers on I2C and 3V3, four wires to the
          device, a Chromium browser that may open it.
        </p>
        <RouterLink to="/setup" class="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800">
          Set it up
        </RouterLink>
      </section>
    </div>
  </main>
</template>
