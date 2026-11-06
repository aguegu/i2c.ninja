<script setup>
// The ADXL345 live on the CH341 dongle: its three axes in g, the tilt
// they give at rest, and its self test against the datasheet's limits
import { reactive, computed } from 'vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import AccelerometerViews from '../components/AccelerometerViews.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useAdxl345 } from '../lib/useAdxl345.js';

const WINDOW_MS = 10000;
const LSB_PER_G = 256; // full resolution (its datasheet's typical)
const AXES = ['x', 'y', 'z'];

const adxl = reactive(useAdxl345({ windowMs: WINDOW_MS }));
const a = computed(() => adxl.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">ADXL345</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        Analog Devices' 3-axis accelerometer: the push on a tiny mass inside it, in g, along three axes, so gravity at rest, and every shake. Live over the CH341 dongle, at 100 samples a second.
        First time here? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
        New to these numbers? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn the IMU</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-adxl345.svg" alt="A CH341T dongle wired to an ADXL345 breakout whose pins run VIN, 3V3, GND, CS, INT1, INT2, SDO, SDA, SCL: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; the other five free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC to VIN, GND, SCL and SDA. Leave CS, SDO and the INT pins free: the board answers on I2C at 0x53 (SDO to 3V3 would move it to 0x1D). The axes printed on the board are the ones charted below.
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

    <AccelerometerViews :a="a" :source="adxl.source" :window-ms="WINDOW_MS">
      <template #note>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">At rest |a| is about 1 g whichever way it's turned: gravity, shared among the axes by the tilt. Shake it and |a| moves; drop it onto a cushion and it falls toward 0 g.</p>
      </template>
    </AccelerometerViews>

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
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>A mass on springs.</b> Inside is a tiny proof mass of polysilicon, hung on polysilicon springs over the silicon. Push the chip and the mass lags behind until the springs pull it along: the reading points with the push. Held still, the springs hold the mass up against gravity, so it reads 1 g pointing up; falling freely, nothing has to hold it, and it reads 0 g. Tilted, that 1 g is shared among the axes: that's where the roll and pitch above come from.
      </p>
      <SvgDrawing src="/adxl345-mass-springs.svg" alt="Three moments of a mass on springs in a chip: held still the mass sags and it reads 1 g up; pushed to the right (seen from above) the mass lags left and it reads the push to the right; falling, the springs relax and it reads 0 g" class="mx-auto mb-3 w-full max-w-2xl" />
      <p class="mb-2">
        <b>Read by capacitors.</b> Plates on the mass sit between fixed plates: a differential capacitor. Centred, the two gaps and the two capacitances are equal; when the mass moves, one gap narrows and the other widens, unbalancing the pair. How much tells the size of the acceleration; which side, its direction (the chip finds both by phase-sensitive demodulation). The datasheet doesn't draw the real layout, so this is a sketch of one finger.
      </p>
      <SvgDrawing src="/adxl345-capacitor.svg" alt="A finger on the mass between two fixed plates, C1 and C2: centred, equal gaps, C1 equals C2 and it reads 0; moved toward C1, C1 grows and C2 shrinks: the difference is how much, the bigger one which way" class="mx-auto mb-3 w-full max-w-2xl" />
      <p>
        <b>The numbers:</b> ±2 to ±16 g; in full resolution every range keeps 256 counts a g (3.9 mg a count), from 10 bits at ±2 g to 13 bits at ±16 g. Here it runs at ±16 g and 100 Hz; it can sample up to 3200 Hz, and its own tap, free-fall and activity detection aren't used.
      </p>
    </section>
  </main>
</template>
