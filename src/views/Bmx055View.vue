<script setup>
// The Bosch BMX055 live: three chips in one package, an accelerometer, a gyro
// and a magnetometer, read together (lib/useBmx055.js). Tabs (in the address:
// #accelerometer, the default, #gyro, #magnetometer): the same views as the
// ADXL345's, the ITG-3200's and the HMC5883L's pages, so the three can be
// told apart and compared.
import { reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveSettings from '../components/LiveSettings.vue';
import AccelerometerViews from '../components/AccelerometerViews.vue';
import GyroViews from '../components/GyroViews.vue';
import MagnetometerViews from '../components/MagnetometerViews.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { canConnect, hex } from '../lib/dongle.js';
import { useBmx055 } from '../lib/useBmx055.js';
import { useTurned } from '../lib/useTurned.js';
import { useHardIron } from '../lib/useHardIron.js';

const WINDOW_MS = 10000; // the accelerometer's and the gyro's charts
const MAG_WINDOW_MS = 30000; // the field's: a calibration turn takes longer

const imu = reactive(useBmx055({ windowMs: WINDOW_MS }));
const turned = reactive(useTurned(imu.onGyro));
const cal = reactive(useHardIron(imu.onMag, { windowMs: MAG_WINDOW_MS }));

const TABS = [
  { key: 'accelerometer', label: 'Accelerometer', hash: '#accelerometer' },
  { key: 'gyro', label: 'Gyro', hash: '#gyro' },
  { key: 'magnetometer', label: 'Magnetometer', hash: '#magnetometer' },
];
const route = useRoute();
const router = useRouter();
const tab = computed(() => TABS.find((t) => t.hash === route.hash)?.key ?? 'accelerometer');
const pick = (t) => router.replace({ hash: t.hash });
const tabOn = 'border-emerald-600 text-emerald-700 dark:text-emerald-400';
const tabOff = 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100';

const a = computed(() => imu.latest?.accel ?? null);
const g = computed(() => imu.latest?.gyro ?? null);
const running = computed(() => imu.state === 'running');
// Hard iron on a CJMCU-900F, measured (2026-11-19, turned flat a full round,
// in the board's axes): its own field's level part, and Earth's level part,
// the radius the readings circle at. Drawn to scale: x right, y up.
const IRON = { x: -69, y: -33 }; // uT
const EARTH_LEVEL_UT = 38;
const IRON_UT = Math.hypot(IRON.x, IRON.y);
const ROCK_DEG = Math.asin(EARTH_LEVEL_UT / IRON_UT) * 180 / Math.PI; // the heading's swing either side, uncalibrated
const ironDrawing = (() => {
  const cx = IRON.x, cy = -IRON.y; // screen y runs down
  const toward = Math.atan2(cy, cx);
  const half = Math.asin(EARTH_LEVEL_UT / IRON_UT);
  const reach = Math.sqrt(IRON_UT ** 2 - EARTH_LEVEL_UT ** 2);
  const tangent = (s) => ({ x: reach * Math.cos(toward + s * half), y: reach * Math.sin(toward + s * half) });
  return { cx, cy, r: EARTH_LEVEL_UT, a: tangent(1), b: tangent(-1) };
})();
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));
const at = computed(() => (imu.addresses ? `${hex(imu.addresses.accel)} · ${hex(imu.addresses.gyro)} · ${hex(imu.addresses.mag)}` : ''));

// its settings: the drivers' choices (atiic) and the module's straps
const SPECS = [
  ['Accelerometer', '±2, ±4, ±8 or ±16 g, 12 bits', '±4 g, a 62.5 Hz filter'],
  ['Gyro', '±125 to ±2000 °/s, 16 bits', '±500 °/s, a 100 Hz data rate and a 32 Hz filter'],
  ['Magnetometer', 'its readings corrected by the factory trim stored in the chip (Bosch\'s compensation)', 'normal mode at 10 Hz, the regular preset (9 and 15 repetitions)'],
  ['Temperature', 'from the accelerometer, 0.5 °C a step', 'shown beside the tabs'],
  ['Addresses', 'accelerometer 0x18/0x19, gyro 0x68/0x69, magnetometer 0x10-0x13, set by its SDO and CSB pins', 'found by each chip\'s ID: 0x19, 0x69, 0x13 on a CJMCU-900F'],
  ['Interface', 'I2C (PS high) or SPI (PS low)', 'I2C, 400 kHz'],
];

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">BMX055</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Bosch's 9-axis motion sensor: three chips in one package — an accelerometer, a gyro and a magnetometer — so acceleration, rotation and Earth's magnetic field, each on three axes. Live over a USB-to-I²C bridge: the accelerometer and gyro 100 times a second, the field 10 times.
        New to IMUs? <RouterLink to="/learn/motion" :class="link">Take the Motion course</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-bmx055.svg" alt="A CH341T bridge on 3V3 wired to a BMX055 module (CJMCU-900F) seen from its pins: VCC to 3.3V, GND to GND, SCL to SCL, SDA to SDA; on the module a short wire bridges 3.3V to PS" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires — VCC to 3.3V, GND, SCL, SDA — with the bridge's green jumper on 3V3: the BMX055 takes 3.6 V at most. Its <b>PS</b> pin picks the interface, <b>high for I²C</b>, low for SPI; left floating it answers nothing, so bridge it to <b>3.3V</b> on the module (a short wire from pin 1 to pin 5). On a <RouterLink to="/dart" :class="link">Dart</RouterLink>, wire PS to its <b>IO2</b> instead: its firmware holds it high. SDO1, SDO2 and CSB1-3 stay free, so the chips answer at 0x19, 0x69 and 0x13.
        Never take PS low while it runs: the accelerometer then stays on SPI until the module is powered off and on. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="imu.state === 'idle' || imu.state === 'connecting'" :busy="imu.state === 'connecting'" @connect="imu.connect">{{ imu.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="imu.disconnect" />
      <span v-if="running" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ at }} · 400 kHz · ±4 g · ±500 °/s · 10 Hz field</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="imu.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ imu.failure.title }}</p>
      <p v-if="imu.failure.detail" class="mt-1">{{ imu.failure.detail }}</p>
      <p v-if="imu.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ imu.failure.error }}</p>
    </div>

    <div class="flex flex-wrap items-end gap-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-4" role="tablist">
        <button v-for="t in TABS" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" class="-mb-px border-b-2 px-1 pb-2 font-medium" :class="tab === t.key ? tabOn : tabOff" @click="pick(t)">{{ t.label }}</button>
      </div>
      <p class="ml-auto pb-2 text-sm text-slate-500 dark:text-slate-400">the chip itself <span class="font-mono text-slate-800 tabular-nums dark:text-slate-100">{{ fmt(imu.latest?.temperature) }} °C</span></p>
    </div>

    <AccelerometerViews v-if="tab === 'accelerometer'" :a="a" :source="imu.accelSource" :window-ms="WINDOW_MS" />
    <GyroViews v-if="tab === 'gyro'" :g="g" :turned="turned" :source="imu.gyroSource" :running="running" :window-ms="WINDOW_MS" />
    <MagnetometerViews v-if="tab === 'magnetometer'" :cal="cal" :running="running" :window-ms="MAG_WINDOW_MS" />
    <section v-if="tab === 'magnetometer'" :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">This module's hard iron</h2>
      <p>
        On a CJMCU-900F we measured the board's own field, its hard iron, at about {{ fmt(IRON_UT, 0) }} µT along the board's level plane: twice Earth's level part where we are, about {{ EARTH_LEVEL_UT }} µT. Turn the board flat a full round and the reading runs round a circle as big as Earth's level part, but centred on the hard iron, not on zero. Zero lies outside the circle, so the arrow from zero to the reading, the one a heading is read from, only rocks about {{ fmt(ROCK_DEG, 0) }}° either way and never goes round: a compass stuck facing one way.
      </p>
      <svg viewBox="-125 -15 150 110" class="mx-auto my-3 block w-full max-w-md" role="img" aria-label="Flat-turn readings circle the hard iron, away from zero; from zero they span only a narrow wedge">
        <line x1="-125" y1="0" x2="25" y2="0" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.5" />
        <line x1="0" y1="-15" x2="0" y2="95" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.5" />
        <path :d="`M 0 0 L ${ironDrawing.a.x} ${ironDrawing.a.y} M 0 0 L ${ironDrawing.b.x} ${ironDrawing.b.y}`" stroke="currentColor" stroke-opacity="0.6" stroke-width="0.6" stroke-dasharray="2 2" fill="none" />
        <circle :cx="ironDrawing.cx" :cy="ironDrawing.cy" :r="ironDrawing.r" fill="none" stroke="var(--series-magnitude)" stroke-width="1.2" />
        <line x1="0" y1="0" :x2="ironDrawing.cx" :y2="ironDrawing.cy" stroke="currentColor" stroke-width="0.8" />
        <circle :cx="ironDrawing.cx" :cy="ironDrawing.cy" r="1.6" fill="currentColor" />
        <circle cx="0" cy="0" r="1.6" fill="currentColor" />
        <text x="3" y="8" font-size="6" fill="currentColor">zero</text>
        <text x="23" y="-2" font-size="6" fill="currentColor" text-anchor="end">x</text>
        <text x="2" y="-9" font-size="6" fill="currentColor">y</text>
        <text x="-19" y="40" font-size="6" fill="currentColor">±{{ fmt(ROCK_DEG, 0) }}°</text>
        <text :x="ironDrawing.cx" :y="ironDrawing.cy + 9" font-size="6" fill="currentColor" text-anchor="middle">hard iron</text>
        <text :x="ironDrawing.cx" :y="ironDrawing.cy + ironDrawing.r + 9" font-size="6" fill="var(--series-magnitude)" text-anchor="middle">readings, turned flat</text>
      </svg>
      <p>
        Calibrate takes the circle's middle off every reading: the circle moves onto zero, and the arrow goes round with the board. Each axis's middle, between the smallest and largest it read, is that middle, so turn the board until every axis has had its full swing (the bars above) before pressing Done. Where the hard iron comes from, the chip itself or parts beside it, we can't tell from outside; it rides with the board, so one calibration holds until something magnetic is added or the board is magnetised again. The <RouterLink to="/algorithms/compass" :class="link">tilt-compensated compass</RouterLink> needs it too.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.bosch-sensortec.com" :class="['text-sm', link]">Bosch Sensortec</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink> · <RouterLink to="/physics/rotation" :class="link">Rotation and gyroscope</RouterLink> · <RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink> · <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink> · <RouterLink to="/algorithms/compass" :class="link">A tilt-compensated compass</RouterLink> · <RouterLink to="/learn/motion" :class="link">the Motion course</RouterLink>
      </p>
    </section>
  </main>
</template>
