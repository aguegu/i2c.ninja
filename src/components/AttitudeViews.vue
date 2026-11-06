<script setup>
// The board turned against a field held still (gravity, or Earth's magnetic
// field: field="magnetic"), drawn down the page, as three flat
// views: from its right side (pitch shows: the nose to the right), from
// behind (roll shows: its right side on the right), from above (yaw would
// show; the nose up). The turn comes from the accelerometer alone: the
// room's up, in the board's axes, is the reading's direction, and the
// heading is taken as the board's own (yaw 0): a turn about the vertical
// doesn't change how gravity falls on the axes, so an accelerometer can't
// see it. Board axes as printed (x the nose, y left, z up); the room's: X
// ahead, Y left, Z up. A still accelerometer reads up (the springs against
// gravity, which points down); a magnetometer reads along the field: down
// the page is the reading's way for it. Its angles are then the board's
// against the field line, and the turn about the field line is the one it
// can't see. A button takes the three full screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { rollOf, pitchOf } from '../lib/tilt.js';
import { BOARD } from '../lib/board.js';

const props = defineProps({
  x: { type: Number, default: 0 }, // g, the board's axes
  y: { type: Number, default: 0 },
  z: { type: Number, default: 1 },
  field: { type: String, default: 'gravity' }, // or 'magnetic'
});
const magnetic = computed(() => props.field === 'magnetic');
// the room's up, in the board's axes, as the gravity case reads it
const up = computed(() => (magnetic.value ? [-props.x, -props.y, -props.z] : [props.x, props.y, props.z]));

const R = 100; // the viewBox's half size
const S = 50; // px a board unit
const L = 1.1, W = 0.65, H = 0.07; // half length (x), width (y), thickness (z), as Learn the IMU's board
const G_PX = 60; // gravity's arrow, 1 g
const HEAD_PX = 10;
const MIN = { gravity: 0.2, magnetic: 5 }; // g, uT: a reading weaker than this keeps the last turn
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
const ON_TOP = H * 1.05;
const TOP_SEEN = 0.05; // the top face's normal toward the eye by more than this: it shows
const NOSE_ARROW = [[-0.55, 0, ON_TOP], [0.55, 0, ON_TOP], [0.35, 0.18, ON_TOP], [0.55, 0, ON_TOP], [0.35, -0.18, ON_TOP]];

// each view: screen x, y (down) and depth (toward the eye) of a room vector
const VIEWS = [
  { key: 'side', title: 'From its right side', angle: 'pitch', project: ([X, , Z]) => [X, -Z], depth: ([, Y]) => -Y, gravity: 'down' },
  { key: 'behind', title: 'From behind', angle: 'roll', project: ([, Y, Z]) => [-Y, -Z], depth: ([X]) => -X, gravity: 'down' },
  { key: 'above', title: 'From above', angle: 'yaw', project: ([X, Y]) => [-Y, -X], depth: ([, , Z]) => Z, gravity: 'into' },
];

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// the room's axes in the board's: up the reading's direction, ahead the
// board's nose laid level (yaw 0), left completing them; the last good one
// kept while the reading is too weak or the nose points straight up or down
let last = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
const frame = computed(() => {
  const a = up.value;
  if (Math.hypot(...a) < MIN[props.field]) return last;
  const Z = norm(a);
  const level = [1 - Z[0] * Z[0], -Z[0] * Z[1], -Z[0] * Z[2]]; // the nose with its up part taken off
  if (Math.hypot(...level) < 1e-3) return last;
  const X = norm(level);
  last = { X, Y: cross(Z, X), Z };
  return last;
});
const toRoom = (v) => [dot(v, frame.value.X), dot(v, frame.value.Y), dot(v, frame.value.Z)];
const pts2 = (ps) => ps.map((p) => `${(p[0] * S).toFixed(1)},${(p[1] * S).toFixed(1)}`).join(' ');

const roll = computed(() => rollOf(...up.value));
const pitch = computed(() => pitchOf(...up.value));
const NAMES = {
  gravity: { pitch: 'pitch', roll: 'roll', yaw: 'yaw', above: 'From above', unseen: 'a turn about the vertical: gravity can\'t see it', arrow: 'g', color: '#e11d48' },
  magnetic: { pitch: 'nose to the field', roll: 'side to the field', yaw: 'about the field', above: 'Along the field', unseen: 'a turn about the field line: the field can\'t see it', arrow: 'B', color: '#7c3aed' },
};
const names = computed(() => NAMES[props.field]);

const views = computed(() => VIEWS.map((w0) => {
  const w = w0.key === 'above' ? { ...w0, title: names.value.above } : w0;
  const faces = FACES.map((f) => {
    const room = f.pts.map(toRoom);
    return { ...f, points: pts2(room.map(w.project)), depth: room.reduce((s, v) => s + w.depth(v), 0) / room.length };
  }).sort((a, b) => a.depth - b.depth);
  // the nose arrow on the top face, drawn only while that face looks toward the eye
  const nose = w.depth(toRoom([0, 0, 1])) > TOP_SEEN ? pts2(NOSE_ARROW.map(toRoom).map(w.project)) : null;
  const value = w.angle === 'pitch' ? pitch.value : w.angle === 'roll' ? roll.value : null;
  return { ...w, faces, nose, value };
}));
const head = `${-HEAD_PX * 0.5},${G_PX - HEAD_PX} 0,${G_PX} ${HEAD_PX * 0.5},${G_PX - HEAD_PX}`;

const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <figure v-for="w in views" :key="w.key" class="flex flex-col items-center">
        <figcaption class="mb-1 text-sm font-semibold">{{ w.title }}</figcaption>
        <svg :viewBox="`${-R} ${-R} ${2 * R} ${2 * R}`" :class="full ? 'h-[60vh] w-full' : 'h-48 w-full max-w-60'" role="img" :aria-label="`${w.title}: ${names[w.angle]} ${w.value === null ? 'unknown' : `${w.value.toFixed(0)} degrees`}`">
          <template v-if="w.gravity === 'down'">
            <line :x1="-R + 6" :y1="R - 18" :x2="R - 6" :y2="R - 18" stroke="var(--chart-text)" stroke-width="1.5" />
            <g stroke="var(--chart-grid)" stroke-width="1"><line v-for="i in 12" :key="i" :x1="-R + 6 + i * 15" :y1="R - 18" :x2="-R + i * 15" :y2="R - 10" /></g>
            <line :x1="-R + 6" y1="0" :x2="R - 6" y2="0" stroke="var(--chart-grid)" stroke-dasharray="4 4" />
          </template>
          <template v-else>
            <line x1="0" :y1="-R + 6" x2="0" :y2="R - 6" stroke="var(--chart-grid)" stroke-dasharray="4 4" />
          </template>
          <polygon v-for="f in w.faces" :key="f.name" :points="f.points" :fill="f.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" />
          <polyline v-if="w.nose" :points="w.nose" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <g v-if="w.gravity === 'down'" :transform="`translate(${R - 22} ${-R + 10})`" :stroke="names.color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <line x1="0" y1="0" x2="0" :y2="G_PX" /><polyline :points="head" />
          </g>
          <text v-if="w.gravity === 'down'" :x="R - 30" :y="-R + 24" text-anchor="end" font-size="10" :fill="names.color">{{ names.arrow }}</text>
          <g v-else :transform="`translate(${R - 18} ${-R + 18})`" :stroke="names.color" stroke-width="2" fill="none">
            <circle r="9" /><line x1="-6" y1="-6" x2="6" y2="6" /><line x1="6" y1="-6" x2="-6" y2="6" />
          </g>
        </svg>
        <p class="font-mono text-sm tabular-nums">{{ names[w.angle] }} {{ w.value === null ? '—' : `${w.value.toFixed(0)}°` }}</p>
        <p v-if="w.value === null" class="text-center text-xs text-slate-500 dark:text-slate-400">{{ names.unseen }}</p>
      </figure>
    </div>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
