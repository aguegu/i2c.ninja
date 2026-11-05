<script setup>
// the home page: what this is, a card a device, the guides, the bench
import { DEVICES, GUIDES } from '../lib/devices.js';

const hasWebUsb = 'usb' in navigator;
const card = 'flex flex-col rounded-xl bg-white p-4 shadow-sm ring-emerald-600 transition hover:shadow-md hover:ring-2 focus-visible:ring-2 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-6 p-4">
    <p class="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">
      I2C devices live in the browser: a CH341 USB-to-I2C dongle over WebUSB,
      the device drivers from atiic, their readings charted and explained.
    </p>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB: the device pages will need Chrome, Edge or
      another Chromium (Chrome on Android too, with an OTG cable).
    </p>

    <section>
      <h2 class="mb-3 text-lg font-semibold">Devices</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="d in DEVICES" :key="d.to" :to="d.to" :class="card">
          <span class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{{ d.kind }}</span>
          <span class="mt-1 text-lg font-semibold">{{ d.name }}</span>
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ d.maker }}</span>
          <span class="mt-2 flex-1 leading-relaxed">{{ d.measures }}</span>
          <span class="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ d.bus }}</span>
        </RouterLink>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        More return one at a time, each once its driver and its page have run on a real device.
      </p>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold">Learn</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="g in GUIDES" :key="g.to" :to="g.to" :class="card">
          <span class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{{ g.kind }}</span>
          <span class="mt-1 text-lg font-semibold">{{ g.name }}</span>
          <span class="mt-2 flex-1 leading-relaxed">{{ g.measures }}</span>
        </RouterLink>
      </div>
    </section>

    <section class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <h2 class="mb-2 text-lg font-semibold">The bench</h2>
      <p class="mb-3 leading-relaxed">
        A CH341 dongle with its jumpers on I2C and 3V3, four wires to the
        device, a Chromium browser that may open it.
      </p>
      <RouterLink to="/get-started" class="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800">
        Set it up
      </RouterLink>
    </section>
  </main>
</template>
