<script setup>
// The board in 3D in the corner of a "glass box", as in an engineering
// drawing: its true orthographic projection on the floor (seen from above),
// on the far wall ahead of its nose (seen along x) and on the wall to its
// left (seen from its right side, along y), with dashed projector lines
// from its nose to each. Turned by q (the board's axes into the room's),
// seen as lib/view.js does: behind it and to its right. The walls take the
// axes' chart colours (x blue, y orange, z green). A button takes it full
// screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { project } from '../lib/view.js';
import { rotate } from '../lib/quaternion.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
});

const S = 52; // px a unit
const D = 1.7; // the walls' distance from the board's centre, and their half size
const L = 1.1, W = 0.65, H = 0.07; // the board's half length (x), width (y), thickness (z), as Board3D
const NOSE_TIP = [L + 0.25, 0, 0];
const TOP = '#1f5fa8';
const SIDE = '#163f70';
const BOTTOM = '#0f2c50';
// each wall: the room axis it stands across, where, its colour, its label
const WALLS = [
  { key: 'floor', axis: 2, at: -D, color: 'var(--series-3)', label: 'from above: ψ' },
  { key: 'ahead', axis: 0, at: D, color: 'var(--series-1)', label: 'from its nose: φ' },
  { key: 'left', axis: 1, at: D, color: 'var(--series-2)', label: 'from its right side: θ' },
];

const corner = (sx, sy, sz) => [sx * L, sy * W, sz * H];
const FACES = [
  { name: 'top', fill: TOP, pts: [corner(1, 1, 1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, 1)] },
  { name: 'bottom', fill: BOTTOM, pts: [corner(1, 1, -1), corner(-1, 1, -1), corner(-1, -1, -1), corner(1, -1, -1)] },
  { name: 'nose', fill: SIDE, pts: [corner(1, 1, 1), corner(1, 1, -1), corner(1, -1, -1), corner(1, -1, 1)] },
  { name: 'tail', fill: SIDE, pts: [corner(-1, 1, 1), corner(-1, -1, 1), corner(-1, -1, -1), corner(-1, 1, -1)] },
  { name: 'left', fill: SIDE, pts: [corner(1, 1, 1), corner(-1, 1, 1), corner(-1, 1, -1), corner(1, 1, -1)] },
  { name: 'right', fill: SIDE, pts: [corner(1, -1, 1), corner(1, -1, -1), corner(-1, -1, -1), corner(-1, -1, 1)] },
];
const ARROW = [[-0.55, 0, H], [0.55, 0, H], [0.35, 0.18, H], [0.55, 0, H], [0.35, -0.18, H]];

const at = (v) => project(v, S);
const pts = (ps) => ps.map((p) => at(p).slice(0, 2).map((c) => c.toFixed(1)).join(',')).join(' ');
const onWall = (w, v) => v.map((c, k) => (k === w.axis ? w.at : c)); // a point dropped straight onto a wall

// the walls' squares, faint grids on them
const walls = WALLS.map((w) => {
  const [a, b] = [0, 1, 2].filter((k) => k !== w.axis);
  const p = (u, v) => { const r = [0, 0, 0]; r[w.axis] = w.at; r[a] = u; r[b] = v; return r; };
  const grid = [-D / 2, 0, D / 2].flatMap((t) => [[p(t, -D), p(t, D)], [p(-D, t), p(D, t)]]);
  return { ...w, square: pts([p(-D, -D), p(D, -D), p(D, D), p(-D, D)]), grid: grid.map(([u, v]) => [at(u), at(v)]), tag: at(p(w.axis === 2 ? D : -D * 0.95, w.axis === 2 ? -D * 0.95 : D * 0.85)) };
});

const turned = computed(() => FACES.map((f) => ({ ...f, room: f.pts.map((v) => rotate(props.q, v)) })));
// on each wall: every face dropped onto it (their union is the board's shadow), the nose arrow too
const shadows = computed(() => WALLS.map((w) => ({
  key: w.key,
  color: w.color,
  faces: turned.value.map((f) => pts(f.room.map((v) => onWall(w, v)))),
  arrow: pts(ARROW.map((v) => onWall(w, rotate(props.q, v)))),
})));
const board = computed(() => turned.value
  .map((f) => { const p = f.room.map(at); return { ...f, points: pts(f.room), depth: p.reduce((s, v) => s + v[2], 0) / p.length }; })
  .sort((a, b) => a.depth - b.depth));
const arrow = computed(() => pts(ARROW.map((v) => rotate(props.q, v))));
// from the nose's tip to each wall, straight across
const projectors = computed(() => {
  const tip = rotate(props.q, NOSE_TIP);
  return WALLS.map((w) => ({ key: w.key, color: w.color, a: at(tip), b: at(onWall(w, tip)) }));
});
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative flex justify-center" :class="full && 'h-full! w-full! items-center bg-white p-4 dark:bg-slate-900'">
    <svg viewBox="-170 -150 340 290" :class="full ? 'h-[85vh] w-full' : 'h-80 w-full max-w-md'" role="img" aria-label="The board in 3D in the corner of three walls, its projection on each: on the floor from above, on the wall ahead from its nose, on the wall to its left from its right side">
      <g v-for="w in walls" :key="w.key">
        <polygon :points="w.square" :fill="w.color" fill-opacity="0.08" :stroke="w.color" stroke-opacity="0.6" />
        <line v-for="(g, i) in w.grid" :key="i" :x1="g[0][0]" :y1="g[0][1]" :x2="g[1][0]" :y2="g[1][1]" :stroke="w.color" stroke-opacity="0.2" />
        <text :x="w.tag[0]" :y="w.tag[1]" font-size="10" :text-anchor="w.axis === 1 ? 'start' : 'end'" :fill="w.color">{{ w.label }}</text>
      </g>
      <g v-for="s in shadows" :key="s.key">
        <polygon v-for="(f, i) in s.faces" :key="i" :points="f" :fill="s.color" fill-opacity="0.3" stroke="none" />
        <polyline :points="s.arrow" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <line v-for="p in projectors" :key="p.key" :x1="p.a[0]" :y1="p.a[1]" :x2="p.b[0]" :y2="p.b[1]" :stroke="p.color" stroke-width="1.2" stroke-dasharray="4 3" />
      <g v-for="f in board" :key="f.name">
        <polygon :points="f.points" :fill="f.fill" stroke="#0b1f38" stroke-width="1" stroke-linejoin="round" />
        <polyline v-if="f.name === 'top'" :points="arrow" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <circle v-for="p in projectors" :key="`d${p.key}`" :cx="p.b[0]" :cy="p.b[1]" r="2.5" :fill="p.color" />
    </svg>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
