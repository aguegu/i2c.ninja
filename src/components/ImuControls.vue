<script setup>
// connect / stop, the address and the scales, the temperature and the
// reading rate, for a page with useImu (passed reactive: its refs unwrapped)
import LiveSettings from './LiveSettings.vue';
import ConnectButton from './ConnectButton.vue';
import StopButton from './StopButton.vue';
import { canConnect, hex } from '../lib/dongle.js';
import { ADDRESSES, SCALES } from '../lib/useImu.js';
import { savedTime } from '../lib/calibrationStore.js';

defineProps({ imu: { type: Object, required: true } });

const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
</script>

<template>
  <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
    This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
  </p>
  <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
    <ConnectButton v-if="imu.state !== 'running'" :busy="imu.state === 'connecting'" @connect="imu.connect">{{ imu.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
    <StopButton v-else @click="imu.disconnect" />
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
    <span v-else-if="imu.calibration && (!imu.chipName || imu.calibration.chip === imu.chipName)" class="text-sm text-emerald-700 dark:text-emerald-400" :title="`The ${imu.calibration.chip} at ${hex(imu.calibration.address)} on ${imu.calibration.bridge?.label}, saved ${savedTime(imu.calibration)}: taken off every reading here and on the physics and algorithm pages`">
      your calibration applied (<RouterLink to="/my-sensors" class="underline">{{ imu.calibration.chip }} on {{ imu.calibration.bridge?.label }}</RouterLink>)
    </span>
    <span v-else-if="imu.state === 'running'" class="text-sm text-slate-500 dark:text-slate-400">not calibrated · <RouterLink to="/mpu6050#calibration" class="underline">calibrate</RouterLink></span>
    <span v-if="imu.off" class="w-full text-sm text-amber-700 dark:text-amber-400">
      Held still, the {{ imu.off.chip }} reads {{ imu.off.g.toFixed(2) }} g, not the 1 g gravity always is:
      <template v-if="imu.off.calibrated">the saved calibration doesn't fit it (another board, or a different temperature?).</template>
      <template v-else>it hasn't been calibrated.</template>
      <RouterLink to="/mpu6050#calibration" class="underline">{{ imu.off.calibrated ? 'Calibrate again' : 'Calibrate it' }}</RouterLink>.
    </span>
    <span v-if="imu.state === 'running'" class=" font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
      {{ imu.chipName }} · {{ imu.latest ? `${imu.latest.temperature.toFixed(1)} °C · ` : '' }}{{ imu.rate.toFixed(0) }} readings/s
    </span>
    <LiveSettings class="ml-auto" />
  </section>
  <div v-if="imu.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
    <p class="font-semibold">{{ imu.failure.title }}</p>
    <p v-if="imu.failure.detail" class="mt-1">{{ imu.failure.detail }}</p>
    <p v-if="imu.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ imu.failure.error }}</p>
  </div>
</template>
