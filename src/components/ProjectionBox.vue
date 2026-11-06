<script setup>
// The board in 3D in the corner of a "glass box", as in an engineering
// drawing: its true orthographic projection on the floor (seen from above),
// on the far wall ahead of its nose (seen along x) and on the wall to its
// left (seen from its right side, along y), with dashed projector lines
// from its nose to each. The world's axes X, Y, Z (capitals) as a tripod
// at the floor's near corner; the board's own x, y, z (lowercase) from its
// centre, turned with it. Turned by q (the board's axes into the room's),
// seen as lib/view.js does: behind it and to its right. The walls take the
// axes' chart colours (x blue, y orange, z green). A button takes it full
// screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { project } from '../lib/view.js';
import { rotate } from '../lib/quaternion.js';
import { BOARD, L, FACES, ARROW, BODY_AXES } from '../lib/board.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
});

const S = 52; // px a unit
const D = 1.7; // the walls' distance from the board's centre, and their half size
const NOSE_TIP = [L + 0.25, 0, 0];
// each wall: the world axis it stands across, where, the side it's seen
// from (eye: inside the box, as ProjectionViews shows it), its colour, its label
const WALLS = [
  { key: 'floor', axis: 2, at: -D, eye: [0, 0, 1], color: 'var(--series-3)', label: 'the floor: ψ' },
  { key: 'ahead', axis: 0, at: D, eye: [-1, 0, 0], color: 'var(--series-1)', label: 'the wall ahead: φ' },
  { key: 'left', axis: 1, at: D, eye: [0, -1, 0], color: 'var(--series-2)', label: 'the left wall: θ' },
];

const at = (v) => project(v, S);
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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
// on each wall: every face dropped onto it (their union is the board's
// outline there), and the nose arrow when the top face is toward the wall's eye
const shadows = computed(() => WALLS.map((w) => ({
  key: w.key,
  color: w.color,
  faces: turned.value.map((f) => pts(f.room.map((v) => onWall(w, v)))),
  // the nose arrow is on the top face: seen only while that faces the wall's eye
  arrow: dot3(rotate(props.q, [0, 0, 1]), w.eye) > 0 ? pts(ARROW.map((v) => onWall(w, rotate(props.q, v)))) : null,
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
// the world's axes, capitals (the board's at the start, Z up), as a tripod
// at the floor's near corner, along the box's edges, clear of the board
const ORIGIN = [-D, -D, -D];
const AXIS_LEN = 0.55 * D; // short: z stays clear of the board
const AXES = [
  { key: 'X', to: [AXIS_LEN, 0, 0], color: 'var(--series-1)' },
  { key: 'Y', to: [0, AXIS_LEN, 0], color: 'var(--series-2)' },
  { key: 'Z', to: [0, 0, AXIS_LEN], color: 'var(--series-3)' },
].map((a) => {
  const o = at(ORIGIN), e = at(ORIGIN.map((c, k) => c + a.to[k])), dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy);
  const ux = dx / n, uy = dy / n; // the arrow's way on screen
  const head = [[e[0], e[1]], [e[0] - 9 * ux - 4 * uy, e[1] - 9 * uy + 4 * ux], [e[0] - 9 * ux + 4 * uy, e[1] - 9 * uy - 4 * ux]];
  return { ...a, o, e, head: head.map((p) => p.map((c) => c.toFixed(1)).join(',')).join(' '), tag: [e[0] + 10 * ux, e[1] + 10 * uy] };
});
// the board's own (body) axes, lowercase, from its centre: turned with it
const BODY_LEN = 0.95;
const body = computed(() => BODY_AXES.map((a) => {
  const o = at([0, 0, 0]), e = at(rotate(props.q, a.dir).map((c) => c * BODY_LEN)), dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy) || 1;
  const ux = dx / n, uy = dy / n;
  const head = [[e[0], e[1]], [e[0] - 8 * ux - 3.5 * uy, e[1] - 8 * uy + 3.5 * ux], [e[0] - 8 * ux + 3.5 * uy, e[1] - 8 * uy - 3.5 * ux]];
  return { ...a, o, e, head: head.map((p) => p.map((c) => c.toFixed(1)).join(',')).join(' '), tag: [e[0] + 9 * ux, e[1] + 9 * uy + 4] };
}));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative flex justify-center" :class="full && 'h-full! w-full! items-center bg-white p-4 dark:bg-slate-900'">
    <svg viewBox="-170 -150 340 290" :class="full ? 'h-[85vh] w-full' : 'h-80 w-full max-w-md'" role="img" aria-label="The board in 3D in the corner of three walls, its projection on each: on the floor from above, on the wall ahead from behind it, on the wall to its left from its right side">
      <g v-for="w in walls" :key="w.key">
        <polygon :points="w.square" :fill="w.color" fill-opacity="0.08" :stroke="w.color" stroke-opacity="0.6" />
        <line v-for="(g, i) in w.grid" :key="i" :x1="g[0][0]" :y1="g[0][1]" :x2="g[1][0]" :y2="g[1][1]" :stroke="w.color" stroke-opacity="0.2" />
        <text :x="w.tag[0]" :y="w.tag[1]" font-size="10" :text-anchor="w.axis === 1 ? 'start' : 'end'" :fill="w.color">{{ w.label }}</text>
      </g>
      <g v-for="s in shadows" :key="s.key">
        <polygon v-for="(f, i) in s.faces" :key="i" :points="f" :fill="s.color" fill-opacity="0.3" stroke="none" />
        <polyline v-if="s.arrow" :points="s.arrow" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <g v-for="a in AXES" :key="`axis${a.key}`" :stroke="a.color" :fill="a.color">
        <line :x1="a.o[0]" :y1="a.o[1]" :x2="a.e[0]" :y2="a.e[1]" stroke-width="2" />
        <polygon :points="a.head" stroke="none" />
        <text :x="a.tag[0]" :y="a.tag[1] + 4" font-size="12" font-weight="bold" text-anchor="middle" stroke="none">{{ a.key }}</text>
      </g>
      <line v-for="p in projectors" :key="p.key" :x1="p.a[0]" :y1="p.a[1]" :x2="p.b[0]" :y2="p.b[1]" :stroke="p.color" stroke-width="1.2" stroke-dasharray="4 3" />
      <g v-for="f in board" :key="f.name">
        <polygon :points="f.points" :fill="f.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" />
        <polyline v-if="f.name === 'top'" :points="arrow" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <g v-for="a in body" :key="`body${a.key}`" :stroke="a.color" :fill="a.color">
        <line :x1="a.o[0]" :y1="a.o[1]" :x2="a.e[0]" :y2="a.e[1]" stroke-width="1.5" />
        <polygon :points="a.head" stroke="none" />
        <text :x="a.tag[0]" :y="a.tag[1]" font-size="11" text-anchor="middle" stroke="none">{{ a.key }}</text>
      </g>
      <circle v-for="p in projectors" :key="`d${p.key}`" :cx="p.b[0]" :cy="p.b[1]" r="2.5" :fill="p.color" />
    </svg>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
