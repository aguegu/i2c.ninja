<script setup>
// Learn the IMU, step 3: angle from the gyro. The gyro gives turning rates;
// added up over time (rate x the time between readings) they give angles,
// yaw too. Smooth through a shake, but every bit of offset adds up as well:
// drift. Measured and taken off, the drift slows; it never stops.
import { reactive, ref, onBeforeUnmount } from 'vue';
import LiveChart from '../../components/LiveChart.vue';
import ImuControls from '../../components/ImuControls.vue';
import AttitudeIndicator from '../../components/AttitudeIndicator.vue';
import GyroBall from '../../components/GyroBall.vue';
import { useImu } from '../../lib/useImu.js';
import { makeSeries } from '../../lib/series.js';
import { rollOf, pitchOf } from '../../lib/tilt.js';

const WINDOW_MS = 10000;
const ANGLE_FLOOR_DEG = 45;
const MAX_STEP_S = 0.1; // a longer gap between readings (a pause, new settings): not integrated
const OFFSET_MS = 2000; // the offset measured over this long, held still
const DRIFT_MS = 2000; // the drift: the mean corrected rate over the last this long
const S_PER_MIN = 60;

const imu = reactive(useImu({ windowMs: WINDOW_MS }));

// the angles from the gyro, plain (updated per reading), and their latest for the page
const angle = { roll: 0, pitch: 0, yaw: 0 };
const shown = ref(null); // { roll, pitch, yaw, gRoll, gPitch }
// the ball: the corrected rates about the board's x, y, z, and each added
// up on its own (its marker's place on its ring)
const phase = [0, 0, 0];
const ball = ref({ rates: [0, 0, 0], phases: [0, 0, 0] });
const offset = ref([0, 0, 0]); // deg/s, taken off each gyro reading
const measuring = ref(false);
const drift = ref(null); // deg/min a axis: the corrected rate, averaged
let lastT = null;
let started = false;
let sampling = null; // while measuring the offset: { sum, n, until }
const recent = []; // [t, roll rate, pitch rate, yaw rate], the last DRIFT_MS

const rollChart = makeSeries(2, WINDOW_MS);
const pitchChart = makeSeries(2, WINDOW_MS);
const yawChart = makeSeries(1, WINDOW_MS);

const wrap = (a) => ((a + 180) % 360 + 360) % 360 - 180; // into -180 .. 180

function reset(accel) {
  angle.roll = rollOf(...accel);
  angle.pitch = pitchOf(...accel);
  angle.yaw = 0;
}

const stop = imu.onReading((t, accel, gyro) => {
  if (sampling) {
    gyro.forEach((g, k) => { sampling.sum[k] += g; });
    sampling.n++;
    if (t >= sampling.until) {
      offset.value = sampling.sum.map((s) => s / sampling.n);
      sampling = null;
      measuring.value = false;
    }
  }
  const [gx, gy, gz] = gyro.map((g, k) => g - offset.value[k]);
  // in step 2's terms (x the nose, y left, z up): roll right side down +
  // is a turn about +x; nose up is a turn about -y; turning right is about -z
  const rates = [gx, -gy, -gz];
  if (!started) { reset(accel); started = true; }
  const dt = lastT === null ? 0 : (t - lastT) / 1000;
  lastT = t;
  if (dt > 0 && dt <= MAX_STEP_S) {
    [gx, gy, gz].forEach((g, k) => { phase[k] = wrap(phase[k] + g * dt); });
    angle.roll = wrap(angle.roll + rates[0] * dt);
    angle.pitch = wrap(angle.pitch + rates[1] * dt);
    angle.yaw = wrap(angle.yaw + rates[2] * dt);
  }
  recent.push([t, ...rates]);
  while (recent.length && recent[0][0] < t - DRIFT_MS) recent.shift();
  drift.value = [1, 2, 3].map((k) => (recent.reduce((s, r) => s + r[k], 0) / recent.length) * S_PER_MIN);

  const gRoll = rollOf(...accel), gPitch = pitchOf(...accel);
  rollChart.push(t, [angle.roll, gRoll]);
  pitchChart.push(t, [angle.pitch, gPitch]);
  yawChart.push(t, [angle.yaw]);
  shown.value = { ...angle, gRoll, gPitch };
  ball.value = { rates: [gx, gy, gz], phases: [...phase] };
});
onBeforeUnmount(stop);

function measureOffset() {
  measuring.value = true;
  sampling = { sum: [0, 0, 0], n: 0, until: performance.now() + OFFSET_MS };
}

function clearOffset() {
  offset.value = [0, 0, 0];
}

function restart() {
  const a = imu.latest?.accel;
  if (a) reset(a);
  for (const c of [rollChart, pitchChart, yawChart]) c.clear();
}

const BOTH = [
  { label: 'gyro', color: '--series-1' },
  { label: 'gravity', color: '--series-2' },
];
const YAW = [{ label: 'gyro', color: '--series-1' }];

const f = (v, n = 1) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 3</p>
      <h1 class="text-2xl font-bold">Angle from the gyro</h1>
      <p :class="['mt-1 text-slate-500 dark:text-slate-400', prose]">
        The gyro doesn't measure angles: it measures how fast the board is turning. Add up the turning, reading after
        reading, and you have the angle, yaw too, which gravity couldn't see. Hold it as in step 2: the x arrow ahead,
        face up.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="[card, 'flex flex-col gap-4 lg:flex-row lg:items-center']">
      <div class="flex w-60 shrink-0 flex-col items-center gap-2 self-center">
        <AttitudeIndicator :roll="shown?.roll ?? 0" :pitch="shown?.pitch ?? 0" />
        <p class="font-mono text-sm tabular-nums">roll {{ shown ? f(shown.roll) : '—' }}° · pitch {{ shown ? f(shown.pitch) : '—' }}°</p>
        <p class="font-mono text-sm tabular-nums">yaw {{ shown ? f(shown.yaw) : '—' }}°</p>
        <p class="text-center text-xs text-slate-500 dark:text-slate-400">from the gyro alone</p>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button :class="button" :disabled="imu.state !== 'running'" @click="restart">Level from gravity, yaw to 0</button>
          <button :class="button" :disabled="imu.state !== 'running' || measuring" @click="measureOffset">{{ measuring ? 'Hold still…' : 'Measure the offset (2 s, still)' }}</button>
          <button :class="button" :disabled="offset.every((o) => o === 0)" @click="clearOffset">Forget the offset</button>
        </div>
        <p class="font-mono text-sm tabular-nums">
          offset taken off: {{ offset.map((o) => f(o, 2)).join('  ') }} deg/s
        </p>
        <p class="min-h-10 font-mono text-sm tabular-nums">
          <template v-if="drift">turning (or drifting), °/min: roll {{ f(drift[0]) }} · pitch {{ f(drift[1]) }} · yaw {{ f(drift[2]) }}</template>
        </p>
      </div>
    </section>

    <section :class="[card, 'flex flex-col gap-4 lg:flex-row lg:items-center']">
      <div class="flex w-80 shrink-0 flex-col items-center gap-1 self-center">
        <GyroBall :rates="ball.rates" :phases="ball.phases" />
        <p class="font-mono text-sm tabular-nums">
          <span class="text-[var(--series-1)]">x</span> {{ f(ball.rates[0]) }} ·
          <span class="text-[var(--series-2)]">y</span> {{ f(ball.rates[1]) }} ·
          <span class="text-[var(--series-3)]">z</span> {{ f(ball.rates[2]) }} °/s
        </p>
      </div>
      <div :class="prose">
        <h2 class="mb-2 text-lg font-semibold">What the gyro sees</h2>
        <p class="mb-2">
          The board seen from behind and to its right: x its nose (away from you), y to its left, z up. A ring for each
          axis, and on each ring a dot that turns about that axis exactly as the board does: turn the board at 90°/s about
          its nose and the x dot goes round at 90°/s too.
        </p>
        <p class="mb-2">
          The orange arrow is all three at once: the board's <b>angular velocity</b>. It points along the axis the board
          is spinning about, as long as it spins fast. Curl your right hand's fingers the way the board turns: your thumb
          points the way of the arrow.
        </p>
        <p>
          Hold it still: the dots creep anyway. That creep is the offset, the same one that makes the angles drift.
          Measure the offset above and they nearly stop.
        </p>
      </div>
    </section>

    <section :class="card">
      <LiveChart title="Roll" unit="degrees" :series="BOTH" :values="shown ? [shown.roll, shown.gRoll] : []" :source="rollChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
    </section>
    <section :class="card">
      <LiveChart title="Pitch" unit="degrees" :series="BOTH" :values="shown ? [shown.pitch, shown.gPitch] : []" :source="pitchChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
    </section>
    <section :class="card">
      <LiveChart title="Yaw" unit="degrees" :series="YAW" :values="shown ? [shown.yaw] : []" :source="yawChart.source" :window-ms="WINDOW_MS" :floor="ANGLE_FLOOR_DEG" :digits="1" />
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">The arithmetic</h2>
      <p :class="['mb-3', prose]">
        Between two readings a few milliseconds apart, the board turned by about rate × time. Add that to the angle,
        every reading: that's integration, done in small steps. Holding the board as in step 2, a turn about its nose
        (gyro x) is roll; nose up is a turn about y the other way; turning right is a turn about z the other way.
      </p>
      <div class="flex flex-col gap-2">
        <p :class="formula">roll  += (gx − offset x) × Δt</p>
        <p :class="formula">pitch −= (gy − offset y) × Δt</p>
        <p :class="formula">yaw   −= (gz − offset z) × Δt</p>
      </div>
      <p :class="['mt-3', prose]">
        Each step is right only while the other angles are small: tilted far, a turn about the board's own axes isn't a
        turn of the angles alone. Step 5 does it properly; for now, keep the tilts modest.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2"><b>Level it, then leave it on the table with no offset taken off.</b> The angles walk away by themselves: every bit of the gyro's offset is added up, reading after reading. The drift line says how fast.</li>
        <li class="mb-2"><b>Hold it still and measure the offset, then level again.</b> The drift slows to a crawl. It never quite stops: the offset itself shifts with temperature and time.</li>
        <li class="mb-2"><b>Turn it a quarter right on the table and back.</b> Yaw goes to about +90° and comes back near 0: the gyro saw what gravity couldn't.</li>
        <li class="mb-2"><b>Tilt it and shake it.</b> The gyro's line stays smooth where gravity's jumps: a shake barely turns the board. That's the gyro's strength, and drift its weakness: the accelerometer is the other way round.</li>
        <li><b>Set Gyro to ±250 deg/s and turn it fast.</b> Past 250 deg/s the gyro reads 250 and no more: the angle falls behind and stays wrong. A drone's gyro is set wide (±2000) for that reason.</li>
      </ol>
      <p :class="['mt-3', prose]">
        Steady but fooled by shakes; smooth but drifting. Step 4 puts the two together.
      </p>
    </section>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu/tilt" class="text-emerald-700 underline dark:text-emerald-400">← Step 2: tilt from gravity</RouterLink>
      <span class="text-slate-500 dark:text-slate-400">Next: combining the two (to come)</span>
    </nav>
  </main>
</template>
