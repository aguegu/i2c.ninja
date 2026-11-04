<script setup>
// Learn the IMU, step 2: tilt from gravity. At rest the accelerometer reads
// 1 g straight up; how that 1 g splits over x, y and z gives two angles,
// roll and pitch. And what it can't give: yaw, and anything while shaken.
import { reactive, computed } from 'vue';
import LiveChart from '../../components/LiveChart.vue';
import ImuControls from '../../components/ImuControls.vue';
import AttitudeIndicator from '../../components/AttitudeIndicator.vue';
import { useImu } from '../../lib/useImu.js';

const WINDOW_MS = 10000;
const ANGLE_FLOOR_DEG = 45;
const DEG = 180 / Math.PI;
const REST_G = 0.1; // |a| within 1 g +/- this: near enough at rest to trust the tilt
const SERIES = [
  { label: 'roll', color: '--series-1' },
  { label: 'pitch', color: '--series-2' },
];

const imu = reactive(useImu({ windowMs: WINDOW_MS }));

// the board's x arrow ahead (the nose), face up: roll right side down +,
// pitch nose up +
const roll = (ax, ay, az) => Math.atan2(ay, az) * DEG;
const pitch = (ax, ay, az) => Math.atan2(ax, Math.hypot(ay, az)) * DEG;

const now = computed(() => {
  const a = imu.latest?.accel;
  if (!a) return null;
  const [ax, ay, az] = a;
  return { ax, ay, az, roll: roll(ax, ay, az), pitch: pitch(ax, ay, az), g: Math.hypot(ax, ay, az) };
});
const atRest = computed(() => now.value && Math.abs(now.value.g - 1) <= REST_G);

function tiltSource() {
  const { t, ys: [x, y, z] } = imu.accelSource();
  const r = new Array(t.length), p = new Array(t.length);
  for (let i = 0; i < t.length; i++) { r[i] = roll(x[i], y[i], z[i]); p[i] = pitch(x[i], y[i], z[i]); }
  return { t, ys: [r, p] };
}

const f = (v, n = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 2</p>
      <h1 class="text-2xl font-bold">Tilt from gravity</h1>
      <p :class="['mt-1 text-slate-500 dark:text-slate-400', prose]">
        Held still, the accelerometer always reads 1 g pointing up. Tilt the board and that same 1 g is shared out
        differently between x, y and z: the share tells you the tilt.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="[card, 'flex flex-col gap-4 lg:flex-row lg:items-center']">
      <div class="flex w-60 shrink-0 flex-col items-center gap-2 self-center">
        <AttitudeIndicator :roll="now?.roll ?? 0" :pitch="now?.pitch ?? 0" />
        <p class="font-mono text-sm tabular-nums">roll {{ now ? f(now.roll, 1) : '—' }}° · pitch {{ now ? f(now.pitch, 1) : '—' }}°</p>
        <p class="min-h-10 text-center text-sm" :class="!now ? '' : atRest ? 'text-emerald-700 dark:text-emerald-400' : 'font-semibold text-red-700 dark:text-red-400'">
          <template v-if="now">|a| = {{ now.g.toFixed(2) }} g: {{ atRest ? 'at rest, the angles hold' : 'being pushed: the angles are wrong now' }}</template>
        </p>
      </div>
      <div class="min-w-0 flex-1">
        <LiveChart title="Tilt" unit="degrees" :series="SERIES" :values="now ? [now.roll, now.pitch] : []" :source="tiltSource" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Hold it like a plane</h2>
      <p :class="prose">
        Face up, with the <b>x arrow</b> printed on the board pointing ahead, like a nose. Then z points up and y points
        left. Two angles describe a tilt: <b>roll</b>, turning about the nose (right side down is positive), and
        <b>pitch</b>, nose up or down (up is positive). The indicator is the instrument a pilot flies by: the aircraft
        symbol stays put and the horizon moves.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">The arithmetic</h2>
      <p :class="['mb-3', prose]">
        Roll right and the 1 g leans from z toward y; the angle between them is roll. Pitch is the same between x and
        the rest. <code>atan2(a, b)</code> is the angle whose tangent is a / b, the right way round in every quadrant.
      </p>
      <div class="flex flex-col gap-2">
        <p :class="formula">roll = atan2(ay, az){{ now ? ` = atan2(${f(now.ay)}, ${f(now.az)}) = ${f(now.roll, 1)}°` : '' }}</p>
        <p :class="formula">pitch = atan2(ax, √(ay² + az²)){{ now ? ` = atan2(${f(now.ax)}, ${Math.hypot(now.ay, now.az).toFixed(2)}) = ${f(now.pitch, 1)}°` : '' }}</p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2"><b>Tilt it slowly each way.</b> Right side down: roll goes positive and the horizon's right end rises. Nose up: pitch goes positive and the horizon drops.</li>
        <li class="mb-2"><b>Flat on the table, turn it round like a dial.</b> Nothing changes. Gravity looks the same from every heading, so the accelerometer can't see <b>yaw</b>. The gyro can, for a while (step 3); a compass can for good.</li>
        <li class="mb-2"><b>Hold the tilt and shake it, or slide it quickly.</b> The angles jump and |a| leaves 1 g: the accelerometer feels every push, not only gravity, and can't tell them apart. That's why a drone can't fly on its accelerometer alone.</li>
        <li><b>Stand it on its tail, nose straight up.</b> Pitch reads about +90°, but roll wanders: ay and az are both nearly 0, and atan2 of two noises is noise. Around ±90° pitch, roll has no meaning.</li>
      </ol>
    </section>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu/raw-numbers" class="text-emerald-700 underline dark:text-emerald-400">← Step 1: raw numbers</RouterLink>
      <span class="text-slate-500 dark:text-slate-400">Next: angle from the gyro (to come)</span>
    </nav>
  </main>
</template>
