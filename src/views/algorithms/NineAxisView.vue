<script setup>
// Algorithm: attitude and heading, 9-axis sensor fusion. An accelerometer, a
// gyro and a magnetometer (one module, a BMX055; an MPU with an HMC5883L;
// or three boards), fused by Mahony's filter with the compass steering the
// yaw (lib/fusion.js). Zero, the hard-iron calibration (with its gauge), the
// compass on or off; the fused views (FusionViews, nine); what the compass
// adds and why only to the yaw, what goes wrong, mag and gyro without
// gravity, things to try
import { reactive, computed } from 'vue';
import SourceBar from '../../components/SourceBar.vue';
import HintNote from '../../components/HintNote.vue';
import HardIronGauge from '../../components/HardIronGauge.vue';
import FusionViews from '../../components/FusionViews.vue';
import TexMath from '../../components/TexMath.vue';
import { ACCELEROMETERS, GYROSCOPES, MAGNETOMETERS } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { useHardIron } from '../../lib/useHardIron.js';
import { useFusion } from '../../lib/useFusion.js';

const WINDOW_MS = 30000; // the compass's pull and a drift take tens of seconds to show
const src = reactive(useSources({ accel: ACCELEROMETERS, gyro: GYROSCOPES, mag: MAGNETOMETERS }, { windowMs: WINDOW_MS }));
const cal = reactive(useHardIron((fn) => src.onReading((t, v) => fn(t, v.mag)), { windowMs: WINDOW_MS }));
const usable = (m) => m && !m.some((c) => c === null || Number.isNaN(c));
// the field, hard iron off (null with an axis over its range)
const fieldOf = (m) => {
  if (!usable(m)) return null;
  const o = cal.offset;
  return [m[0] - o.x, m[1] - o.y, m[2] - o.z];
};
const fusion = reactive(useFusion((fn) => src.onReading((t, v) => fn(t, v.accel, v.gyro, fieldOf(v.mag))), { windowMs: WINDOW_MS, nine: true }));
const running = computed(() => src.state === 'running');
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const WIKI = 'https://en.wikipedia.org/wiki/';
const READING = [
  { topic: 'The filter', items: [
    { href: 'https://doi.org/10.1109/TAC.2008.923738', title: 'Nonlinear Complementary Filters on the Special Orthogonal Group', note: 'Robert Mahony, Tarek Hamel and Jean-Michel Pflimlin, IEEE Transactions on Automatic Control, 2008: the filter, gravity and the compass' },
    { href: 'https://doi.org/10.1109/ICORR.2011.5975346', title: 'Estimation of IMU and MARG orientation using a gradient descent algorithm', note: 'Sebastian Madgwick, Andrew Harrison and Ravi Vaidyanathan, ICORR 2011: MARG, the same three sensors, another small filter' },
    { href: `${WIKI}Attitude_and_heading_reference_system`, title: 'Attitude and heading reference system', note: 'Wikipedia: an AHRS, what this page builds' },
  ] },
  { topic: 'Compass and gyro elsewhere', items: [
    { href: `${WIKI}Heading_indicator`, title: 'Heading indicator', note: 'Wikipedia: an aircraft\'s gyro heading, often slaved to a magnetic compass' },
    { href: `${WIKI}Spacecraft_attitude_determination_and_control`, title: 'Spacecraft attitude determination and control', note: 'Wikipedia: in orbit, magnetometers and gyros without gravity' },
    { href: 'https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml', title: 'Magnetic field calculator', note: 'NOAA: your declination, magnetic north against true north' },
  ] },
];
const COMPASS_ERROR = String.raw`\hat{\mathbf{n}} = \frac{\mathbf{B}_h}{\lVert \mathbf{B}_h \rVert}, \quad \mathbf{B}_h = \mathbf{B} - (\mathbf{B}\cdot\hat{\mathbf{v}})\,\hat{\mathbf{v}}, \qquad \mathbf{e} = \hat{\mathbf{a}} \times \hat{\mathbf{v}} + \hat{\mathbf{n}} \times \hat{\mathbf{N}}`;
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Algorithm</p>
      <h1 class="text-2xl font-bold">Attitude and heading: 9-axis fusion</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Gravity steadies roll and pitch but can't see a turn about the vertical; a compass can. Add a magnetometer to the accelerometer and the gyro, and one filter gives the whole attitude: roll, pitch and a heading to magnetic north, quick as the gyro, and drifting nowhere. An attitude and heading reference system (AHRS), the kind in a drone or a phone. On one module with all three (a BMX055), or on boards side by side.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Combines <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink> + <RouterLink to="/physics/rotation" :class="link">Rotation and gyroscope</RouterLink> + <RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink>; it builds on <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink> and <RouterLink to="/algorithms/compass" :class="link">A tilt-compensated compass</RouterLink>.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button :class="button" :disabled="!running || fusion.zeroing" @click="fusion.zero">{{ fusion.zeroing ? 'Hold still…' : 'Zero' }}</button>
        <button v-if="!cal.calibrating" :class="button" :disabled="!running" @click="cal.start">{{ cal.calibrated ? 'Calibrate again' : 'Calibrate' }}</button>
        <button v-else class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700" @click="cal.finish(); fusion.restart()">Done</button>
        <button v-if="cal.calibrated" class="text-sm text-slate-500 underline dark:text-slate-400" @click="cal.clear(); fusion.restart()">Clear</button>
        <label class="flex items-center gap-2 text-sm"><input v-model="fusion.compassOn" type="checkbox" class="accent-emerald-600"> the compass steers the yaw</label>
      </div>
      <HardIronGauge v-if="cal.calibrating" :span="cal.span" />
      <HintNote class="mt-3">
        Calibrate first: press Calibrate, turn the board slowly every way round until the bars are full, and press Done (the board's own field, hard iron, is taken off). Then hold it still and press Zero (the gyro's offset). Without the calibration the heading won't go round.
      </HintNote>
      <HintNote v-if="src.apart" class="mt-3">
        Separate boards: line them up so their printed x, y and z arrows point the same ways, and fix them together. The filter takes them as one board; an axis turned the other way reads as a turn the other way.
      </HintNote>
    </section>

    <FusionViews :fusion="fusion" :running="running" :window-ms="WINDOW_MS" />

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What the compass adds: north, for the yaw only</h2>
      <p class="mb-2">
        <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink> steers q by one error: gravity's up, â, against up as q says it, v̂. That pins roll and pitch, but a turn about the vertical leaves both ups where they were, so the yaw has only the gyro, and creeps. The compass gives a second pair to compare: north as the field says it, n̂, and north as q says it, N̂ (the world's X, magnetic north here, turned into the board's axes):
      </p>
      <TexMath class="mb-2 block" display :expr="COMPASS_ERROR" />
      <p class="mb-2">
        Earth's field dips into the ground (see <RouterLink to="/algorithms/compass" :class="link">A tilt-compensated compass</RouterLink>), so its dip is taken off first, along q's up: n̂ lies level. N̂ lies level too, so their cross product points straight up. Added to gravity's error, it turns q about the vertical and nothing else: the compass steers the heading, gravity keeps roll and pitch.
      </p>
      <p>
        Why not let the compass steer the tilt as well, as some filters do? The field is the weaker, the more easily bent of the two: a steel table, a laptop, a magnet bend it, and gravity knows the tilt better. Given only the yaw, a disturbed compass can drag the heading, never the horizon.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What the filter learns now</h2>
      <p>
        The integral, ki ∫e dt, settles where it cancels the gyro's offset, b̂ in the numbers above. With gravity alone it learns the offset only on the axes gravity sees: roll and pitch. With the compass's error along the vertical as well, it learns the third too: held still, b̂ settles at what the gyro reads at rest about every axis, and the gyro-alone yaw is the only line left walking away.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Where it goes wrong</h2>
      <ul class="list-disc space-y-2 pl-5">
        <li><b>Not calibrated.</b> The board's own field, hard iron, can outweigh Earth's level part (a BMX055 module's is about twice it): the compass then rocks instead of going round, and pulls the heading with it. Calibrate; see <RouterLink to="/bmx055#magnetometer" :class="link">the BMX055's hard iron</RouterLink>.</li>
        <li><b>Magnets and steel nearby.</b> They bend the field, so ψ<sub>m</sub> swings; the fused heading follows, slowly, over a second or so. A gyro that says the board didn't turn while the compass says it did means something magnetic came near.</li>
        <li><b>Magnetic north isn't true north.</b> The yaw here is the magnetic heading; the gap to true north, the declination, depends on where you are (NOAA's calculator, below).</li>
        <li><b>A push.</b> The accelerometer takes it for a tilt, as on the attitude page; the gyro rides it through.</li>
      </ul>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Compass and gyro, without gravity</h2>
      <p>
        The same pairing works elsewhere. An aircraft's heading indicator is a gyro, and in many it is slaved to a magnetic compass that nudges it toward north all the time, what the compass does to ψ<sub>q</sub> here. In orbit an accelerometer reads nothing, everything falling together, so it can't find down: small satellites work out their attitude from a magnetometer, compared with a model of Earth's field along the orbit, and gyros, often with sun sensors.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Calibrate, then Zero.</b> Fill the bars, press Done, hold it still and press Zero.</li>
        <li><b>Turn it round, flat.</b> ψ<sub>q</sub> follows the turn as quickly as the gyro, and the heading indicator reads the same as a phone's compass held alongside (magnetic heading, not true).</li>
        <li><b>Tilt it while facing one way.</b> The heading holds: the compass is levelled by q's up, the dip taken off.</li>
        <li><b>Switch the compass off and leave it for a minute.</b> ψ<sub>q</sub> creeps like ψ<sub>ω</sub>. Switch it back on: over a few seconds ψ<sub>q</sub> is pulled back onto ψ<sub>m</sub>.</li>
        <li><b>Bring a magnet near, then take it away.</b> ψ<sub>m</sub> jumps, ψ<sub>q</sub> follows it more slowly, and the gyro, ψ<sub>ω</sub>, says the board never turned. Take the magnet away and both come back.</li>
        <li><b>Leave it still for two minutes.</b> b̂'s third number settles at the gyro's offset about z, which gravity alone could never learn.</li>
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
            <li><RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the filter without the compass, its gains to try</span></li>
            <li><RouterLink to="/algorithms/compass" :class="link">A tilt-compensated compass</RouterLink><span class="text-slate-500 dark:text-slate-400"> · ψ<sub>m</sub> on its own, step by step</span></li>
            <li><RouterLink to="/bmx055" :class="link">BMX055</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the module with all three</span></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
