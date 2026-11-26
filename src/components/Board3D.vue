<script setup>
// The board in 3D, turned by a quaternion (its axes into the room's), seen
// as lib/view.js does: behind it and to its right, as you'd hold it. Its
// nose (x) marked with an arrow on top, labelled +x. Optionally the one
// turn's axis drawn through it. Faces drawn back to front. For a pose to
// copy (the calibration's positions): `table`, a level plate the board
// rests on, for up and down; `faceViewer`, the pose turned about the
// vertical so the top (the arrow) faces the viewer when it stands on an
// edge, its nose or its tail (gravity's axis unchanged: the same position)
import { computed } from 'vue';
import { project as view, VIEW_AZ_DEG } from '../lib/view.js';
import { rotate, fromAxisAngle } from '../lib/quaternion.js';
import { BOARD } from '../lib/board.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
  axis: { type: Array, default: null }, // unit, the one turn's axis, drawn when given
  table: { type: Boolean, default: false },
  faceViewer: { type: Boolean, default: false },
});

// a then b, as one turn (b applied first)
const mul = ([aw, ax, ay, az], [bw, bx, by, bz]) => [
  aw * bw - ax * bx - ay * by - az * bz,
  aw * bx + ax * bw + ay * bz - az * by,
  aw * by - ax * bz + ay * bw + az * bx,
  aw * bz + ax * by - ay * bx + az * bw,
];
const DEG = 180 / Math.PI;
const SIDEWAYS = 0.5; // the top's normal this far from vertical: on an edge, the nose or the tail
const ASKEW_DEG = 35; // the top turned this much off face-on: its edge shows, so it reads as 3D
// the pose shown: q, or q turned about the vertical so its top faces the camera
const shown = computed(() => {
  if (!props.faceViewer) return props.q;
  const n = rotate(props.q, [0, 0, 1]);
  if (Math.hypot(n[0], n[1]) < SIDEWAYS) return props.q;
  return mul(fromAxisAngle([0, 0, 1], VIEW_AZ_DEG + ASKEW_DEG - Math.atan2(n[1], n[0]) * DEG), props.q);
});

const S = 70; // px a unit
const L = 1.1, W = 0.65, H = 0.07; // half length (x), width (y), thickness (z)
const TOP = BOARD.top;
const SIDE = BOARD.side;
const BOTTOM = BOARD.bottom;

const corner = (sx, sy, sz) => [sx * L, sy * W, sz * H];
const FACES = [
  { name: 'top', fill: TOP, pts: [corner(1, 1, 1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, 1)] },
  { name: 'bottom', fill: BOTTOM, pts: [corner(1, 1, -1), corner(-1, 1, -1), corner(-1, -1, -1), corner(1, -1, -1)] },
  { name: 'nose', fill: SIDE, pts: [corner(1, 1, 1), corner(1, 1, -1), corner(1, -1, -1), corner(1, -1, 1)] },
  { name: 'tail', fill: SIDE, pts: [corner(-1, 1, 1), corner(-1, -1, 1), corner(-1, -1, -1), corner(-1, 1, -1)] },
  { name: 'left', fill: SIDE, pts: [corner(1, 1, 1), corner(-1, 1, 1), corner(-1, 1, -1), corner(1, 1, -1)] },
  { name: 'right', fill: SIDE, pts: [corner(1, -1, 1), corner(1, -1, -1), corner(-1, -1, -1), corner(-1, -1, 1)] },
];
// on the top face, a little above it: the nose arrow and a chip
const ON_TOP = H * 1.01;
const ARROW = [[-0.55, 0, ON_TOP], [0.55, 0, ON_TOP], [0.35, 0.18, ON_TOP], [0.55, 0, ON_TOP], [0.35, -0.18, ON_TOP]];
const LABEL = [0.8, 0, ON_TOP]; // +x, past the arrow's head
const TABLE = 1.35; // the plate's half side
const CHIP = [[-0.2, 0.32, ON_TOP], [-0.2, 0.12, ON_TOP], [-0.4, 0.12, ON_TOP], [-0.4, 0.32, ON_TOP]];

const pts2 = (ps) => ps.map((p) => p.slice(0, 2).map((v) => v.toFixed(1)).join(',')).join(' ');

const faces = computed(() => FACES
  .map((f) => {
    const p = f.pts.map((v) => view(rotate(shown.value, v), S));
    const depth = p.reduce((s, v) => s + v[2], 0) / p.length;
    return { ...f, points: pts2(p), depth };
  })
  .sort((a, b) => a.depth - b.depth));
const arrow = computed(() => pts2(ARROW.map((v) => view(rotate(shown.value, v), S))));
const chip = computed(() => pts2(CHIP.map((v) => view(rotate(shown.value, v), S))));
const label = computed(() => view(rotate(shown.value, LABEL), S));
// the top seen from the front (it faces the camera): the label then drawn
const topVisible = computed(() => (faces.value.find((f) => f.name === 'top')?.depth ?? 0) > (faces.value.find((f) => f.name === 'bottom')?.depth ?? 0));
// the table: level, under the board's lowest corner
const table = computed(() => {
  if (!props.table) return null;
  const low = Math.min(...FACES.flatMap((f) => f.pts).map((v) => rotate(shown.value, v)[2])) - 0.005;
  return pts2([[TABLE, TABLE, low], [TABLE, -TABLE, low], [-TABLE, -TABLE, low], [-TABLE, TABLE, low]].map((v) => view(v, S)));
});
const axisLine = computed(() => {
  if (!props.axis) return null;
  const a = view(props.axis.map((v) => v * 1.6), S), b = view(props.axis.map((v) => v * -1.6), S);
  return { a, b };
});
</script>

<template>
  <svg viewBox="-150 -120 300 240" class="h-72 w-full max-w-sm live-view" role="img" aria-label="The board in 3D, as the filter has it">
    <polygon v-if="table" :points="table" fill="var(--chart-grid)" fill-opacity="0.6" stroke="var(--chart-text)" stroke-opacity="0.35" stroke-width="1" />
    <line v-if="axisLine" :x1="axisLine.b[0]" :y1="axisLine.b[1]" :x2="axisLine.a[0]" :y2="axisLine.a[1]" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />
    <g v-for="f in faces" :key="f.name">
      <polygon :points="f.points" :fill="f.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" />
      <template v-if="f.name === 'top'">
        <polygon :points="chip" fill="#1d1d1d" />
        <polyline :points="arrow" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </template>
    </g>
    <text v-if="topVisible" :x="label[0]" :y="label[1] + 4" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--series-1)">+x</text>
    <circle v-if="axisLine" :cx="axisLine.a[0]" :cy="axisLine.a[1]" r="5" fill="#f59e0b" />
  </svg>
</template>
