<script setup>
// Learn the IMU, step 4: combining the two. The gyro is smooth but drifts;
// gravity is steady but jumps. A complementary filter takes the gyro's
// quick changes and gravity's long-run level; Mahony's filter does it in 3D,
// and its integral term learns the gyro's offset by itself.
import { reactive, ref, computed, onBeforeUnmount } from 'vue';
import LiveChart from '../../components/LiveChart.vue';
import ImuControls from '../../components/ImuControls.vue';
import AttitudeIndicator from '../../components/AttitudeIndicator.vue';
import { useImu } from '../../lib/useImu.js';
import { makeSeries } from '../../lib/series.js';
import { rollOf, pitchOf } from '../../lib/tilt.js';
import { Complementary, Mahony } from '../../lib/fusion.js';

const WINDOW_MS = 10000;
const ANGLE_FLOOR_DEG = 45;
const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated
const TAU_MIN_S = 0.05;
const TAU_MAX_S = 5;
const SLIDER_STEPS = 100;
const READING_S = 0.016; // atiic's sample period, for showing alpha

const imu = reactive(useImu({ windowMs: WINDOW_MS }));

// tau on a log slider: 0.05 s .. 5 s
const tauSlider = ref(50);
const tau = computed(() => TAU_MIN_S * (TAU_MAX_S / TAU_MIN_S) ** (tauSlider.value / SLIDER_STEPS));
const alpha = computed(() => tau.value / (tau.value + READING_S));
const kp = ref(1);
const ki = ref(0.1);

const comp = new Complementary();
const mahony = new Mahony();
const gyroOnly = { roll: null, pitch: null }; // step 3's way, no offset taken off: to compare
let lastT = null;
const shown = ref(null);

const rollChart = makeSeries(3, WINDOW_MS);
const pitchChart = makeSeries(3, WINDOW_MS);
const mahonyChart = makeSeries(3, WINDOW_MS);

const stop = imu.onReading((t, accel, gyro) => {
  const dt = lastT === null ? 0 : (t - lastT) / 1000;
  lastT = t;
  const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
  comp.tau = tau.value;
  mahony.kp = kp.value;
  mahony.ki = ki.value;
  comp.update(accel, gyro, step);
  mahony.update(accel, gyro, step);
  const gRoll = rollOf(...accel), gPitch = pitchOf(...accel);
  if (gyroOnly.roll === null) { gyroOnly.roll = gRoll; gyroOnly.pitch = gPitch; }
  gyroOnly.roll += gyro[0] * step;
  gyroOnly.pitch -= gyro[1] * step;
  const m = mahony.angles();
  rollChart.push(t, [comp.roll, gRoll, gyroOnly.roll]);
  pitchChart.push(t, [comp.pitch, gPitch, gyroOnly.pitch]);
  mahonyChart.push(t, [m.roll, m.pitch, m.yaw]);
  shown.value = { comp: { roll: comp.roll, pitch: comp.pitch }, gRoll, gPitch, gyroOnly: { ...gyroOnly }, m, learned: mahony.learnedOffset() };
});
onBeforeUnmount(stop);

function restart() {
  const a = imu.latest?.accel;
  if (!a) return;
  comp.roll = null;
  mahony.q = null;
  mahony.integral = [0, 0, 0];
  gyroOnly.roll = rollOf(...a);
  gyroOnly.pitch = pitchOf(...a);
  for (const c of [rollChart, pitchChart, mahonyChart]) c.clear();
}

const THREE = [
  { label: 'combined', color: '--series-1' },
  { label: 'gravity', color: '--series-2' },
  { label: 'gyro alone', color: '--series-3' },
];
const RPY = [
  { label: 'roll', color: '--series-1' },
  { label: 'pitch', color: '--series-2' },
  { label: 'yaw', color: '--series-3' },
];

const f = (v, n = 1) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
const slider = 'w-56 accent-emerald-600';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 4</p>
      <h1 class="text-2xl font-bold">Combining the two</h1>
      <p :class="['mt-1 text-slate-500 dark:text-slate-400', prose]">
        Gravity is steady but jumps at every push. The gyro is smooth but drifts. Each is good exactly where the other
        is bad: take the gyro's quick changes and gravity's long-run level. Hold it as before: the x arrow ahead, face up.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="card">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-semibold">1. The complementary filter</h2>
        <button :class="button" :disabled="imu.state !== 'running'" @click="restart">Start over from gravity</button>
      </div>
      <p :class="['mb-3', prose]">
        Each reading: turn the angle by the gyro, as in step 3, then move it a small part of the way toward gravity's
        angle. Over a short time the gyro wins (gravity's jumps are only nudges); over a long time gravity wins (the
        gyro's drift can't build up). <b>τ</b> is where the line between short and long lies.
      </p>
      <p :class="['mb-3', formula]">angle = α × (angle + rate × Δt) + (1 − α) × gravity's angle,   α = τ / (τ + Δt)</p>
      <label class="mb-4 flex flex-wrap items-center gap-3 text-sm">
        τ
        <input v-model.number="tauSlider" type="range" min="0" :max="SLIDER_STEPS" :class="slider">
        <span class="font-mono tabular-nums">{{ tau.toFixed(2) }} s · α = {{ alpha.toFixed(3) }} at {{ READING_S * 1000 }} ms a reading</span>
      </label>
      <div class="flex flex-col gap-4">
        <LiveChart title="Roll" unit="degrees" :series="THREE" :values="shown ? [shown.comp.roll, shown.gRoll, shown.gyroOnly.roll] : []" :source="rollChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
        <LiveChart title="Pitch" unit="degrees" :series="THREE" :values="shown ? [shown.comp.pitch, shown.gPitch, shown.gyroOnly.pitch] : []" :source="pitchChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2"><b>Tilt it and shake it.</b> Gravity's line jumps, the combined one hardly moves.</li>
        <li class="mb-2"><b>Leave it still for half a minute.</b> The gyro-alone line walks away (no offset is taken off here); the combined one stays, a little off level: the offset times τ.</li>
        <li class="mb-2"><b>Slide τ down to 0.05 s and shake again.</b> The combined line follows gravity, jumps and all. <b>Up to 5 s</b>: steady through a shake, but slow to correct and further off at rest.</li>
        <li><b>Turn it flat on the table.</b> Nothing to combine for yaw: gravity can't see it, so there's no yaw line here.</li>
      </ol>
    </section>

    <section :class="[card, 'flex flex-col gap-4 lg:flex-row lg:items-start']">
      <div class="flex w-60 shrink-0 flex-col items-center gap-2 self-center">
        <AttitudeIndicator :roll="shown?.m.roll ?? 0" :pitch="shown?.m.pitch ?? 0" />
        <p class="font-mono text-sm tabular-nums">roll {{ shown ? f(shown.m.roll) : '—' }}° · pitch {{ shown ? f(shown.m.pitch) : '—' }}°</p>
        <p class="font-mono text-sm tabular-nums">yaw {{ shown ? f(shown.m.yaw) : '—' }}°</p>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <h2 class="text-lg font-semibold">2. Mahony's filter: the same idea in 3D</h2>
        <p :class="prose">
          The complementary filter works per axis, so it's right only while the tilts stay modest. Mahony's keeps the whole
          orientation (as a quaternion, step 5) and turns it by the gyro. Each reading it compares where gravity says up
          is with where the orientation says it is, and turns the gyro's reading a little toward agreement.
        </p>
        <p :class="prose">
          <b>kp</b>, the proportional part, pulls by how far apart they are now: a spring. With a gyro offset, the spring
          and the offset settle into a tug of war and the angle stays a little off. <b>ki</b>, the integral part, adds up
          what's left over time; as long as any is left it keeps growing, and it settles only where it cancels the gyro's
          offset. The offset learned while in use, no "hold still" needed (on x and y: gravity can't see yaw, so yaw's
          offset isn't learned, and yaw still drifts).
        </p>
        <label class="flex flex-wrap items-center gap-3 text-sm">
          kp
          <input v-model.number="kp" type="range" min="0" max="5" step="0.1" :class="slider">
          <span class="font-mono tabular-nums">{{ kp.toFixed(1) }} /s</span>
        </label>
        <label class="flex flex-wrap items-center gap-3 text-sm">
          ki
          <input v-model.number="ki" type="range" min="0" max="1" step="0.05" :class="slider">
          <span class="font-mono tabular-nums">{{ ki.toFixed(2) }} /s²</span>
        </label>
        <p class="font-mono text-sm tabular-nums">
          offset learned: {{ shown ? shown.learned.map((o) => f(o, 2)).join('  ') : '—' }} deg/s (x y z)
        </p>
        <LiveChart title="Mahony" unit="degrees" :series="RPY" :values="shown ? [shown.m.roll, shown.m.pitch, shown.m.yaw] : []" :source="mahonyChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2"><b>Start over, then leave it still and watch "offset learned".</b> Within a minute x and y settle near the offsets the gyro reads at rest (step 1's gyro rows): the integral found them. z stays 0.</li>
        <li class="mb-2"><b>Set ki to 0, start over, leave it still.</b> Roll and pitch settle a little off level: the spring against the offset (about offset ÷ kp). Put ki back and the gap closes.</li>
        <li class="mb-2"><b>kp at 0.</b> Gravity is ignored: it's step 3's gyro alone again, drift and all. <b>kp at 5</b>: gravity pulls hard and shakes come through.</li>
        <li><b>Tilt it far, past 60°, and turn it.</b> Roll and pitch stay right where the complementary filter would mix them up: Mahony's keeps the whole orientation.</li>
      </ol>
    </section>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu/gyro-angle" class="text-emerald-700 underline dark:text-emerald-400">← Step 3: angle from the gyro</RouterLink>
      <span class="text-slate-500 dark:text-slate-400">Next: 3D attitude (to come)</span>
    </nav>
  </main>
</template>
