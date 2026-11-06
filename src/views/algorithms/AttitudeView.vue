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
import { ACCELEROMETERS, GYROSCOPES } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { useFusion } from '../../lib/useFusion.js';

const WINDOW_MS = 10000;
const src = reactive(useSources({ accel: ACCELEROMETERS, gyro: GYROSCOPES }, { windowMs: WINDOW_MS }));
const fusion = reactive(useFusion((fn) => src.onReading((t, v) => fn(t, v.accel, v.gyro)), { windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const formula = 'rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-900';
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
        Each is good exactly where the other is bad, so take the gyro's quick changes and gravity's long-run level. Each reading: turn the angle by the gyro, then move it a small part of the way toward gravity's angle.
      </p>
      <p :class="['mb-2', formula]">angle = α × (angle + rate × Δt) + (1 − α) × gravity's angle,   α = τ / (τ + Δt)</p>
      <p>
        Over less than τ (half a second, say) the gyro wins: a shake is only a nudge. Over more, gravity wins: the drift can't build up. It works per axis, so it's right while the tilts stay modest.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Mahony's filter: the same in 3D</h2>
      <p class="mb-2">
        The fused line, the board and the attitude indicator above come from Mahony's filter. It keeps the whole orientation (a quaternion) and turns it by the gyro each reading. Then it compares where gravity says up is with where the orientation says it is, and steers the gyro's reading toward agreement: some of the difference now (kp, a spring), and the difference added up over time (ki).
      </p>
      <p>
        That added-up part settles only where it cancels the gyro's offset: the filter learns the offset while in use, no holding still needed. That's "gyro offset learned" above, on the axes gravity can see.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Where it comes from: Robert Mahony, Tarek Hamel and Jean-Michel Pfimlin, <a href="https://doi.org/10.1109/TAC.2008.923738" :class="link">Nonlinear Complementary Filters on the Special Orthogonal Group</a> (IEEE Transactions on Automatic Control, 2008). The bigger picture on Wikipedia: <a href="https://en.wikipedia.org/wiki/Attitude_and_heading_reference_system" :class="link">Attitude and heading reference system</a>.
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
        <li><b>Hold it as on screen.</b> Lay the board flat, x away from you, press Start again, then tilt and turn it: the drawing follows, quick as the gyro and steady as gravity.</li>
        <li><b>Shake it.</b> Gravity's line jumps; the fused one barely flinches.</li>
        <li><b>Leave it still for a minute.</b> The gyro-alone line walks away; the fused one stays put, and the offset learned settles near what the gyro reads at rest.</li>
        <li><b>Turn it flat on the table.</b> Roll and pitch don't move; yaw follows, then creeps once you stop: nothing here measures north.</li>
        <li><b>Two boards?</b> Turn one of them half a turn on the tape and try again: the fused attitude fights itself. Line them up again.</li>
      </ol>
    </section>
  </main>
</template>
