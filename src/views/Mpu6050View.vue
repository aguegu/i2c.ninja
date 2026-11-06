<script setup>
// The MPU-6050 or MPU-6500 live (WHO_AM_I picks atiic's driver) on the
// CH341 dongle. What's its own: an accelerometer and a gyro on one chip,
// sampled together, so fused (Mahony's filter, as Learn the IMU step 4): the
// board in 3D, steady and quick. Each sensor alone is explained on the
// ADXL345's and the ITG-3200's pages.
import { reactive, computed, ref, onBeforeUnmount } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import ImuControls from '../components/ImuControls.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import AttitudeIndicator from '../components/AttitudeIndicator.vue';
import Board3D from '../components/Board3D.vue';
import { useImu } from '../lib/useImu.js';
import { Mahony } from '../lib/fusion.js';

const WINDOW_MS = 10000; // the charts' span
const ACCEL_FLOOR_G = 1.2; // the charts' least half-range: 1 g at rest stays in view
const GYRO_FLOOR_DPS = 10;
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];

const imu = reactive(useImu({ windowMs: WINDOW_MS }));

// both sensors, one filter: each reading turns it, gravity keeps it level
const mahony = new Mahony();
const fused = ref(null); // { q, roll, pitch, yaw }
let lastT = null;
const off = imu.onReading((t, accel, gyro) => {
  mahony.update(accel, gyro, lastT === null ? 0 : (t - lastT) / 1000);
  lastT = t;
  fused.value = { q: mahony.q, ...mahony.angles() };
});
onBeforeUnmount(off);
// start again: level by gravity, heading 0 (the nose's way now)
function refuse() {
  mahony.q = null;
  mahony.integral = [0, 0, 0];
  lastT = null;
}

const a = computed(() => (imu.latest ? { x: imu.latest.accel[0], y: imu.latest.accel[1], z: imu.latest.accel[2] } : null));
const g = computed(() => (imu.latest ? { x: imu.latest.gyro[0], y: imu.latest.gyro[1], z: imu.latest.gyro[2] } : null));
const size = computed(() => (a.value ? Math.hypot(a.value.x, a.value.y, a.value.z) : null));
const fmt = (v, d = 2) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ imu.chipName ?? 'MPU-6050 / MPU-6500' }}</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        A 3-axis accelerometer and a 3-axis gyro on one chip, and its temperature: the motion sensor of phones, game controllers and drones. Live over the CH341 dongle at 400 kHz: the MPU-6050 or its successor the MPU-6500, told apart by their WHO_AM_I.
        First time here? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
        New to IMUs? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn what these numbers mean</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-mpu6050.svg" alt="A CH341T dongle wired to a GY-521 board (MPU-6050), turned so its pins face the dongle: SDA to SDA, SCL to SCL, GND to GND, VCC to VCC; INT, AD0, XCL, XDA free; its axes as printed" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The GY-521 board, turned half a turn so its pins face the dongle's and the four wires run straight: SDA, SCL, GND, VCC. INT, AD0, XCL and XDA stay free; AD0 left low gives 0x68 (high: 0x69). Its X and Y arrows are printed on it, Z points out of the board; they're the axes read below.
      </figcaption>
    </figure>

    <ImuControls :imu="imu" />

    <div class="grid gap-4 md:grid-cols-[1fr_auto]">
      <section :class="card">
        <p class="text-sm font-semibold">Acceleration</p>
        <div class="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="k in AXES" :key="k">
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ k }}</p>
            <p class="font-mono text-2xl tabular-nums">{{ fmt(a?.[k], 3) }} <span class="text-sm">g</span></p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">|a|</p>
            <p class="font-mono text-2xl tabular-nums">{{ fmt(size, 3) }} <span class="text-sm">g</span></p>
          </div>
        </div>
        <p class="mt-4 text-sm font-semibold">Rotation</p>
        <div class="mt-1 grid grid-cols-3 gap-4">
          <div v-for="k in AXES" :key="k">
            <p class="text-sm text-slate-500 dark:text-slate-400">about {{ k }}</p>
            <p class="font-mono text-2xl tabular-nums">{{ fmt(g?.[k], 1) }} <span class="text-sm">°/s</span></p>
          </div>
        </div>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">itself <span class="font-mono text-base text-slate-800 tabular-nums dark:text-slate-100">{{ fmt(imu.latest?.temperature, 1) }} °C</span></p>
      </section>
      <section :class="[card, 'flex flex-col items-center']">
        <AttitudeIndicator :roll="fused?.roll ?? 0" :pitch="fused?.pitch ?? 0" />
        <p class="mt-2 font-mono text-sm tabular-nums">roll {{ fmt(fused?.roll, 0) }}° · pitch {{ fmt(fused?.pitch, 0) }}°</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">fused: both sensors</p>
      </section>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 class="text-lg font-semibold">Both on one chip: fused</h2>
        <button :class="button" :disabled="imu.state !== 'running'" @click="refuse">Start again</button>
      </div>
      <div class="mt-2 grid items-center gap-4 md:grid-cols-[1fr_1fr]">
        <div class="flex flex-col items-center">
          <Board3D :q="fused?.q ?? [1, 0, 0, 0]" />
          <p class="font-mono text-sm tabular-nums">roll {{ fmt(fused?.roll, 0) }}° · pitch {{ fmt(fused?.pitch, 0) }}° · yaw {{ fmt(fused?.yaw, 0) }}°</p>
        </div>
        <div class="leading-relaxed">
          <p class="mb-2">
            Each sensor alone falls short. The accelerometer knows which way is down, but a shake reads as a tilt. The gyro follows every quick turn, but adds up its own offset and drifts away. Here the two are read together, every sample, and fused by Mahony's filter: the gyro turns the board, gravity keeps pulling it level.
          </p>
          <p class="mb-2">
            Hold the real board as on screen and press Start again, then turn it: the drawing follows, quick as the gyro and steady as gravity. Shake it: it barely flinches. Leave it still: roll and pitch stay put. Only yaw, the heading, creeps a little, since nothing here measures north; a compass (the <RouterLink to="/hmc5883l" class="text-emerald-700 underline dark:text-emerald-400">HMC5883L</RouterLink>) would.
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            How it works, step by step: <RouterLink to="/learn/imu/fusion" class="text-emerald-700 underline dark:text-emerald-400">Learn the IMU, combining the two</RouterLink>.
            Each sensor alone: <RouterLink to="/adxl345" class="text-emerald-700 underline dark:text-emerald-400">an accelerometer</RouterLink> (the ADXL345), <RouterLink to="/itg3200" class="text-emerald-700 underline dark:text-emerald-400">a gyro</RouterLink> (the ITG-3200).
          </p>
        </div>
      </div>
    </section>

    <section :class="card">
      <LiveChart title="Accelerometer" unit="g" :series="SERIES" :values="imu.latest?.accel" :source="imu.accelSource" :window-ms="WINDOW_MS" :floor="ACCEL_FLOOR_G" :digits="3" />
    </section>
    <section :class="card">
      <LiveChart title="Gyro" unit="deg/s" :series="SERIES" :values="imu.latest?.gyro" :source="imu.gyroSource" :window-ms="WINDOW_MS" :floor="GYRO_FLOOR_DPS" :digits="1" />
    </section>
  </main>
</template>
