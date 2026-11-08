<script setup>
// The gyro's three axes as rings round a ball, seen as lib/view.js does
// (behind the board and to its right): a marker on each ring turns about
// that ring's axis as the board does (its phase, the rate added up), and
// one arrow, the angular velocity: pointing along the axis the board spins
// about (right-hand rule), as long as it spins fast. On each ring a spin
// arrow from its marker, along the ring the way the board turns about that
// axis now, longer the faster. And on each ring, fixed where it comes
// nearest the eye, an arrow for its positive way (the right-hand rule).
// Axes as the board's: x the nose, y left, z up.
import { computed } from 'vue';
import { project as view } from '../lib/view.js';

const props = defineProps({
  rates: { type: Array, default: () => [0, 0, 0] }, // deg/s about x, y, z
  phases: { type: Array, default: () => [0, 0, 0] }, // deg turned about x, y, z
  fullRate: { type: Number, default: 180 }, // deg/s at which the arrow reaches the ring
});

const R = 80; // the rings' radius
const RING_POINTS = 72;
const ARROW_MAX = 1.15; // the arrow's longest, in ring radii
const COLOR = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];
const NAMES = ['x', 'y', 'z'];
const DEG = Math.PI / 180;
const SPIN_MAX_DEG = 120; // a spin arrow's longest sweep, at fullRate
const SPIN_MIN_DEG = 8; // shorter than this: not drawn (the axis nearly still)
const SPIN_STEPS = 24;
const POSITIVE_HALF_DEG = 18; // the positive arrows' half sweep

const project = (v) => view(v, R).slice(0, 2);
// a point on the ring about axis k, at angle a (radians), turning by the
// right-hand rule: about x from y to z, about y from z to x, about z from x to y
function onRing(k, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return project(k === 0 ? [0, c, s] : k === 1 ? [s, 0, c] : [c, s, 0]);
}

// each ring's positive arrow: a short arc where the ring is nearest the eye,
// pointing the way positive turns move its marker
function ringPoint3(k, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return k === 0 ? [0, c, s] : k === 1 ? [s, 0, c] : [c, s, 0];
}
const positives = Array.from({ length: 3 }, (_, k) => {
  let best = 0, depth = -Infinity;
  for (let i = 0; i < RING_POINTS; i++) {
    const a = (2 * Math.PI * i) / RING_POINTS;
    const d = view(ringPoint3(k, a), R)[2];
    if (d > depth) { depth = d; best = a; }
  }
  const pts = Array.from({ length: 13 }, (_, i) => onRing(k, best + ((i / 12) * 2 - 1) * POSITIVE_HALF_DEG * DEG));
  const [a, b] = [pts[11], pts[12]];
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const u = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const back = [b[0] - 7 * u[0], b[1] - 7 * u[1]];
  return {
    line: pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '),
    head: `${b[0].toFixed(1)},${b[1].toFixed(1)} ${(back[0] - 4 * u[1]).toFixed(1)},${(back[1] + 4 * u[0]).toFixed(1)} ${(back[0] + 4 * u[1]).toFixed(1)},${(back[1] - 4 * u[0]).toFixed(1)}`,
  };
});

const rings = Array.from({ length: 3 }, (_, k) => Array.from({ length: RING_POINTS + 1 }, (_, i) => onRing(k, (2 * Math.PI * i) / RING_POINTS).map((v) => v.toFixed(1)).join(',')).join(' '));
const axes = NAMES.map((n, k) => {
  const end = project(k === 0 ? [1.25, 0, 0] : k === 1 ? [0, 1.25, 0] : [0, 0, 1.25]);
  const label = project(k === 0 ? [1.42, 0, 0] : k === 1 ? [0, 1.42, 0] : [0, 0, 1.38]);
  return { n, end, label, color: COLOR[k] };
});

const markers = computed(() => props.phases.map((p, k) => onRing(k, p * DEG)));
// each ring's spin arrow: along the ring from the marker, the rate's way
const spins = computed(() => props.rates.map((rate, k) => {
  const sweep = Math.sign(rate) * Math.min(1, Math.abs(rate) / props.fullRate) * SPIN_MAX_DEG;
  if (Math.abs(sweep) < SPIN_MIN_DEG) return null;
  const from = props.phases[k] * DEG;
  const pts = Array.from({ length: SPIN_STEPS + 1 }, (_, i) => onRing(k, from + (sweep * DEG * i) / SPIN_STEPS));
  const [a, b] = [pts[SPIN_STEPS - 1], pts[SPIN_STEPS]];
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const u = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const back = [b[0] - 9 * u[0], b[1] - 9 * u[1]];
  const head = `${b[0]},${b[1]} ${back[0] - 5 * u[1]},${back[1] + 5 * u[0]} ${back[0] + 5 * u[1]},${back[1] - 5 * u[0]}`;
  return { line: pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '), head };
}));
const arrow = computed(() => {
  const [gx, gy, gz] = props.rates;
  const m = Math.hypot(gx, gy, gz);
  if (m < 1e-6) return null;
  const len = Math.min(ARROW_MAX, m / props.fullRate);
  const tip = project([(gx / m) * len, (gy / m) * len, (gz / m) * len]);
  const sl = Math.hypot(...tip);
  if (sl < 4) return { tip, head: null, m };
  const u = [tip[0] / sl, tip[1] / sl];
  const back = [tip[0] - 10 * u[0], tip[1] - 10 * u[1]];
  const head = `${tip[0]},${tip[1]} ${back[0] - 5 * u[1]},${back[1] + 5 * u[0]} ${back[0] + 5 * u[1]},${back[1] - 5 * u[0]}`;
  return { tip, head, m };
});
</script>

<template>
  <svg viewBox="-130 -125 260 245" class="h-80 w-80 live-view" role="img" :aria-label="`Angular velocity: ${arrow ? arrow.m.toFixed(0) : 0} degrees a second`">
    <circle r="80" fill="none" stroke="var(--chart-grid)" stroke-dasharray="3 4" />
    <g v-for="(n, k) in NAMES" :key="n">
      <polyline :points="rings[k]" fill="none" :stroke="COLOR[k]" stroke-width="2" opacity="0.55" />
      <polyline :points="positives[k].line" fill="none" :stroke="COLOR[k]" stroke-width="2.5" stroke-linecap="round" />
      <polygon :points="positives[k].head" :fill="COLOR[k]" />
    </g>
    <g v-for="a in axes" :key="a.n">
      <line x1="0" y1="0" :x2="a.end[0]" :y2="a.end[1]" :stroke="a.color" stroke-width="1.5" stroke-dasharray="2 3" />
      <text :x="a.label[0]" :y="a.label[1]" :fill="a.color" font-weight="bold" font-size="12" text-anchor="middle" dominant-baseline="middle">{{ a.n }}</text>
    </g>
    <template v-for="(sp, k) in spins" :key="`spin${k}`">
      <g v-if="sp">
        <polyline :points="sp.line" fill="none" :stroke="COLOR[k]" stroke-width="4" stroke-linecap="round" />
        <polygon :points="sp.head" :fill="COLOR[k]" />
      </g>
    </template>
    <circle v-for="(m, k) in markers" :key="k" :cx="m[0]" :cy="m[1]" r="6" :fill="COLOR[k]" stroke="white" stroke-width="2" />
    <g v-if="arrow">
      <line x1="0" y1="0" :x2="arrow.tip[0]" :y2="arrow.tip[1]" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
      <polygon v-if="arrow.head" :points="arrow.head" fill="#f59e0b" />
    </g>
    <circle r="4" fill="#f59e0b" />
  </svg>
</template>
