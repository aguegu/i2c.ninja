<script setup>
// The HMC5883L live on the CH341 dongle: Earth's field on three axes, a
// compass from it (held level), the board's own field calibrated out, its
// self test
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import CompassRose from '../components/CompassRose.vue';
import VectorViews from '../components/VectorViews.vue';
import AttitudeViews from '../components/AttitudeViews.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { DEG } from '../lib/tilt.js';
import { useHmc5883l } from '../lib/useHmc5883l.js';

const WINDOW_MS = 30000;
const FLOOR_UT = 60; // the chart's least half-range: Earth's field, 25-65 uT
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
const FIELD_COLOR = '#7c3aed'; // the field's arrows: not gravity's red
const SCALE_UT = 50; // the views' reference circle: about Earth's field

const mag = reactive(useHmc5883l({ windowMs: WINDOW_MS }));
const b = computed(() => mag.latest);
const ok = computed(() => b.value && AXES.every((k) => b.value[k] !== null));
const size = computed(() => (ok.value ? Math.hypot(b.value.x, b.value.y, b.value.z) : null));
const level = computed(() => (ok.value ? Math.hypot(b.value.x, b.value.y) : null));
// clockwise from magnetic north to the nose (x), y to its left, held level:
// north is where the field's level part points
const heading = computed(() => (ok.value ? (Math.atan2(b.value.y, b.value.x) * DEG + 360) % 360 : null));
// the field's angle below level (z up): the dip
const dip = computed(() => (ok.value ? Math.atan2(-b.value.z, level.value) * DEG : null));
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">HMC5883L</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        Honeywell's 3-axis magnetometer: Earth's magnetic field, in microtesla, along three axes, so a compass. Live over the CH341 dongle, 15 readings a second.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-hmc5883l.svg" alt="A CH341T dongle wired to an HMC5883L breakout whose pins run RDY, SCL, SDA, 3vo, GND, VIN: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; RDY and 3vo free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC to VIN, GND, SCL and SDA; RDY and 3vo stay free. The axes printed on it are the ones read below: X its nose, Y to the left, Z out of the board. Keep it away from steel, magnets and the laptop: they add their own fields.
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

    <div class="grid gap-4 md:grid-cols-[1fr_auto]">
      <section :class="card">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="k in AXES" :key="k">
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ k }}</p>
            <p class="font-mono text-3xl tabular-nums">{{ fmt(b?.[k]) }} <span class="text-base">µT</span></p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">|B|, all three</p>
            <p class="font-mono text-3xl tabular-nums">{{ fmt(size) }} <span class="text-base">µT</span></p>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Earth's field is 25 to 65 µT over its surface. It isn't level: it dips into the ground, steeply near the poles, so held level the z axis reads a big share of it. Here the field dips {{ fmt(dip, 0) }}° below level{{ mag.calibrated ? '' : ' (before calibrating, the board\'s own field skews this)' }}.
        </p>
      </section>
      <section :class="[card, 'flex flex-col items-center']">
        <CompassRose :heading="heading" />
        <p class="text-xs text-slate-500 dark:text-slate-400">magnetic north, held level</p>
      </section>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">Calibrate</h2>
        <button v-if="!mag.calibrating" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="mag.state !== 'running'" @click="mag.startCalibration">{{ mag.calibrated ? 'Again' : 'Start' }}</button>
        <button v-else class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700" @click="mag.finishCalibration">Done</button>
        <button v-if="mag.calibrated" class="text-sm text-slate-500 underline dark:text-slate-400" @click="mag.clearCalibration">Clear</button>
        <span v-if="mag.calibrated" class="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">offset {{ fmt(mag.offset.x) }}, {{ fmt(mag.offset.y) }}, {{ fmt(mag.offset.z) }} µT</span>
      </div>
      <p class="mt-2 leading-relaxed">
        The board, its pins and anything steel nearby carry fields of their own, added to Earth's, the same whichever way it's turned: "hard iron". Press Start, turn the board slowly all the way round, flat, then on its edges and upside down, and press Done: each axis's middle, between the largest and smallest it read, is the board's own field, and it's taken off every reading from then on.
      </p>
      <table v-if="mag.calibrating && mag.span" class="mt-3 w-full max-w-xl text-left font-mono text-sm tabular-nums">
        <thead class="text-slate-500 dark:text-slate-400"><tr><th class="py-1 font-normal">axis</th><th class="font-normal">smallest</th><th class="font-normal">largest</th><th class="font-normal">middle</th></tr></thead>
        <tbody>
          <tr v-for="k in AXES" :key="k" class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1">{{ k }}</td><td>{{ fmt(mag.span.min[k]) }}</td><td>{{ fmt(mag.span.max[k]) }}</td><td>{{ fmt((mag.span.min[k] + mag.span.max[k]) / 2) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section :class="card">
      <h2 class="mb-2 font-semibold">What the chip feels, three ways</h2>
      <VectorViews :x="b?.x ?? 0" :y="b?.y ?? 0" :z="b?.z ?? 0" unit="µT" :scale="SCALE_UT" :digits="1" :color="FIELD_COLOR" />
      <p class="mt-3 leading-relaxed">
        The field as an arrow, seen from three sides, the board (its outline) still, in its own axes as printed{{ mag.calibrated ? '' : ' (calibrate first: the board\'s own field shifts it)' }}. Lying level it points north and down into the ground: from above you see only its level part, pointing north; from the side, how steeply it dips. Turn the board and the arrow swings the other way on the screen, still pointing the same way in the room.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 font-semibold">The board against the field: the field held still</h2>
      <AttitudeViews :x="b?.x ?? 0" :y="b?.y ?? 0" :z="b?.z ?? -1" field="magnetic" />
      <p class="mt-3 leading-relaxed">
        As on the ADXL345's page with gravity, but the field line held still instead, drawn down the page, and the board turned against it. The side views show how the board's nose and side tilt against the field; along the field line, a turn about it can't be seen, just as an accelerometer can't see a turn about the vertical. The field line isn't vertical (it dips into the ground at an angle) and the two together, gravity and the field, are what fix every turn: that's a tilt-compensated compass.
      </p>
    </section>

    <section :class="card">
      <LiveChart title="Magnetic field" unit="µT" :series="SERIES" :values="b ? [b.x, b.y, b.z] : []" :source="mag.source" :window-ms="WINDOW_MS" :floor="FLOOR_UT" :digits="1" />
    </section>

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
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>Resistors that feel a field.</b> Each axis is a bridge of thin strips of permalloy, a nickel-iron alloy, whose resistance changes with a magnetic field along the strip's direction: anisotropic magneto-resistance. A field along the axis unbalances the bridge into a small voltage, which a 12-bit converter reads.
      </p>
      <p class="mb-2">
        <b>Set and reset.</b> Before each reading the chip sends a brief, strong current pulse through a strap beside the strips one way ("set"), measures, pulses it the other way ("reset"), measures again, and reports half the difference. The sensor's own offset, and its drift with temperature, cancel; the pulses also wipe out any magnetism the strips picked up.
      </p>
      <p>
        <b>A compass from it.</b> Held level, the part of the field along the ground points to magnetic north: the heading is the angle from the board's nose (x) to it. Tilted, some of the vertical field leaks into x and y and the heading drifts; an accelerometer telling the tilt fixes that. Magnetic north isn't true north: the gap, the declination, depends on where you are.
      </p>
    </section>
  </main>
</template>
