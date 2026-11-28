<script setup>
// Algorithm: height and climb from a barometer and an accelerometer. The
// accelerometer turned into the room's frame by the attitude (accelerometer
// and gyro, Mahony's filter), its vertical part less gravity; the
// barometer's height above where it started; the two fused by a third-order
// complementary filter (lib/height.js, lib/useHeight.js), the accelerometer
// alone beside it. Live on one module that has all three (a 10-axis board:
// an MPU and a BMP280) or on separate boards.
import { reactive, computed } from 'vue';
import SourceBar from '../../components/SourceBar.vue';
import HintNote from '../../components/HintNote.vue';
import LiveChart from '../../components/LiveChart.vue';
import TexMath from '../../components/TexMath.vue';
import { ACCELEROMETERS, GYROSCOPES, BAROMETERS } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { useHeight, DEFAULT_TAU_S } from '../../lib/useHeight.js';

const WINDOW_MS = 20000;
const HEIGHT_SPAN_M = 0.5; // the charts' least span
const CLIMB_SPAN_MS = 0.5;
const HEIGHT = [{ label: 'the barometer', color: '--series-1' }, { label: 'fused', color: '--series-3' }];
const ALONE = [{ label: 'the accelerometer alone', color: '--series-2' }];
const CLIMB = [{ label: 'climb, fused', color: '--series-3' }];
const src = reactive(useSources({ accel: ACCELEROMETERS, gyro: GYROSCOPES, baro: BAROMETERS }, { windowMs: WINDOW_MS }));
const height = reactive(useHeight((fn) => src.onReading((t, v) => fn(t, v.accel, v.gyro, v.baro)), { windowMs: WINDOW_MS }));
const n = computed(() => height.now);
// the accelerometer and the gyro on two boards: their axes lined up by hand
// (the barometer's way round doesn't matter)
const imuApart = computed(() => {
  const pick = (k) => src.found[k]?.[src.chosen[k]];
  const a = pick('accel'), g = pick('gyro');
  return Boolean(a && g && !(a.chip.family && a.chip.family === g.chip.family && (!a.chip.sameAddress || a.address === g.address)));
});
const fmt = (v, digits) => (v === undefined || v === null || Number.isNaN(v) ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const tile = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const WIKI = 'https://en.wikipedia.org/wiki/';
const READING = [
  { topic: 'The ideas', items: [
    { href: `${WIKI}Complementary_filter`, title: 'Complementary filter', note: 'Wikipedia: two sensors, each trusted where it is good' },
    { href: `${WIKI}Kalman_filter`, title: 'Kalman filter', note: 'Wikipedia: the statistical way, in navigation systems' },
    { href: `${WIKI}Dead_reckoning`, title: 'Dead reckoning', note: 'Wikipedia: position added up from motion alone, and its drift' },
  ] },
  { topic: 'Where it\'s used', items: [
    { href: `${WIKI}Variometer`, title: 'Variometer', note: 'Wikipedia: the climb meter of gliders and paragliders' },
    { href: `${WIKI}Barometric_formula`, title: 'Barometric formula', note: 'Wikipedia: pressure and height' },
  ] },
];
const PARTS = String.raw`a_{\uparrow} = \left(\mathbf{q} \otimes (0,\ \mathbf{a}_b) \otimes \mathbf{q}^{*}\right)_Z \cdot g - g, \qquad h_{\text{baro}} = \frac{R\,T}{M\,g}\,\ln\frac{p_0}{p}`;
const FILTER = String.raw`\begin{aligned} e &= h_{\text{baro}} - h \\ h &\leftarrow h + (v + k_1 e)\,\Delta t \\ v &\leftarrow v + (a_{\uparrow} - b + k_2 e)\,\Delta t \\ b &\leftarrow b - k_3\,e\,\Delta t \end{aligned} \qquad k_1 = \frac{3}{\tau},\ k_2 = \frac{3}{\tau^2},\ k_3 = \frac{1}{\tau^3}`;
// the filter's numbers now, in its formula's terms
const live = computed(() => {
  const x = n.value;
  if (!x) return null;
  return String.raw`h_{\text{baro}} = ${fmt(x.hBaro, 3)},\ e = ${fmt(x.e, 3)}\ \text{m},\quad h = ${fmt(x.h, 3)}\ \text{m},\ v = ${fmt(x.v, 3)}\ \text{m/s},\quad a_{\uparrow} = ${fmt(x.aUp, 2)},\ b = ${fmt(x.b, 3)}\ \text{m/s}^2,\quad \Delta t = ${fmt(x.dt * 1000, 0)}\ \text{ms}`;
});
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Algorithm</p>
      <h1 class="text-2xl font-bold">Height from pressure and acceleration</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A barometer knows how high it is, but only on average: its reading is noisy, and smoothing it makes it late. An accelerometer feels every move up or down at once, but adding its readings up twice to get a height drifts away within seconds. Together, each correcting the other, they give a height that is both quick and steady, and how fast it is climbing: what a drone holds its altitude with, and what makes a paraglider's variometer beep in a thermal. It runs on one board with all three sensors (an MPU and a BMP280 on a 10-axis module) or on separate boards.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Combines <RouterLink to="/physics/pressure" :class="link">Air pressure and height</RouterLink> + <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink>, with <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink> to know which way is up.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button :class="button" :disabled="src.state !== 'running'" @click="height.restart">Start again</button>
        <label class="flex items-center gap-2 text-sm">τ
          <input v-model.number="height.tau" type="range" min="0.25" max="4" step="0.25" class="w-40 accent-emerald-600">
          <span class="font-mono tabular-nums">{{ height.tau.toFixed(2) }} s</span>
        </label>
        <HintNote>Start again: height 0 here, the pressure now the reference, every filter from scratch. τ: how long the filter takes to trust the barometer over the accelerometer ({{ DEFAULT_TAU_S }} s to begin with).</HintNote>
      </div>
      <HintNote v-if="imuApart" class="mt-3">
        The accelerometer and the gyro are on two boards: line them up so their printed x, y and z arrows point the same ways, and fix them together. The barometer can sit any way round.
      </HintNote>
    </section>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Height, fused</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(n?.h, 2) }} <span class="text-base">m</span></p>
      </section>
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Climb</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(n?.v, 2) }} <span class="text-base">m/s</span></p>
      </section>
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">The barometer's height</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(n?.hBaro, 2) }} <span class="text-base">m</span></p>
      </section>
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Offset learned, b</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(n?.b, 3) }} <span class="text-base">m/s²</span></p>
      </section>
    </div>

    <section :class="card">
      <LiveChart title="Height: the barometer and fused" unit="m" :series="HEIGHT" :values="n ? [n.hBaro, n.h] : []" :source="height.heightSource" :window-ms="WINDOW_MS" :floor="HEIGHT_SPAN_M" :digits="2" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Lift the board from the desk to above your head and back. The barometer's line follows, fuzzy; the fused one follows as quickly, smoothly.
      </p>
    </section>
    <section :class="card">
      <LiveChart title="Height: the accelerometer alone" unit="m" :series="ALONE" :values="n ? [n.hAlone] : []" :source="height.aloneSource" :window-ms="WINDOW_MS" :floor="HEIGHT_SPAN_M" :digits="2" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The same upward acceleration added up twice from rest, no barometer: it runs away, faster each second (its own scale here, or it would flatten the chart above). A small offset in the accelerometer, a few hundredths of g, is already metres within seconds.
      </p>
      <p v-if="n" class="mt-2 text-sm leading-relaxed">
        <b>The runaway is the offset's.</b> The offset the filter has learned, b = {{ fmt(n.b, 3) }} m/s², added up twice for the {{ fmt(n.elapsed, 0) }} s since the start: ½ · b · t² = ½ × {{ fmt(n.b, 3) }} × {{ fmt(n.elapsed, 0) }}² = <b class="font-mono tabular-nums">{{ fmt(0.5 * n.b * n.elapsed ** 2, 1) }} m</b>. The accelerometer alone shows <b class="font-mono tabular-nums">{{ fmt(n.hAlone, 1) }} m</b>: left still since Start again, the two agree once b has settled (a few τ); a move in between adds its own share.
      </p>
    </section>
    <section :class="card">
      <LiveChart title="Climb" unit="m/s" :series="CLIMB" :values="n ? [n.v] : []" :source="height.climbSource" :window-ms="WINDOW_MS" :floor="CLIMB_SPAN_MS" :digits="2" fit />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Each alone falls short</h2>
      <p class="mb-2">
        <b>The barometer</b> turns the air's weight into a height: about 12 Pa for every metre near the ground. A BMP280's noise is a pascal or two, so its height jitters by ten centimetres or more, reading to reading; average it to calm it, and it lags behind every move.
      </p>
      <p>
        <b>The accelerometer</b> feels a lift the moment it starts. Its upward acceleration, added up once, is the climb; added up again, the height. But it reads a little even when still (an offset), and that is added up twice too: it grows with the square of the time.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Which way is up</h2>
      <p class="mb-2">
        The accelerometer reads in the board's own axes, and the board may be tilted. So its reading is first turned into the room's axes, by the attitude the accelerometer and the gyro give together (<RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink>, its q); its vertical part, less gravity's 1 g, is the upward acceleration a<sub>↑</sub>. The barometer's height comes from the pressure p against the pressure p<sub>0</sub> where it started, at the air's own temperature:
      </p>
      <TexMath class="mb-2 block" display :expr="PARTS" />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">The filter</h2>
      <p class="mb-2">
        The filter keeps three numbers: the height h, the climb v, and the accelerometer's offset b, which it learns. Each reading it adds up the acceleration (less b) into v and v into h, as the accelerometer alone would; then it compares its height with the barometer's, and nudges all three by the gap e:
      </p>
      <TexMath class="mb-2 block" display :expr="FILTER" />
      <p v-if="live" class="mb-2 overflow-x-auto text-sm"><TexMath :expr="live" /></p>
      <p class="mb-2">
        Over less than τ the accelerometer leads: a quick lift shows at once, and the barometer's jitter, too fast to matter, is smoothed out. Over more than τ the barometer leads: the drift can't build up, and b settles where it cancels the accelerometer's offset. With these three gains the gap dies away as smoothly as it can, no overshoot, in about τ.
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        On a simulated lift of 1 m, with a barometer's noise of 13 cm: τ = 1 s left the fused height within 3 cm (RMS), 5 cm at worst on the lift; 0.5 s and 2 s did worse (this site's tests).
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What it can't fix</h2>
      <p>
        The barometer measures the air, not the height: a door shutting, a draught, the weather changing over an hour all move it, and the filter, trusting it in the long run, follows. A real altimeter is set to the day's pressure for that; here Start again sets height 0 where the board is. A long, hard shake can fool the attitude for a moment, and with it which way is up.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Lift it.</b> Press Start again, then lift the board from the desk to above your head, and back: compare the barometer's line with the fused one, and watch the climb rise and fall.</li>
        <li><b>Leave it still.</b> The accelerometer alone runs away; the fused height stays near 0, and b settles to the accelerometer's offset.</li>
        <li><b>Change τ.</b> At 0.25 s the fused line is nearly the barometer's, jitter and all; at 4 s it is smooth, but slow to learn b, so it wanders after Start again.</li>
        <li><b>Tilt it while you lift.</b> The attitude keeps track of which way is up, so the height still follows.</li>
        <li><b>Shut a door, or open a window.</b> The barometer sees the air move, and the fused height follows it after a moment: what it can't fix.</li>
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
            <li><RouterLink to="/physics/pressure" :class="link">Air pressure and height</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the barometer on its own</span></li>
            <li><RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink><span class="text-slate-500 dark:text-slate-400"> · which way is up</span></li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
