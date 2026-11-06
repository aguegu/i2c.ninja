<script setup>
// The HMC5883L live on the CH341 dongle: Earth's field on three axes, a
// compass from it (held level), the board's own field calibrated out
// (MagnetometerViews), its self test, its settings
import { reactive } from 'vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import MagnetometerViews from '../components/MagnetometerViews.vue';
import SpecTable from '../components/SpecTable.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { useHmc5883l } from '../lib/useHmc5883l.js';
import { useHardIron } from '../lib/useHardIron.js';

const WINDOW_MS = 30000;
const AXES = ['x', 'y', 'z'];
// its settings, from its datasheet (Form #900405 Rev E), and the ones this page picks
const SPECS = [
  ['Range', 'eight gains, ±0.88 to ±8.1 gauss (1370 to 230 counts a gauss)', '±1.3 gauss, 1090 counts a gauss (the default): Earth\'s field is under 0.65'],
  ['Averaging', '1, 2, 4 or 8 samples a reading', '8'],
  ['Rate', '0.75 to 75 readings a second, or up to 160 measured one at a time', '15 a second'],
  ['Mode', 'continuous, single measurement, or idle', 'continuous; idle when stopped'],
  ['Address', '0x1E only', '0x1E'],
  ['Interface', 'I2C, 100 or 400 kHz (and a 3.4 MHz high-speed mode)', 'I2C, 400 kHz'],
  ['Extras', 'a self test (about 1.1 gauss of its own, either way); a data-ready pin', 'the self test'],
];

const mag = reactive(useHmc5883l());
const cal = reactive(useHardIron(mag.onReading, { windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">HMC5883L</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Honeywell's 3-axis magnetometer: Earth's magnetic field, in microtesla, along three axes, so a compass. Live over the CH341 dongle, 15 readings a second.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-hmc5883l.svg" alt="A CH341T dongle wired to an HMC5883L breakout whose pins run RDY, SCL, SDA, 3vo, GND, VIN: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; RDY and 3vo free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC to VIN, GND, SCL and SDA; RDY and 3vo stay free. The axes printed on it are the ones read below: X its nose, Y to the left, Z out of the board. Keep it away from steel, magnets and the laptop: they add their own fields. New to the dongle? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="mag.state === 'idle' || mag.state === 'connecting'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="mag.state === 'connecting'" @click="mag.connect">
        {{ mag.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="mag.disconnect">Stop</button>
      <span v-if="mag.state !== 'idle' && mag.state !== 'connecting'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">0x1E · 400 kHz · ±1.3 gauss · 15 Hz</span>
    </section>
    <div v-if="mag.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ mag.failure.title }}</p>
      <p v-if="mag.failure.detail" class="mt-1">{{ mag.failure.detail }}</p>
      <p v-if="mag.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ mag.failure.error }}</p>
    </div>

    <MagnetometerViews :cal="cal" :running="mag.state === 'running'" :window-ms="WINDOW_MS" />


    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">Self test</h2>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="mag.state !== 'running'" @click="mag.runSelfTest">
          {{ mag.state === 'testing' ? 'Testing…' : 'Run it' }}
        </button>
        <span v-if="mag.selfTest" class="font-semibold" :class="mag.selfTest.pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">{{ mag.selfTest.pass ? '✓ passed' : '✗ out of range' }}</span>
      </div>
      <p class="mt-2 leading-relaxed">
        The chip can make its own field: a current of about 10 mA through straps beside each sensor adds about 1.1 gauss (110 µT) along all three axes. It measures with and without it and reports the difference, so Earth's field drops out. Once pushing one way, once the other; each axis should read 243 to 575 counts (at the gain the test uses), and minus that the other way.
      </p>
      <table v-if="mag.selfTest" class="mt-3 w-full max-w-xl text-left font-mono text-sm tabular-nums">
        <thead class="text-slate-500 dark:text-slate-400"><tr><th class="py-1 font-normal">axis</th><th class="font-normal">positive</th><th class="font-normal">negative</th><th class="font-normal">datasheet's limits</th></tr></thead>
        <tbody>
          <tr v-for="k in AXES" :key="k" class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1">{{ k }}</td><td>{{ mag.selfTest.positive[k] }}</td><td>{{ mag.selfTest.negative[k] }}</td><td>±243 to ±575</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.honeywell.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">Honeywell</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/magnetism" class="text-emerald-700 underline dark:text-emerald-400">Magnetism and the compass</RouterLink>
      </p>
    </section>
  </main>
</template>
