<script setup>
// The board in 3D, turned by a quaternion (its axes into the room's), seen
// as lib/view.js does: behind it and to its right, as you'd hold it. Its
// nose (x) marked with an arrow on top. Optionally the one turn's axis
// drawn through it. Faces drawn back to front.
import { computed } from 'vue';
import { project as view } from '../lib/view.js';
import { rotate } from '../lib/quaternion.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
  axis: { type: Array, default: null }, // unit, the one turn's axis, drawn when given
});

const S = 70; // px a unit
const L = 1.1, W = 0.65, H = 0.07; // half length (x), width (y), thickness (z)
const TOP = '#1f5fa8';
const SIDE = '#163f70';
const BOTTOM = '#0f2c50';

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
const CHIP = [[-0.2, 0.32, ON_TOP], [-0.2, 0.12, ON_TOP], [-0.4, 0.12, ON_TOP], [-0.4, 0.32, ON_TOP]];

const pts2 = (ps) => ps.map((p) => p.slice(0, 2).map((v) => v.toFixed(1)).join(',')).join(' ');

const faces = computed(() => FACES
  .map((f) => {
    const p = f.pts.map((v) => view(rotate(props.q, v), S));
    const depth = p.reduce((s, v) => s + v[2], 0) / p.length;
    return { ...f, points: pts2(p), depth };
  })
  .sort((a, b) => a.depth - b.depth));
const arrow = computed(() => pts2(ARROW.map((v) => view(rotate(props.q, v), S))));
const chip = computed(() => pts2(CHIP.map((v) => view(rotate(props.q, v), S))));
const axisLine = computed(() => {
  if (!props.axis) return null;
  const a = view(props.axis.map((v) => v * 1.6), S), b = view(props.axis.map((v) => v * -1.6), S);
  return { a, b };
});
</script>

<template>
  <svg viewBox="-150 -120 300 240" class="h-72 w-full max-w-sm" role="img" aria-label="The board in 3D, as the filter has it">
    <line v-if="axisLine" :x1="axisLine.b[0]" :y1="axisLine.b[1]" :x2="axisLine.a[0]" :y2="axisLine.a[1]" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />
    <g v-for="f in faces" :key="f.name">
      <polygon :points="f.points" :fill="f.fill" stroke="#0b1f38" stroke-width="1" stroke-linejoin="round" />
      <template v-if="f.name === 'top'">
        <polygon :points="chip" fill="#1d1d1d" />
        <polyline :points="arrow" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </template>
    </g>
    <circle v-if="axisLine" :cx="axisLine.a[0]" :cy="axisLine.a[1]" r="5" fill="#f59e0b" />
  </svg>
</template>
