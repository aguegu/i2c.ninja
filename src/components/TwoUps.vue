<script setup>
// Mahony's comparison, drawn: in the board's own axes (the board held still
// here), â, up as gravity says (the accelerometer), and v̂, up as q says,
// the angle between them, and e = â × v̂ at right angles to both: the axis
// the filter turns q about to close the gap. e is small near agreement, so
// drawn E_SCALE times longer. Seen as lib/view.js does: behind the board and
// to its right.
import { computed } from 'vue';
import { project } from '../lib/view.js';
import { BOARD, FACES, ARROW } from '../lib/board.js';

const props = defineProps({
  aHat: { type: Array, default: null }, // unit
  vHat: { type: Array, default: null }, // unit
  e: { type: Array, default: null },
});

const S = 48; // px a unit
const BOARD_SCALE = 0.6; // the board drawn smaller: the arrows matter here
const UP_LEN = 1.6; // â and v̂, units
const ARC_R = 0.75;
const E_SCALE = 5;
const A_COLOR = '#dc2626'; // gravity's red, as the site's accelerometer drawings
const V_COLOR = '#7c3aed';
const E_COLOR = '#d97706';
const DEG = 180 / Math.PI;

const at = (v) => project(v, S);
const p2 = (v) => at(v).slice(0, 2);
const pts = (ps) => ps.map((p) => p2(p).map((c) => c.toFixed(1)).join(',')).join(' ');
const scale = (v, k) => v.map((c) => c * k);
const norm = (v) => Math.hypot(...v);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function arrow(v, color, label) {
  const e = p2(v), o = p2([0, 0, 0]), dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy);
  if (n < 4) return { color, label, dot: e };
  const ux = dx / n, uy = dy / n;
  const head = [[e[0], e[1]], [e[0] - 10 * ux - 4.5 * uy, e[1] - 10 * uy + 4.5 * ux], [e[0] - 10 * ux + 4.5 * uy, e[1] - 10 * uy - 4.5 * ux]];
  return { color, label, o, e, head: head.map((p) => p.map((c) => c.toFixed(1)).join(',')).join(' '), tag: [e[0] + 11 * ux, e[1] + 11 * uy + 4] };
}

const board = FACES
  .map((f) => { const ps = f.pts.map((v) => scale(v, BOARD_SCALE)); const p = ps.map(at); return { ...f, points: pts(ps), depth: p.reduce((s, v) => s + v[2], 0) / p.length }; })
  .sort((a, b) => a.depth - b.depth);
const noseArrow = pts(ARROW.map((v) => scale(v, BOARD_SCALE)));

const drawn = computed(() => {
  const a = props.aHat, v = props.vHat;
  if (!a || !v) return null;
  // the arc from â to v̂, on a sphere of ARC_R: slerp
  const cos = Math.max(-1, Math.min(1, dot(a, v))), ang = Math.acos(cos), sin = Math.sin(ang);
  const arc = sin < 1e-4 ? null : pts(Array.from({ length: 17 }, (_, i) => {
    const t = i / 16, ka = Math.sin((1 - t) * ang) / sin, kv = Math.sin(t * ang) / sin;
    return a.map((c, k) => ARC_R * (ka * c + kv * v[k]));
  }));
  const e = props.e ?? [0, 0, 0];
  const ra = arrow(scale(a, UP_LEN), A_COLOR, 'â'), rv = arrow(scale(v, UP_LEN), V_COLOR, 'v̂');
  // their labels beside the tips, one each side, so close arrows don't share one spot
  if (ra.head && rv.head) {
    const aLeft = ra.e[0] <= rv.e[0];
    ra.tag = [ra.e[0] + (aLeft ? -8 : 8), ra.e[1] + 4];
    ra.anchor = aLeft ? 'end' : 'start';
    rv.tag = [rv.e[0] + (aLeft ? 8 : -8), rv.e[1] + 4];
    rv.anchor = aLeft ? 'start' : 'end';
  }
  return {
    a: ra,
    v: rv,
    e: arrow(scale(e, E_SCALE), E_COLOR, `e ×${E_SCALE}`),
    arc,
    deg: (Math.atan2(norm(e), cos) * DEG).toFixed(1),
    // the caption's: at a fixed width (0.0 to 180.0 apart), so it keeps its length
    degFixed: (Math.atan2(norm(e), cos) * DEG).toFixed(1).padStart(5),
    size: norm(e).toFixed(3),
  };
});
</script>

<template>
  <figure class="flex flex-col items-center">
    <svg viewBox="-120 -120 240 220" class="h-56 w-full max-w-72" role="img" :aria-label="drawn ? `Up as gravity says and up as q says, ${drawn.deg} degrees apart` : 'No readings yet'">
      <g v-for="f in board" :key="f.name">
        <polygon :points="f.points" :fill="f.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" />
        <polyline v-if="f.name === 'top'" :points="noseArrow" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <template v-if="drawn">
        <polyline v-if="drawn.arc" :points="drawn.arc" fill="none" :stroke="E_COLOR" stroke-width="1.5" stroke-dasharray="3 2" />
        <g v-for="r in [drawn.e, drawn.v, drawn.a]" :key="r.label" :stroke="r.color" :fill="r.color">
          <template v-if="r.head">
            <line :x1="r.o[0]" :y1="r.o[1]" :x2="r.e[0]" :y2="r.e[1]" stroke-width="2.5" />
            <polygon :points="r.head" stroke="none" />
            <text :x="r.tag[0]" :y="r.tag[1]" font-size="13" font-weight="bold" :text-anchor="r.anchor ?? 'middle'" stroke="none">{{ r.label }}</text>
          </template>
          <circle v-else :cx="r.dot[0]" :cy="r.dot[1]" r="3" stroke="none" />
        </g>
      </template>
    </svg>
    <figcaption class="text-center text-sm">
      <span :style="{ color: A_COLOR }" class="font-semibold">â</span> up as gravity says ·
      <span :style="{ color: V_COLOR }" class="font-semibold">v̂</span> up as q says ·
      <span :style="{ color: E_COLOR }" class="font-semibold">e</span> = â × v̂, at right angles to both
      <span class="block font-mono text-xs whitespace-pre-wrap text-slate-500 tabular-nums dark:text-slate-400">{{ drawn ? `${drawn.degFixed}° apart, |e| = ${drawn.size}` : '—' }}</span>
    </figcaption>
  </figure>
</template>
