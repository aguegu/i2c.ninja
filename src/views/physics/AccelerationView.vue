<script setup>
// Physics: acceleration and gravity. What acceleration is, why a still
// sensor reads 1 g upward, how a MEMS accelerometer feels it (the ADXL345's
// datasheet: a polysilicon proof mass on springs, a differential
// capacitor), tilt from gravity; the devices that measure it; things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import { reactive, ref, computed, onBeforeUnmount } from 'vue';
import LiveChart from '../../components/LiveChart.vue';
import { makeSeries } from '../../lib/series.js';
import SvgDrawing from '../../components/SvgDrawing.vue';
import AccelerometerViews from '../../components/AccelerometerViews.vue';
import SourceBar from '../../components/SourceBar.vue';
import { ACCELEROMETERS, BAROMETERS } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { heightAbove, pascalsPerMetre } from '../../lib/pressure.js';

// the accelerometer, and a barometer if there's one on the bus (a 10-axis
// board): the drop timer's second witness
const all = useSources({ accel: ACCELEROMETERS, baro: BAROMETERS }, { optional: ['baro'] });
const src = reactive({ ...all, latest: computed(() => all.latest.value?.accel ?? null), source: all.sources.accel });
// |a|, the acceleration's size, its own chart: 1 g at rest whatever the tilt,
// past 1 g shaken, toward 0 g falling
const WINDOW_MS = 10000;
const SIZE_FLOOR_G = 1.5; // the chart reaches at least this: 1 g well inside
const SIZE = [{ label: '|a|', color: '--chart-text' }];
const size = makeSeries(1, WINDOW_MS);
const stop = all.onReading((t, v) => {
  const g = Math.hypot(...v.accel);
  size.push(t, [g]);
  if (v.baro) baroStep(t, v.baro);
  dropStep(t, g);
});
onBeforeUnmount(stop);

// the drop timer: a fall is |a| below FALL_G; its start and end each where
// |a| crosses FALL_G, between the two readings either side (interpolated), so
// the time isn't only as fine as the readings; its height from that time,
// h = ½ g t²; the landing's peak |a| in the LANDING_MS after it
const G = 9.81; // m/s², a free fall's acceleration
const FALL_G = 0.5; // |a| below this: falling (1 g at rest, ~0 g falling)
const MIN_FALL_MS = 80; // shorter: a bump or a shake, not a drop (~3 cm)
const MAX_FALL_MS = 3000; // longer: not a drop (set down on its side? held weightless?)
const LANDING_MS = 300;
const KEEP = 5;
const drops = ref([]); // [{ s, cm, ± cm, peak g, readings, gapMs }], the newest first
let prev = null, start = null, readings = 0, gapMax = 0, landing = null;
const cross = (a, b) => a.t + ((FALL_G - a.g) / (b.g - a.g)) * (b.t - a.t); // when |a| passed FALL_G
function dropStep(t, g) {
  const now = { t, g };
  if (landing) {
    if (t <= landing.until) landing.drop.peak = Math.max(landing.drop.peak, g);
    else landing = null;
  }
  if (prev) {
    if (start === null && prev.g >= FALL_G && g < FALL_G) { start = cross(prev, now); readings = 1; gapMax = t - prev.t; }
    else if (start !== null && g < FALL_G) { readings++; gapMax = Math.max(gapMax, t - prev.t); if (t - start > MAX_FALL_MS) start = null; }
    else if (start !== null && g >= FALL_G) {
      const ms = cross(prev, now) - start;
      gapMax = Math.max(gapMax, t - prev.t);
      if (ms >= MIN_FALL_MS) {
        const s = ms / 1000;
        // the time's uncertainty, about half a reading's gap at each end: dh/h = 2 dt/t
        const cm = 50 * G * s * s;
        const end = cross(prev, now);
        const drop = { id: ++dropCount, s, cm, pm: (cm * 2 * (gapMax / 2 / 1000)) / s, peak: g, readings, gapMs: gapMax, at: new Date(), start, end, baro: barometer.value ? { pending: true } : null };
        drops.value = [drop, ...drops.value].slice(0, KEEP);
        landing = { until: t + LANDING_MS, drop };
      }
      start = null;
    }
  }
  prev = now;
}
const lastDrop = computed(() => drops.value[0] ?? null);

// the barometer's witness: the air pressure held still before the fall
// (BEFORE_MS before its start) against lying still after it (AFTER_MS after
// the landing), the height between them by the hypsometric equation
// (lib/pressure.js); its ± from the readings' scatter in each window
// (standard errors), turned into metres by the air's weight per metre
const BEFORE_MS = [700, 150]; // from, to: before the fall's start
const AFTER_MS = [400, 1400]; // from, to: after the landing, the bounce over
const BARO_KEEP_MS = 5000;
const barometer = ref(false); // a barometer read on this connection
const baro = []; // [{ t, p Pa, c C }], the last BARO_KEEP_MS
let dropCount = 0;
const stats = (xs) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1));
  return { m, se: sd / Math.sqrt(xs.length) };
};
function baroStep(t, [p, c]) {
  barometer.value = true;
  baro.push({ t, p, c });
  while (baro.length && baro[0].t < t - BARO_KEEP_MS) baro.shift();
  const due = drops.value.find((d) => d.baro?.pending && t >= d.end + AFTER_MS[1]);
  if (!due) return;
  const inWin = (a, b) => baro.filter((x) => x.t >= a && x.t <= b);
  const before = inWin(due.start - BEFORE_MS[0], due.start - BEFORE_MS[1]);
  const after = inWin(due.end + AFTER_MS[0], due.end + AFTER_MS[1]);
  let result = { missed: true };
  if (before.length >= 2 && after.length >= 2) {
    const b = stats(before.map((x) => x.p)), a = stats(after.map((x) => x.p));
    const cAir = before.reduce((n, x) => n + x.c, 0) / before.length;
    result = { cm: -100 * heightAbove(a.m, b.m, cAir), pm: (100 * Math.hypot(a.se, b.se)) / pascalsPerMetre(b.m, cAir), n: before.length + after.length };
  }
  drops.value = drops.value.map((d) => (d.id === due.id ? { ...d, baro: result } : d));
}
const sizeNow = computed(() => (src.latest ? Math.hypot(...src.latest) : null));

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Acceleration and gravity</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Acceleration is how fast a velocity changes: speeding up, slowing down, turning. Accelerometers measure it in g, the acceleration of free fall at the Earth's surface (about 9.81 m/s²). And they show something surprising: sitting still on a desk, one reads 1 g, pointing up.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
    </section>

    <AccelerometerViews :a="src.latest ? { x: src.latest[0], y: src.latest[1], z: src.latest[2] } : null" :source="src.source" />

    <CollapsibleCard id="size-of-a" title="|a|: the size of the acceleration">
      <LiveChart title="|a|" unit="g" :series="SIZE" :values="sizeNow === null ? [] : [sizeNow]" :source="size.source" :window-ms="WINDOW_MS" :floor="SIZE_FLOOR_G" :digits="3" from-zero />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The three axes together, √(x² + y² + z²): 1 g at rest however it's tilted, more when shaken, and toward 0 g
        while it falls. Drop it onto a cushion: the dip to 0 is the fall, the spike after it the landing. The dip's
        length gives the height, h = ½ g t²: 0.32 s is about 50 cm, 0.45 s about 1 m.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="drop-timer" title="Drop timer" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Drop timer</h2>
      <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Connect, hold the board over a cushion and let go. The fall is timed from where |a| drops below {{ FALL_G }} g to
        where it climbs back at the landing, and the height worked out from it: an object falls h = ½ g t² in a time t.
      </p>
      <div v-if="lastDrop" class="flex flex-wrap items-baseline gap-x-8 gap-y-2 font-mono tabular-nums">
        <p class="text-4xl">{{ lastDrop.s.toFixed(3) }} <span class="text-lg">s</span></p>
        <p class="text-4xl">≈ {{ lastDrop.cm.toFixed(0) }} <span class="text-lg">cm</span> <span class="text-base text-slate-500 dark:text-slate-400">± {{ lastDrop.pm.toFixed(0) }}</span></p>
        <p class="text-2xl">landing {{ lastDrop.peak.toFixed(1) }} <span class="text-base">g</span></p>
        <p v-if="lastDrop.baro" class="text-2xl">
          <span class="font-sans text-base text-slate-500 dark:text-slate-400">the barometer:</span>
          <template v-if="lastDrop.baro.pending"> <span class="font-sans text-base text-slate-500 dark:text-slate-400">lie it still a moment…</span></template>
          <template v-else-if="lastDrop.baro.missed"> <span class="font-sans text-base text-slate-500 dark:text-slate-400">too few readings to tell</span></template>
          <template v-else>≈ {{ lastDrop.baro.cm.toFixed(0) }} <span class="text-base">cm</span> <span class="text-base text-slate-500 dark:text-slate-400">± {{ lastDrop.baro.pm.toFixed(0) }}</span></template>
        </p>
      </div>
      <p v-else class="text-slate-500 dark:text-slate-400">No drop yet.</p>
      <table v-if="drops.length > 1" class="mt-3 font-mono text-sm tabular-nums">
        <thead>
          <tr class="text-left text-slate-500 dark:text-slate-400">
            <th class="py-1 pr-6 font-sans font-normal">earlier</th>
            <th class="py-1 pr-6 text-right font-normal">time</th>
            <th class="py-1 pr-6 text-right font-normal">height</th>
            <th class="py-1 text-right font-normal">landing</th>
            <th v-if="barometer" class="py-1 pl-6 text-right font-normal">the barometer</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, i) in drops.slice(1)" :key="i">
            <td class="py-0.5 pr-6 font-sans text-slate-500 dark:text-slate-400">{{ d.at.toLocaleTimeString() }}</td>
            <td class="py-0.5 pr-6 text-right">{{ d.s.toFixed(3) }} s</td>
            <td class="py-0.5 pr-6 text-right">{{ d.cm.toFixed(0) }} ± {{ d.pm.toFixed(0) }} cm</td>
            <td class="py-0.5 text-right">{{ d.peak.toFixed(1) }} g</td>
            <td v-if="barometer" class="py-0.5 pl-6 text-right">{{ d.baro && !d.baro.pending && !d.baro.missed ? `${d.baro.cm.toFixed(0)} ± ${d.baro.pm.toFixed(0)} cm` : '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="lastDrop" class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {{ lastDrop.readings }} readings in the fall, up to {{ lastDrop.gapMs.toFixed(0) }} ms apart: the start and end are
        found between readings, so the time is good to about half a gap at each end, hence the ±. A tumble on the way
        reads a little above 0 g (the chip spins round the board's centre), and a soft cushion stretches the landing.
      </p>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        <b>A second witness.</b> With a barometer on the bus too (a 10-axis board has one, or wire one beside it: a <RouterLink to="/bmp280" :class="link">BMP280</RouterLink> or an <RouterLink to="/spl06" :class="link">SPL06</RouterLink>), the drop is measured a second way, knowing nothing of the fall's time: the air pressure while you held it, against the pressure once it lies still on the cushion, about 12 Pa more for every metre lower (<RouterLink to="/physics/pressure" :class="link">Air pressure and height</RouterLink>). Hold it still a moment before letting go, and leave it a second after: the two heights should agree within their ±.<template v-if="!barometer"> No barometer found on this connection.</template>
      </p>
    </CollapsibleCard>


    <CollapsibleCard id="a-mass-on-springs" title="A mass on springs" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">A mass on springs</h2>
      <p class="mb-2">
        Inside an accelerometer chip is a tiny mass hung on springs (in the ADXL345, a polysilicon proof mass on polysilicon springs, over the silicon). Push the chip and the mass lags behind until the springs pull it along: the reading points with the push.
      </p>
      <p class="mb-2">
        <b>Why 1 g up at rest?</b> Sitting still, the springs must hold the mass up against gravity, exactly as hard as if the chip were being pushed upward at 1 g. That is what it reads. <b>Falling freely</b>, nothing has to hold the mass, the springs relax, and it reads 0 g, however fast it falls. An accelerometer can't tell gravity from being pushed: to it they're the same thing.
      </p>
      <SvgDrawing src="/adxl345-mass-springs.svg" alt="Three moments of a mass on springs in a chip: held still the mass sags and it reads 1 g up; pushed to the right (seen from above) the mass lags left and it reads the push to the right; falling, the springs relax and it reads 0 g" class="mx-auto mb-3 w-full max-w-2xl" />
      <p class="mb-2">
        <b>Read by capacitors.</b> Plates on the mass sit between fixed plates: a differential capacitor. Centred, both gaps and both capacitances are equal; when the mass moves, one gap narrows and the other widens. How much tells the size of the acceleration; which side, its direction. A chip has such a sensor for each of its three axes.
      </p>
      <SvgDrawing src="/adxl345-capacitor.svg" alt="A finger on the mass between two fixed plates, C1 and C2: centred, equal gaps, C1 equals C2 and it reads 0; moved toward C1, C1 grows and C2 shrinks: the difference is how much, the bigger one which way" class="mx-auto w-full max-w-2xl" />
    </CollapsibleCard>

    <CollapsibleCard id="tilt-from-gravity" title="Tilt from gravity" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Tilt from gravity</h2>
      <p class="mb-2">
        Held still, the 1 g is shared among the three axes by how the chip is tilted. Flat, it is all on z. Tip the nose up by an angle θ and x reads 1 g × sin θ while z reads 1 g × cos θ: at 30°, x reads 0.5 g. From the shares the tilt comes back: roll and pitch, the way a phone knows which way is up.
      </p>
      <p>
        It works only while the sensor is still: a push adds to gravity and reads as a tilt. And it can't tell the heading (a turn about the vertical changes nothing in how gravity falls on the axes). A gyroscope covers both, which is why phones and drones carry both. Step by step: <RouterLink to="/learn/motion" :class="link">the Motion course</RouterLink>.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Flat and upside down.</b> Lay the board flat: z reads about +1 g, x and y near 0. Turn it over: z reads −1 g. Gravity didn't change; which way the chip faces did.</li>
        <li><b>Find 30°.</b> Raise its nose until x reads 0.5 g: that's 30° (sin 30° = 0.5). Check with a protractor, or a phone's level app.</li>
        <li><b>Drop it.</b> Hold it over a cushion and let go: for that moment |a| falls toward 0 g. In free fall, an accelerometer feels nothing.</li>
        <li><b>Shake and slide.</b> Shake it and |a| jumps past 1 g; slide it across the desk and the push shows on x or y, on top of gravity's share. A push and a tilt look alike to it.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>See also:</b> <RouterLink to="/algorithms/attitude" class="text-emerald-700 underline dark:text-emerald-400">Attitude from accel and gyro</RouterLink>, the two combined.
    </p>
  </main>
</template>
