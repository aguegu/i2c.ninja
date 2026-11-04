<script setup>
// connect / stop, the address and the scales, the temperature and the
// reading rate, for a page with useImu (passed reactive: its refs unwrapped)
import { hasWebUsb, hex } from '../lib/dongle.js';
import { ADDRESSES, SCALES } from '../lib/useImu.js';

defineProps({ imu: { type: Object, required: true } });

const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
</script>

<template>
  <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
    This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
  </p>
  <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
    <button v-if="imu.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="imu.state === 'connecting'" @click="imu.connect">
      {{ imu.state === 'connecting' ? 'Connecting…' : 'Connect' }}
    </button>
    <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="imu.disconnect">Stop</button>
    <label :class="field">Address
      <select :value="imu.address" :class="select" @change="imu.configure({ address: Number($event.target.value) })">
        <option v-for="a in ADDRESSES" :key="a" :value="a" :disabled="imu.state === 'running' && !imu.found.includes(a)">{{ hex(a) }}</option>
      </select>
    </label>
    <label :class="field">Gyro ±
      <select :value="imu.gyroscopeScale" :class="select" @change="imu.configure({ gyroscopeScale: $event.target.value })">
        <option v-for="s in SCALES.gyroscope" :key="s" :value="s">{{ s }} deg/s</option>
      </select>
    </label>
    <label :class="field">Accel ±
      <select :value="imu.accelerometerScale" :class="select" @change="imu.configure({ accelerometerScale: $event.target.value })">
        <option v-for="s in SCALES.accelerometer" :key="s" :value="s">{{ s }} g</option>
      </select>
    </label>
    <span v-if="!imu.calibrated" class="text-sm text-slate-500 dark:text-slate-400">raw readings: no calibration here</span>
    <label v-else-if="imu.calibration && (!imu.chipName || imu.calibration.chip === imu.chipName)" class="flex items-center gap-2 text-sm" :title="`saved ${imu.calibration.savedAt} for the ${imu.calibration.chip}`">
      <input type="checkbox" class="size-4 accent-emerald-600" :checked="imu.calibrationOn" @change="imu.setCalibrationOn($event.target.checked)">
      calibrated ({{ imu.calibration.chip }})
    </label>
    <span v-else-if="imu.state === 'running'" class="text-sm text-slate-500 dark:text-slate-400">not calibrated · <RouterLink to="/learn/imu/calibration" class="underline">calibrate</RouterLink></span>
    <span v-if="imu.state === 'running'" class="ml-auto font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
      {{ imu.chipName }} · {{ imu.latest ? `${imu.latest.temperature.toFixed(1)} °C · ` : '' }}{{ imu.rate.toFixed(0) }} readings/s
    </span>
  </section>
  <div v-if="imu.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
    <p class="font-semibold">{{ imu.failure.title }}</p>
    <p v-if="imu.failure.detail" class="mt-1">{{ imu.failure.detail }}</p>
    <p v-if="imu.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ imu.failure.error }}</p>
  </div>
</template>
