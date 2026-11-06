<script setup>
// The MPU-6050 or MPU-6500 live (WHO_AM_I picks atiic's driver) on the
// CH341 dongle: an accelerometer and a gyro on one chip, sampled together.
// Two tabs (in the address: #accelerometer, the default, and #gyro): the
// accelerometer's views and the gyro's, the same as the ADXL345's and the
// ITG-3200's pages; both fused on the algorithm page it links to.
import { reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ImuControls from '../components/ImuControls.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import AccelerometerViews from '../components/AccelerometerViews.vue';
import GyroViews from '../components/GyroViews.vue';
import { useImu } from '../lib/useImu.js';
import { useTurned } from '../lib/useTurned.js';

const WINDOW_MS = 10000; // the charts' span

const imu = reactive(useImu({ windowMs: WINDOW_MS }));
const turned = reactive(useTurned((fn) => imu.onReading((t, accel, gyro) => fn(t, gyro))));

const TABS = [
  { key: 'accelerometer', label: 'Accelerometer', hash: '#accelerometer' },
  { key: 'gyro', label: 'Gyro', hash: '#gyro' },
];
const route = useRoute();
const router = useRouter();
const tab = computed(() => TABS.find((t) => t.hash === route.hash)?.key ?? 'accelerometer');
const pick = (t) => router.replace({ hash: t.hash });
const tabOn = 'border-emerald-600 text-emerald-700 dark:text-emerald-400';
const tabOff = 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100';

const a = computed(() => (imu.latest ? { x: imu.latest.accel[0], y: imu.latest.accel[1], z: imu.latest.accel[2] } : null));
const g = computed(() => (imu.latest ? { x: imu.latest.gyro[0], y: imu.latest.gyro[1], z: imu.latest.gyro[2] } : null));
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ imu.chipName ?? 'MPU-6050 / MPU-6500' }}</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A 3-axis accelerometer and a 3-axis gyro on one chip, and its temperature: the motion sensor of phones, game controllers and drones. Live over the CH341 dongle at 400 kHz: the MPU-6050 or its successor the MPU-6500, told apart by their WHO_AM_I.
        New to IMUs? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn what these numbers mean</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-mpu6050.svg" alt="A CH341T dongle wired to a GY-521 board (MPU-6050), turned so its pins face the dongle: SDA to SDA, SCL to SCL, GND to GND, VCC to VCC; INT, AD0, XCL, XDA free; its axes as printed" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The GY-521 board, turned half a turn so its pins face the dongle's and the four wires run straight: SDA, SCL, GND, VCC. INT, AD0, XCL and XDA stay free; AD0 left low gives 0x68 (high: 0x69). Its X and Y arrows are printed on it, Z points out of the board; they're the axes read below. New to the dongle? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <ImuControls :imu="imu" />

    <div class="flex flex-wrap items-end gap-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-4" role="tablist">
        <button v-for="t in TABS" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" class="-mb-px border-b-2 px-1 pb-2 font-medium" :class="tab === t.key ? tabOn : tabOff" @click="pick(t)">{{ t.label }}</button>
      </div>
      <p class="ml-auto pb-2 text-sm text-slate-500 dark:text-slate-400">the chip itself <span class="font-mono text-slate-800 tabular-nums dark:text-slate-100">{{ fmt(imu.latest?.temperature) }} °C</span></p>
    </div>

    <AccelerometerViews v-if="tab === 'accelerometer'" :a="a" :source="imu.accelSource" :window-ms="WINDOW_MS" />
    <GyroViews v-if="tab === 'gyro'" :g="g" :turned="turned" :source="imu.gyroSource" :running="imu.state === 'running'" :window-ms="WINDOW_MS" />

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Both together</h2>
      <p>
        Each sensor alone falls short: the accelerometer knows which way is down but jumps at every push; the gyro follows every turn but drifts. Fused, they give an attitude steady and quick at once, the trick inside every phone and drone. See it live with this board, every formula with its numbers: <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink>.
      </p>
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink> · <RouterLink to="/physics/rotation" :class="link">Rotation and the gyroscope</RouterLink> · <RouterLink to="/learn/imu" :class="link">Learn the IMU</RouterLink>
      </p>
    </section>
  </main>
</template>
