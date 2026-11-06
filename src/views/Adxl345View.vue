<script setup>
// The ADXL345 live on the CH341 dongle: its three axes in g, the tilt
// they give at rest, and its self test against the datasheet's limits
import { reactive, computed } from 'vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import AccelerometerViews from '../components/AccelerometerViews.vue';
import SpecTable from '../components/SpecTable.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useAdxl345 } from '../lib/useAdxl345.js';

const WINDOW_MS = 10000;
const LSB_PER_G = 256; // full resolution (its datasheet's typical)
const AXES = ['x', 'y', 'z'];
// its settings, from its datasheet (Rev. G), and the ones this page picks
const SPECS = [
  ['Range', '±2, ±4, ±8 or ±16 g', '±16 g: room for any shake'],
  ['Resolution', '10 bits, or full resolution: 3.9 mg a count at every range', 'full resolution, 256 counts a g'],
  ['Data rate', '0.1 to 3200 readings a second', '100 a second'],
  ['Address', '0x53, or 0x1D with SDO/ALT ADDRESS high', '0x53 or 0x1D, whichever answers'],
  ['Interface', 'I2C or SPI', 'I2C, 400 kHz'],
  ['Extras', 'tap, double tap, activity, free-fall detection; a 32-reading FIFO; a self test', 'the self test'],
];

const adxl = reactive(useAdxl345({ windowMs: WINDOW_MS }));
const a = computed(() => adxl.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">ADXL345</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Analog Devices' 3-axis accelerometer: the push on a tiny mass inside it, in g, along three axes, so gravity at rest, and every shake. Live over the CH341 dongle, at 100 samples a second.
        New to these numbers? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn the IMU</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-adxl345.svg" alt="A CH341T dongle wired to an ADXL345 breakout whose pins run VIN, 3V3, GND, CS, INT1, INT2, SDO, SDA, SCL: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; the other five free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC to VIN, GND, SCL and SDA. Leave CS, SDO and the INT pins free: the board answers on I2C at 0x53 (SDO to 3V3 would move it to 0x1D). The axes printed on the board are the ones charted below. New to the dongle? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="adxl.state === 'idle' || adxl.state === 'connecting'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="adxl.state === 'connecting'" @click="adxl.connect">
        {{ adxl.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="adxl.disconnect">Stop</button>
      <span v-if="adxl.address !== null && adxl.state !== 'idle'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(adxl.address) }} · 400 kHz · ±16 g, full resolution · 100 Hz</span>
    </section>
    <div v-if="adxl.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ adxl.failure.title }}</p>
      <p v-if="adxl.failure.detail" class="mt-1">{{ adxl.failure.detail }}</p>
      <p v-if="adxl.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ adxl.failure.error }}</p>
    </div>

    <AccelerometerViews :a="a" :source="adxl.source" :window-ms="WINDOW_MS" />

    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">Self test</h2>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="adxl.state !== 'running'" @click="adxl.runSelfTest">
          {{ adxl.state === 'testing' ? 'Testing… hold still' : 'Run it (hold still)' }}
        </button>
        <span v-if="adxl.selfTest" class="font-semibold" :class="adxl.selfTest.pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">{{ adxl.selfTest.pass ? '✓ passed' : '✗ out of range' }}</span>
      </div>
      <p class="mt-2 leading-relaxed">
        The chip can push its own mass: an electrostatic force moves it as an acceleration would. Its datasheet's test averages ten readings, turns the force on, lets it settle, averages ten more, and compares the change with its limits (here for a 3.3 V supply; the force grows with the supply squared).
      </p>
      <table v-if="adxl.selfTest" class="mt-3 w-full max-w-xl text-left font-mono text-sm tabular-nums">
        <thead class="text-slate-500 dark:text-slate-400">
          <tr><th class="py-1 font-normal">axis</th><th class="font-normal">change</th><th class="font-normal">in g</th><th class="font-normal">datasheet's limits</th></tr>
        </thead>
        <tbody>
          <tr v-for="k in AXES" :key="k" class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1">{{ k }}</td>
            <td>{{ adxl.selfTest.change[k].toFixed(0) }}</td>
            <td>{{ (adxl.selfTest.change[k] / LSB_PER_G).toFixed(2) }}</td>
            <td>{{ adxl.selfTest.limits[k][0].toFixed(0) }} to {{ adxl.selfTest.limits[k][1].toFixed(0) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.analog.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">Analog Devices</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/acceleration" class="text-emerald-700 underline dark:text-emerald-400">Acceleration and gravity</RouterLink>
      </p>
    </section>
  </main>
</template>
