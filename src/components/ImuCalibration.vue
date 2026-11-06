<script setup>
// The MPU's calibration, a tab of its page: why the chip in hand needs it,
// and the values a flight controller keeps: the gyro's offset (with the
// temperature it was measured at), the accelerometer's offset and scale per
// axis from six still positions, taken one at a time: the pose shown, the
// board's face told live, each recorded by itself after a second still. The
// page's calibration is switched off while here (raw readings), and its
// saved one read again after a save or a forget.
import { reactive, ref, computed, onBeforeUnmount } from 'vue';
import Board3D from './Board3D.vue';
import AxisCalLine from './AxisCalLine.vue';
import { AXES, faceUp, faceKey, fitAccel, correct, tiltError } from '../lib/calibration.js';
import { fromAxisAngle } from '../lib/quaternion.js';
import { loadCalibration, saveCalibration, forgetCalibration } from '../lib/calibrationStore.js';

const RECORD_MS = 1000; // a position averaged over this long, still
const GYRO_RECORD_MS = 2000;
const STILL_RANGE_DPS = 3; // the gyro varying more than this on any axis: moving, start again
const STILL_G = 0.15; // |a| further than this from 1 g: being pushed
const S_PER_MIN = 60;
const COLORS = ['--series-1', '--series-2', '--series-3'];
// the six positions in order: how to hold the board, and the pose to show
// (a turn from flat, face up; x the nose, y left, z up)
const POSITIONS = [
  { key: '+z', hint: 'flat on the table, face up', q: [1, 0, 0, 0] },
  { key: '-z', hint: 'flat, upside down', q: fromAxisAngle([1, 0, 0], 180) },
  { key: '+x', hint: 'standing on its tail, nose (the x arrow) straight up', q: fromAxisAngle([0, 1, 0], -90) },
  { key: '-x', hint: 'standing on its nose, nose straight down', q: fromAxisAngle([0, 1, 0], 90) },
  { key: '+y', hint: 'on its right edge, left side up', q: fromAxisAngle([1, 0, 0], 90) },
  { key: '-y', hint: 'on its left edge, right side up', q: fromAxisAngle([1, 0, 0], -90) },
];
const HINT = Object.fromEntries(POSITIONS.map((p) => [p.key, p.hint]));

const props = defineProps({ imu: { type: Object, required: true } }); // the page's useImu(), reactive
const imu = props.imu;
// measured raw: the page's saved calibration off while this tab is open
const wasOn = imu.calibrationOn;
imu.setCalibrationOn(false);
onBeforeUnmount(() => imu.setCalibrationOn(wasOn));
const saved = ref(loadCalibration()); // what's kept for this tab
const saveFailed = ref(false);

const gyroRuns = ref([]); // [{ at, temperature, offset [3] }]
const gyroRecording = ref(null); // { until, sum, n, lo, hi }
const faces = reactive({}); // '+x' .. '-z': the mean accel there
const hold = ref(0); // 0..1: how far through the second still in the asked position
let acc = null; // the asked position's average so far: { start, sum, n, lo, hi }

const target = computed(() => POSITIONS.find((p) => !faces[p.key]) ?? null);
const done = computed(() => POSITIONS.filter((p) => faces[p.key]).length);
const now = computed(() => {
  const a = imu.latest?.accel;
  return a ? faceUp(a) : undefined;
});

// still: the gyro steady (whatever its offset) and |a| near 1 g
function steady(r, accel, gyro) {
  r.lo = r.lo ? r.lo.map((v, k) => Math.min(v, gyro[k])) : [...gyro];
  r.hi = r.hi ? r.hi.map((v, k) => Math.max(v, gyro[k])) : [...gyro];
  return r.hi.every((h, k) => h - r.lo[k] <= STILL_RANGE_DPS) && Math.abs(Math.hypot(...accel) - 1) <= STILL_G;
}

const stop = imu.onReading((t, accel, gyro) => {
  const g = gyroRecording.value;
  if (g) {
    if (!steady(g, accel, gyro)) {
      gyroRecording.value = { until: t + GYRO_RECORD_MS, sum: [0, 0, 0], n: 0 };
    } else {
      gyro.forEach((v, k) => { g.sum[k] += v; });
      g.n++;
      if (t >= g.until) {
        gyroRuns.value.push({ at: new Date().toLocaleTimeString(), temperature: imu.latest?.temperature, offset: g.sum.map((s) => s / g.n) });
        gyroRecording.value = null;
      }
    }
  }

  const want = target.value;
  const face = faceUp(accel);
  if (!want || !face || faceKey(face) !== want.key) { acc = null; hold.value = 0; return; }
  acc ??= { start: t, sum: [0, 0, 0], n: 0 };
  if (!steady(acc, accel, gyro)) { acc = null; hold.value = 0; return; }
  accel.forEach((v, k) => { acc.sum[k] += v; });
  acc.n++;
  hold.value = Math.min(1, (t - acc.start) / RECORD_MS);
  if (hold.value >= 1) {
    faces[want.key] = acc.sum.map((s) => s / acc.n);
    acc = null;
    hold.value = 0;
  }
});
onBeforeUnmount(stop);

function measureGyro() {
  gyroRecording.value = { until: performance.now() + GYRO_RECORD_MS, sum: [0, 0, 0], n: 0 };
}

function startOver() {
  for (const k of Object.keys(faces)) delete faces[k];
  acc = null;
  hold.value = 0;
}

const fit = computed(() => fitAccel(faces));
const gyroOffset = computed(() => gyroRuns.value.at(-1) ?? null);
const spread = (vals) => Math.max(...vals) - Math.min(...vals);
const check = computed(() => {
  if (!fit.value) return null;
  const means = POSITIONS.map((p) => faces[p.key]);
  return {
    raw: spread(means.map((m) => Math.hypot(...m))),
    fixed: spread(means.map((m) => Math.hypot(...correct(m, fit.value)))),
    tilt: tiltError(Math.max(Math.abs(fit.value.offset[0]), Math.abs(fit.value.offset[1]))),
  };
});

const measured = computed(() => ({
  chip: imu.chipName,
  gyroOffsetDps: gyroOffset.value?.offset.map((v) => +v.toFixed(3)) ?? null,
  gyroOffsetAtC: gyroOffset.value?.temperature !== undefined && gyroOffset.value ? +gyroOffset.value.temperature.toFixed(1) : null,
  accelOffsetG: fit.value?.offset.map((v) => +v.toFixed(4)) ?? null,
  accelScale: fit.value?.scale.map((v) => +v.toFixed(4)) ?? null,
}));
const values = computed(() => JSON.stringify(measured.value, null, 2));
const canSave = computed(() => imu.chipName && (measured.value.gyroOffsetDps || measured.value.accelOffsetG));

function save() {
  const v = Object.fromEntries(Object.entries(measured.value).filter(([, x]) => x !== null));
  saveFailed.value = !saveCalibration(v);
  saved.value = loadCalibration();
  imu.reloadCalibration();
}

function forget() {
  forgetCalibration();
  saved.value = null;
  imu.reloadCalibration();
}
const savedParts = computed(() => {
  const s = saved.value;
  if (!s) return '';
  return [s.gyroOffsetDps && 'the gyro offset', s.accelOffsetG && 'the accelerometer offset and scale'].filter(Boolean).join(' and ');
});

const f = (v, n = 3) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const primary = 'rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
const th = 'px-2 py-1 text-left font-semibold';
const td = 'px-2 py-1';
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">No two chips read alike: a gyro's offset turns into drift, an accelerometer never reads exactly 1 g. Calibration measures this chip's errors once, so they can be taken off every reading after. Here are the values a flight controller keeps, measured on the chip in your hand. While this tab is open the readings are raw.</p>
    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">1. The gyro's offset</h2>
      <p :class="['mb-3', prose]">
        At rest a gyro should read 0 deg/s; it reads its offset. Added up for a minute, an offset of 1 deg/s is 60° of
        drift. Hold the board still and measure it. Then warm the chip with a fingertip for half a minute and measure
        again: the offset moves with temperature, which is why it's kept with the temperature it was taken at, and why
        Mahony's filter learning it on the go (b̂, on the attitude page) helps.
      </p>
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <button :class="primary" :disabled="imu.state !== 'running' || !!gyroRecording" @click="measureGyro">{{ gyroRecording ? 'Hold it still…' : 'Measure the gyro offset (2 s, still)' }}</button>
      </div>
      <div v-if="gyroRuns.length" class="overflow-x-auto">
        <table class="font-mono text-sm tabular-nums">
          <thead class="text-slate-500 dark:text-slate-400">
            <tr><th :class="th">time</th><th :class="th">°C</th><th v-for="a in AXES" :key="a" :class="th">{{ a }} deg/s</th><th :class="th">drift if left in, °/min</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in gyroRuns" :key="i" class="border-t border-slate-200 dark:border-slate-700">
              <td :class="td">{{ r.at }}</td>
              <td :class="td">{{ r.temperature?.toFixed(1) ?? '—' }}</td>
              <td v-for="(o, k) in r.offset" :key="k" :class="[td, 'text-right']">{{ f(o, 2) }}</td>
              <td :class="td">{{ r.offset.map((o) => f(o * S_PER_MIN, 0)).join(' ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">2. The accelerometer: six positions</h2>
      <p :class="['mb-4', prose]">
        Each axis can be off two ways: a little <b>offset</b> (it reads slightly more or less than it should) and a
        <b>scale</b> (its 1 g comes out as 0.98 or 1.02). Gravity is the yardstick: each axis is held once straight up,
        where it should read +1 g, and once straight down, −1 g. Six positions, one at a time: copy the picture and hold
        it still for a second; it records by itself.
      </p>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div class="flex shrink-0 flex-col items-center gap-2 lg:w-96">
          <Board3D :q="target ? target.q : [1, 0, 0, 0]" />
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ done }} of 6 recorded</p>
          <template v-if="target">
            <p class="text-lg"><b>Position {{ done + 1 }}:</b> {{ target.hint }}.</p>
            <p v-if="imu.state !== 'running'" class="text-slate-500 dark:text-slate-400">Connect first.</p>
            <p v-else-if="now === null" class="text-amber-700 dark:text-amber-400">Not lying square on a face: one side should point straight up.</p>
            <p v-else-if="now && faceKey(now) !== target.key" class="text-amber-700 dark:text-amber-400">Now it's {{ HINT[faceKey(now)] }}: not the position asked for.</p>
            <template v-else-if="now">
              <p class="text-emerald-700 dark:text-emerald-400">That's it. Hold still…</p>
              <div class="h-2 w-full max-w-xs overflow-hidden rounded bg-slate-200 dark:bg-slate-700"><div class="h-full bg-emerald-600" :style="{ width: `${hold * 100}%` }" /></div>
            </template>
          </template>
          <p v-else class="text-lg text-emerald-700 dark:text-emerald-400"><b>All six recorded.</b></p>
          <div><button :class="button" :disabled="!done" @click="startOver">Start the six over</button></div>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        <p :class="prose">
          Each axis on a line, its errors drawn 10 times larger. The dots: where it read pointing down and pointing up,
          against the ideal −1 g and +1 g. Halfway between them is its <b>offset</b> (orange: at 0 if it had none); the
          gap between them is twice its <b>scale</b> (2 g if it were perfect).
        </p>
        <AxisCalLine v-for="(a, k) in AXES" :key="a" :axis="a" :color="COLORS[k]" :up="faces[`+${a}`]?.[k] ?? null" :down="faces[`-${a}`]?.[k] ?? null" />
        <p :class="formula">offset = (up + down) / 2      scale = (up − down) / 2      corrected = (reading − offset) / scale</p>
        <p v-if="check" :class="prose">
          The check: gravity is the same 1 g in every position, so the total |a| should be too. Raw it varied by
          <b>{{ (check.raw * 1000).toFixed(1) }} mg</b> over the six positions; corrected, by <b>{{ (check.fixed * 1000).toFixed(2) }} mg</b>.
          And left in, the x or y offset would lean gravity's level by up to <b>{{ check.tilt.toFixed(1) }}°</b>.
        </p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">3. The values to keep</h2>
      <p :class="['mb-3', prose]">
        This is what a flight controller stores after its calibration, and applies to every reading: the gyro's offset
        (and the temperature it was taken at), the accelerometer's offset and scale per axis. Nine numbers and a
        temperature.
      </p>
      <pre class="overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-900">{{ values }}</pre>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <button :class="primary" :disabled="!canSave" @click="save">Save for this session</button>
        <button :class="button" :disabled="!saved" @click="forget">Forget</button>
      </div>
      <p v-if="saveFailed" class="mt-2 text-sm text-red-700 dark:text-red-400">This browser didn't let the page keep it (private window, or site data blocked).</p>
      <p v-else-if="saved" :class="['mt-2 text-sm text-emerald-700 dark:text-emerald-400', prose]">
        Kept for this tab: the {{ saved.chip }}'s {{ savedParts }}. Steps 2 to 5 and the motion page take it off every
        reading now (their controls say "calibrated", with a switch to compare). It goes when the tab closes.
      </p>
      <p :class="['mt-3', prose]">
        Not covered here: the axes not being exactly 90° apart (a full 3 × 3 correction instead of three scales), the
        offset's whole curve over temperature, and a compass's own calibration for yaw. The same idea each time: a known
        reference, the errors measured against it, taken off after.
      </p>
    </section>
  </div>
</template>
