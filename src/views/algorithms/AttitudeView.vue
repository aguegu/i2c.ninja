<script setup>
// Algorithm: attitude from accel and gyro (6-axis sensor fusion). An accelerometer and a gyro, from one chip (an
// MPU) or two boards (an ADXL345 and an ITG-3200), fused by Mahony's
// filter; why each alone falls short, the complementary filter, Mahony's in
// 3D and what it learns, yaw left to a compass; a Live card scanning for a
// pair, the fused views, things to try
import { reactive } from 'vue';
import SourceBar from '../../components/SourceBar.vue';
import HintNote from '../../components/HintNote.vue';
import FusionViews from '../../components/FusionViews.vue';
import TexMath from '../../components/TexMath.vue';
import { ACCELEROMETERS, GYROSCOPES } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { useFusion } from '../../lib/useFusion.js';

const WINDOW_MS = 10000;
const src = reactive(useSources({ accel: ACCELEROMETERS, gyro: GYROSCOPES }, { windowMs: WINDOW_MS }));
const fusion = reactive(useFusion((fn) => src.onReading((t, v) => fn(t, v.accel, v.gyro)), { windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const WIKI = 'https://en.wikipedia.org/wiki/';
// further reading, by what it explains on this page
const READING = [
  { topic: 'The filter', items: [
    { href: 'https://doi.org/10.1109/TAC.2008.923738', title: 'Nonlinear Complementary Filters on the Special Orthogonal Group', note: 'Robert Mahony, Tarek Hamel and Jean-Michel Pflimlin, IEEE Transactions on Automatic Control, 2008: the filter on this page' },
    { href: 'https://doi.org/10.1109/ICORR.2011.5975346', title: 'Estimation of IMU and MARG orientation using a gradient descent algorithm', note: 'Sebastian Madgwick, Andrew Harrison and Ravi Vaidyanathan, ICORR 2011: the other well-known small filter' },
    { href: `${WIKI}Kalman_filter`, title: 'Kalman filter', note: 'Wikipedia: the heavier, statistical way, in navigation systems' },
  ] },
  { topic: 'The maths', items: [
    { href: `${WIKI}Aircraft_principal_axes`, title: 'Aircraft principal axes', note: 'Wikipedia: roll, pitch and yaw (φ, θ, ψ)' },
    { href: `${WIKI}Quaternions_and_spatial_rotation`, title: 'Quaternions and spatial rotation', note: 'Wikipedia: q, its product ⊗, and turning by it' },
    { href: `${WIKI}Euler%27s_rotation_theorem`, title: 'Euler\'s rotation theorem', note: 'Wikipedia: any attitude is one turn away, β about n' },
    { href: `${WIKI}Atan2`, title: 'atan2', note: 'Wikipedia: the angle from two numbers, gravity\'s φ and θ' },
    { href: `${WIKI}Cross_product`, title: 'Cross product', note: 'Wikipedia: e, how far apart two directions are' },
  ] },
  { topic: 'Control', items: [
    { href: `${WIKI}PID_controller`, title: 'PID controller', note: 'Wikipedia: kp, ki and kd' },
  ] },
  { topic: 'The bigger picture', items: [
    { href: `${WIKI}Inertial_measurement_unit`, title: 'Inertial measurement unit', note: 'Wikipedia: accelerometers and gyros together' },
    { href: `${WIKI}Attitude_and_heading_reference_system`, title: 'Attitude and heading reference system', note: 'Wikipedia: with a compass too, a full attitude' },
  ] },
];
const COMPLEMENTARY = String.raw`\varphi_c \leftarrow \alpha\,(\varphi_c + \omega_x\,\Delta t) + (1 - \alpha)\,\varphi_g, \qquad \alpha = \frac{\tau}{\tau + \Delta t}`;
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Algorithm</p>
      <h1 class="text-2xl font-bold">Attitude from accel and gyro</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        An accelerometer knows which way is down but jumps at every push; a gyro follows every turn but drifts. Read together and combined (6-axis sensor fusion), they give an attitude: roll, pitch and yaw, that is steady and quick at once: the trick inside every phone, game controller and drone. It runs on one chip that has both, or on two boards side by side.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Combines <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink> + <RouterLink to="/physics/rotation" :class="link">Rotation and the gyroscope</RouterLink>.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
      <HintNote v-if="src.apart" class="mt-3">
        Two boards: line them up so their printed x, y and z arrows point the same ways, and fix them together (tape, a breadboard). The filter takes them as one board; an axis turned the other way reads as a turn the other way.
      </HintNote>
    </section>

    <FusionViews :fusion="fusion" :running="src.state === 'running'" :window-ms="WINDOW_MS" />

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Each alone falls short</h2>
      <p class="mb-2">
        <b>Gravity's tilt</b> (its line on the charts above) comes straight from the accelerometer: which way is down, so roll and pitch. Steady over time, but the accelerometer can't tell gravity from a push: every shake, every start and stop, reads as a tilt.
      </p>
      <p>
        <b>The gyro alone</b> (its line) adds up the rates from where gravity put it at the start. Smooth and quick, unbothered by a shake, but every gyro reads a little even when still, and that is added up too: the angle walks away.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">The complementary filter</h2>
      <p class="mb-2">
        Each is good exactly where the other is bad, so take the gyro's quick changes and gravity's long-run level. Each reading: turn the roll φ<sub>c</sub> (c, the complementary filter's) by the gyro's rate about x, then move it a small part of the way toward gravity's φ<sub>g</sub> (the pitch θ alike).
      </p>
      <TexMath class="mb-2 block" display :expr="COMPLEMENTARY" />
      <p>
        Over less than τ (half a second, say) the gyro wins: a shake is only a nudge. Over more, gravity wins: the drift can't build up. It works per axis, so it's right while the tilts stay modest.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Mahony's filter: the same in 3D</h2>
      <p class="mb-2">
        The fused lines above come from Mahony's filter. It keeps the whole orientation (a quaternion) and turns it by the gyro each reading. Then it compares where gravity says up is with where the orientation says it is, and steers the gyro's reading toward agreement: some of the difference now (kp, a spring), and the difference added up over time (ki).
      </p>
      <p>
        That added-up part settles only where it cancels the gyro's offset: the filter learns the offset while in use, no holding still needed. That's the −ki ∫e dt line above, on the axes gravity can see.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What it can't see: north</h2>
      <p>
        Gravity says nothing about a turn about the vertical, so yaw, the heading, has only the gyro: it creeps. A compass fixes it the way gravity fixes roll and pitch (see <RouterLink to="/physics/magnetism" :class="link">Magnetism and the compass</RouterLink>); three sensors fused that way give a full attitude that doesn't drift. Step by step, with sliders for τ, kp and ki: <RouterLink to="/learn/imu/fusion" :class="link">Learn the IMU, combining the two</RouterLink>.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Hold it as on screen.</b> Lay the board flat, x away from you, press Start again, then tilt and turn it: the fused φ, θ and ψ follow, quick as the gyro and steady as gravity.</li>
        <li><b>Shake it.</b> Gravity's line jumps; the fused one barely flinches.</li>
        <li><b>Leave it still for a minute.</b> The gyro-alone line walks away; the fused one stays put, and −ki ∫e dt settles near what the gyro reads at rest.</li>
        <li><b>Turn it flat on the table.</b> Roll and pitch don't move; yaw follows, then creeps once you stop: nothing here measures north.</li>
        <li><b>Two boards?</b> Turn one of them half a turn on the tape and try again: the fused attitude fights itself. Line them up again.</li>
      </ol>
    </section>
    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">More to read</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="g in READING" :key="g.topic">
          <p class="mb-1 text-sm font-semibold">{{ g.topic }}</p>
          <ul class="space-y-1 text-sm">
            <li v-for="r in g.items" :key="r.href">
              <a :href="r.href" :class="link">{{ r.title }}</a>
              <span class="text-slate-500 dark:text-slate-400"> · {{ r.note }}</span>
            </li>
          </ul>
        </div>
        <div>
          <p class="mb-1 text-sm font-semibold">On this site</p>
          <ul class="space-y-1 text-sm">
            <li><RouterLink to="/learn/imu" :class="link">Learn the IMU</RouterLink><span class="text-slate-500 dark:text-slate-400"> · step by step with an MPU-6050, sliders for τ, kp and ki</span></li>
            <li><RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink><span class="text-slate-500 dark:text-slate-400"> · and</span> <RouterLink to="/physics/rotation" :class="link">Rotation and the gyroscope</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the two sensors on their own</span></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
