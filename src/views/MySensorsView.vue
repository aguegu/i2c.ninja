<script setup>
// My sensors: every calibration kept in this browser (lib/calibrationStore.js),
// one per sensor on its bridge: which bridge, chip and address, when, the
// accelerometer's offset and scale and the gyro's offset; each to forget or
// to calibrate again. Kept in this browser only: nothing leaves it.
import { ref } from 'vue';
import { listCalibrations, forgetCalibration, savedTime } from '../lib/calibrationStore.js';
import { hex } from '../lib/dongle.js';

const AXES = ['x', 'y', 'z'];
const sensors = ref(listCalibrations());
function forget(key) {
  forgetCalibration(key);
  sensors.value = listCalibrations();
}
// the chip's page, where its Calibration tab is
const pageOf = (chip) => (chip === 'MPU-6500' ? '/mpu6500' : '/mpu6050');
const sign = (v, n) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">My sensors</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The sensors you've calibrated, each kept with the bridge it's wired to: plug the same bridge in, and its sensor's
        calibration is taken off every reading, on its own page and the physics and algorithm pages. A Dart and a CH347F
        are told apart unit by unit; every CH347T or CH341 looks the same, so a calibration on one applies to any of
        them. Kept in this browser only.
      </p>
    </div>

    <p v-if="!sensors.length" :class="[card, 'leading-relaxed']">
      None yet. Calibrate an MPU-6050 or MPU-6500 on its page's Calibration tab
      (<RouterLink to="/mpu6050#calibration" :class="link">MPU-6050</RouterLink>,
      <RouterLink to="/mpu6500#calibration" :class="link">MPU-6500</RouterLink>), save it, and it shows here.
    </p>

    <section v-for="s in sensors" :key="s.key" :class="card">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">{{ s.chip }} at {{ hex(s.address) }} <span class="font-normal text-slate-500 dark:text-slate-400">on {{ s.bridge?.label ?? 'a bridge' }}</span></h2>
        <span class="text-sm text-slate-500 dark:text-slate-400">saved {{ savedTime(s) }}</span>
      </div>
      <table class="mt-3 w-full max-w-xl font-mono text-sm tabular-nums">
        <thead>
          <tr class="text-left text-slate-500 dark:text-slate-400">
            <th class="py-1 pr-4 font-sans font-normal" />
            <th v-for="a in AXES" :key="a" class="py-1 pr-4 font-normal">{{ a }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="s.accelOffsetG">
            <td class="py-1 pr-4 font-sans">accel offset, g</td>
            <td v-for="(v, k) in s.accelOffsetG" :key="k" class="py-1 pr-4">{{ sign(v, 4) }}</td>
          </tr>
          <tr v-if="s.accelScale">
            <td class="py-1 pr-4 font-sans">accel scale</td>
            <td v-for="(v, k) in s.accelScale" :key="k" class="py-1 pr-4">{{ v.toFixed(4) }}</td>
          </tr>
          <tr v-if="s.gyroOffsetDps">
            <td class="py-1 pr-4 font-sans">gyro offset, °/s<template v-if="s.gyroOffsetAtC != null"> (at {{ s.gyroOffsetAtC }} °C)</template></td>
            <td v-for="(v, k) in s.gyroOffsetDps" :key="k" class="py-1 pr-4">{{ sign(v, 2) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-3 flex flex-wrap gap-3">
        <RouterLink :to="`${pageOf(s.chip)}#calibration`" :class="button">Calibrate again</RouterLink>
        <button type="button" :class="button" @click="forget(s.key)">Forget</button>
      </div>
    </section>
  </main>
</template>
