<script setup>
// Position, speed and acceleration of a ball dropped under a distance sensor
// looking down, drawn as Distance and time of flight's three charts are
// (x, v, a; the newest at the right, the last WINDOW_S scrolling): a made-up
// motion for the home page, no sensor. Each run: held HOLD_S just below the
// sensor, dropped to the floor, bouncing back with RESTITUTION of its speed
// each time, then lifted back up smoothly. Simulated once at STEP_S; s, the
// clock in seconds, picks the window.
import { computed } from 'vue';

const props = defineProps({
  s: { type: Number, default: 0 },
});

const G = 9.81; // m/s2
const START_M = 0.1; // held this far below the sensor
const FLOOR_M = 0.9; // the floor, from the sensor
const RESTITUTION = 0.7; // the speed kept at a bounce
const HOLD_S = 0.5;
const LIFT_S = 0.7;
const RUN_S = 4.5; // one run: held, dropped, bouncing, lifted
const STEP_S = 0.002;
const WINDOW_S = 4;
const A_CLIP = 30; // m/s2: a bounce's spike drawn cut at this

// one run, simulated: x (m, from the sensor), v (m/s, away +), a (m/s2)
const RUN = (() => {
  const n = Math.round(RUN_S / STEP_S);
  const x = new Float64Array(n), v = new Float64Array(n), a = new Float64Array(n);
  let px = START_M, pv = 0;
  const liftFrom = RUN_S - LIFT_S;
  let liftX = null;
  for (let i = 0; i < n; i++) {
    const t = i * STEP_S;
    if (t < HOLD_S) {
      px = START_M; pv = 0;
    } else if (t < liftFrom) {
      pv += G * STEP_S;
      px += pv * STEP_S;
      if (px >= FLOOR_M) { px = FLOOR_M; pv = -RESTITUTION * Math.abs(pv); }
    } else {
      // lifted back up: an eased path from where it lies to the start
      if (liftX === null) liftX = px;
      const u = (t - liftFrom) / LIFT_S;
      const nx = START_M + (liftX - START_M) * (1 + Math.cos(Math.PI * u)) / 2;
      pv = (nx - px) / STEP_S;
      px = nx;
    }
    x[i] = px; v[i] = pv;
  }
  for (let i = 0; i < n; i++) a[i] = (v[(i + 1) % n] - v[i]) / STEP_S;
  return { n, x, v, a };
})();

const W = 360;
const ROW = 62;
const GAP = 22; // between rows: room for the next row's title
const PAD_T = 18; // above the first row: its title
const PAD_B = 6;
const PAD_L = 40;
const PAD_R = 8;
const ROWS = [
  { key: 'x', label: 'x, distance', unit: 'm', lo: 0, hi: 1, color: '--series-1', ticks: [0, 0.5, 1] },
  { key: 'v', label: 'v, speed', unit: 'm/s', lo: -4, hi: 4, color: '--series-2', ticks: [-4, 0, 4] },
  { key: 'a', label: 'a, acceleration', unit: 'm/s²', lo: -A_CLIP, hi: A_CLIP, color: '--series-3', ticks: [-30, 0, 30], mark: G, markLabel: 'g' },
];
const H = PAD_T + ROWS.length * ROW + (ROWS.length - 1) * GAP + PAD_B;
const top = (i) => PAD_T + i * (ROW + GAP);
const yOf = (row, i, value) => top(i) + ROW - ((Math.max(row.lo, Math.min(row.hi, value)) - row.lo) / (row.hi - row.lo)) * ROW;
const EVERY = 4; // a point drawn every 4th step: smooth enough, cheap
const POINTS = Math.round(WINDOW_S / STEP_S / EVERY);
const wrap = (j) => ((j % RUN.n) + RUN.n) % RUN.n;
// a row's value for the steps a point stands for: the step itself, or for
// a the largest of them (a bounce lasts one step: never skipped)
function valueAt(key, step) {
  if (key !== 'a') return RUN[key][wrap(step)];
  let best = 0;
  for (let d = 0; d < EVERY; d++) {
    const v = RUN.a[wrap(step - d)];
    if (Math.abs(v) > Math.abs(best)) best = v;
  }
  return best;
}

const paths = computed(() => {
  const end = Math.floor(props.s / STEP_S);
  return ROWS.map((row, i) => {
    const pts = [];
    for (let k = 0; k <= POINTS; k++) {
      const step = end - (POINTS - k) * EVERY;
      const px = PAD_L + (k / POINTS) * (W - PAD_L - PAD_R);
      pts.push(`${px.toFixed(1)},${yOf(row, i, valueAt(row.key, step)).toFixed(1)}`);
    }
    return `M${pts.join('L')}`;
  });
});
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto w-full max-w-md" role="img" aria-label="Position, speed and acceleration of a ball dropped under a distance sensor: the distance in parabolas shrinking at each bounce, the speed in straight lines flipping at each bounce, the acceleration at g while it falls">
    <g v-for="(row, i) in ROWS" :key="row.key">
      <line v-for="t in row.ticks" :key="t" :x1="PAD_L" :x2="W - PAD_R" :y1="yOf(row, i, t)" :y2="yOf(row, i, t)" style="stroke: var(--chart-grid)" />
      <text v-for="t in row.ticks" :key="`l${t}`" :x="PAD_L - 5" :y="yOf(row, i, t) + 3" text-anchor="end" font-size="9" style="fill: var(--chart-text)">{{ t }}</text>
      <line v-if="row.mark" :x1="PAD_L" :x2="W - PAD_R" :y1="yOf(row, i, row.mark)" :y2="yOf(row, i, row.mark)" style="stroke: var(--chart-text)" stroke-dasharray="3 3" />
      <text v-if="row.mark" :x="W - PAD_R - 2" :y="yOf(row, i, row.mark) - 3" text-anchor="end" font-size="10" style="fill: var(--chart-text)">{{ row.markLabel }}</text>
      <path :d="paths[i]" fill="none" :style="{ stroke: `var(${row.color})` }" stroke-width="2" stroke-linejoin="round" />
      <text :x="PAD_L" :y="top(i) - 7" font-size="11" style="fill: var(--chart-text)">{{ row.label }}, {{ row.unit }}</text>
    </g>
  </svg>
</template>
