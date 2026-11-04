<script setup>
// The MPU-6050 or MPU-6500 live (WHO_AM_I picks atiic's driver) on the
// CH341 dongle, the accelerometer and gyro charted
import { reactive } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import ImuControls from '../components/ImuControls.vue';
import { useImu } from '../lib/useImu.js';

const WINDOW_MS = 10000; // the charts' span
const ACCEL_FLOOR_G = 1.2; // the charts' least half-range: 1 g at rest stays in view
const GYRO_FLOOR_DPS = 10;
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];

const imu = reactive(useImu({ windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ imu.chipName ?? 'MPU-6050 / MPU-6500' }}</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        A 3-axis gyro and accelerometer, live over the CH341 dongle at 400 kHz: the MPU-6050 or its successor the MPU-6500, told apart by their WHO_AM_I.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
        New to IMUs? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn what these numbers mean</RouterLink>.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="card">
      <LiveChart title="Accelerometer" unit="g" :series="SERIES" :values="imu.latest?.accel" :source="imu.accelSource" :window-ms="WINDOW_MS" :floor="ACCEL_FLOOR_G" :digits="3" />
    </section>
    <section :class="card">
      <LiveChart title="Gyro" unit="deg/s" :series="SERIES" :values="imu.latest?.gyro" :source="imu.gyroSource" :window-ms="WINDOW_MS" :floor="GYRO_FLOOR_DPS" :digits="1" />
    </section>
  </main>
</template>
