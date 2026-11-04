<script setup>
// Learn the IMU, step 5: 3D attitude. Mahony's quaternion (step 4) as the
// board in 3D; the quaternion read as one turn about one axis; why roll,
// pitch and yaw break where a quaternion doesn't.
import { reactive, ref, onBeforeUnmount } from 'vue';
import ImuControls from '../../components/ImuControls.vue';
import Board3D from '../../components/Board3D.vue';
import { useImu } from '../../lib/useImu.js';
import { Mahony } from '../../lib/fusion.js';
import { axisAngle } from '../../lib/quaternion.js';

const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated
const KP = 1;
const KI = 0.1;

const imu = reactive(useImu());
const mahony = new Mahony(KP, KI);
const showAxis = ref(true);
let lastT = null;
const shown = ref(null); // { q, angle, axis, roll, pitch, yaw }

const stop = imu.onReading((t, accel, gyro) => {
  const dt = lastT === null ? 0 : (t - lastT) / 1000;
  lastT = t;
  mahony.update(accel, gyro, dt > 0 && dt <= MAX_STEP_S ? dt : 0);
  const { angle, axis } = axisAngle(mahony.q);
  shown.value = { q: [...mahony.q], angle, axis, ...mahony.angles() };
});
onBeforeUnmount(stop);

function restart() {
  mahony.q = null; // levels from gravity on the next reading, heading 0
  mahony.integral = [0, 0, 0];
}

const f = (v, n = 1) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
const QN = ['w', 'x', 'y', 'z'];
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 5</p>
      <h1 class="text-2xl font-bold">3D attitude</h1>
      <p :class="['mt-1 text-slate-500 dark:text-slate-400', prose]">
        Step 4's Mahony filter keeps the board's whole orientation, its <b>attitude</b>, as four numbers: a quaternion.
        Here it is as the board itself, and what the four numbers mean. Hold it as before: the x arrow ahead, face up.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="[card, 'flex flex-col gap-4 lg:flex-row lg:items-center']">
      <div class="flex shrink-0 flex-col items-center gap-2 lg:w-96">
        <Board3D :q="shown?.q ?? [1, 0, 0, 0]" :axis="showAxis && shown && shown.angle > 2 ? shown.axis : null" />
        <div class="flex flex-wrap justify-center gap-2">
          <button :class="button" :disabled="imu.state !== 'running'" @click="restart">Level from gravity, heading 0</button>
          <label class="flex items-center gap-2 text-sm"><input v-model="showAxis" type="checkbox" class="size-4 accent-emerald-600"> the turn's axis</label>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-3 font-mono text-sm tabular-nums">
        <p>q = [ <template v-for="(n, i) in QN" :key="n">{{ n }} {{ shown ? f(shown.q[i], 3) : '—' }}{{ i < 3 ? ', ' : '' }}</template> ]</p>
        <p>one turn of {{ shown ? shown.angle.toFixed(1) : '—' }}° about [ {{ shown ? shown.axis.map((v) => f(v, 2)).join(', ') : '—' }} ]</p>
        <p class="text-slate-500 dark:text-slate-400">as roll · pitch · yaw: {{ shown ? `${f(shown.roll)}° · ${f(shown.pitch)}° · ${f(shown.yaw)}°` : '—' }}</p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">One turn, one axis</h2>
      <p :class="['mb-3', prose]">
        However the board got to where it is now, a single turn about a single axis would have taken it there from level
        (Euler proved it in 1775). That axis is the dashed orange line through the board, and the turn's size is the
        angle above. A quaternion is just that turn written as four numbers:
      </p>
      <p :class="['mb-3', formula]">q = [ cos(θ/2),  axis × sin(θ/2) ]   (θ the angle, axis a unit arrow)</p>
      <p :class="prose">
        Why half the angle? It makes turning one quaternion by another a plain multiplication, which is what the filter
        does every reading: the gyro's small turn (rate × Δt about its axis) multiplied onto q. The cost is a curiosity:
        a whole turn, 360°, gives cos(180°) = −1, so q and −q are the same orientation.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Why not just roll, pitch and yaw?</h2>
      <p :class="prose">
        Three angles applied one after another (roll, pitch, yaw: <b>Euler angles</b>) are easy to read, and fine while
        the board stays near level. But nose straight up, a turn about the nose and a turn about the vertical become the
        same turn: roll and yaw can't be told apart, and the readout can jump by large amounts for a small move. That's
        <b>gimbal lock</b> (step 2's "roll means nothing at ±90°" was a glimpse of it). A quaternion has no such place:
        every orientation is a turn like any other. Flight controllers keep a quaternion, and show angles only for people.
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2"><b>Level, then tilt it any way, about any slanted axis.</b> The dashed line shows the axis of the whole turn from level, and the angle how far. Turn it back and the angle shrinks to 0.</li>
        <li class="mb-2"><b>Stand it on its tail, nose up, then turn it about its nose.</b> Roll and yaw swing together and jump; the board on screen and q turn smoothly.</li>
        <li class="mb-2"><b>Flat on the table, turn it a full circle.</b> w goes from +1 through 0 (at half a turn) to −1: back where it started, written −q.</li>
        <li><b>Leave it still for a while.</b> The board on screen slowly turns about the vertical: yaw drift, the one gravity can't correct (step 4). A compass would; "Level from gravity, heading 0" resets it.</li>
      </ol>
      <p :class="['mt-3', prose]">
        That's the whole path: bytes to counts, counts to g and deg/s, gravity's tilt, the gyro's turning, the two
        combined, and the result as an attitude. It's what a flight controller works out hundreds or thousands of times
        a second before it decides anything.
      </p>
    </section>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu/fusion" class="text-emerald-700 underline dark:text-emerald-400">← Step 4: combining the two</RouterLink>
      <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">All steps</RouterLink>
    </nav>
  </main>
</template>
