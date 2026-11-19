<script setup>
// The compass in 3D, in the room: the floor a disc with magnetic north,
// east, south and west on it (X north, Y west, Z up), the board held as it is
// now, seen as lib/view.js does (behind and to the right, a little above).
// Its attitude comes from the compass itself (lib/compass.js): north, west
// (-east) and up, in the board's axes, are the room's axes, a right-handed
// set. Drawn: the field B (violet) dipping into the floor, its level part
// on the floor to north (dashed), the dip δ between them; the field as the
// board's own plane sees it (orange, dashed: what the level-only heading
// uses), off north once the board tilts; the nose laid level x_h on the
// floor (green, dashed) and the heading ψ from north to it. Faces back to
// front; the floor drawn first, see-through.
import { computed } from 'vue';
import { camera } from '../lib/view.js';
import { BOARD } from '../lib/board.js';

const props = defineProps({
  steps: { type: Object, default: null }, // compass()'s result: its U, north, east, dip, heading
  b: { type: Array, default: null }, // the field, the board's axes (only its direction drawn)
});

const view = camera(-140, 30); // as lib/view.js's, a little higher: more of the floor
const S = 62; // px a unit
const L = 0.66, W = 0.39, H = 0.045; // the board: Board3D's at 0.6, so the floor shows round it
const FLOOR_R = 1.75; // the floor disc
const FIELD = 1.55; // B's arrow, its direction only
const NOSE = 1.4; // x_h's arrow on the floor
const ARC_PSI = 1.12, ARC_DIP = 0.95; // the arcs' radii: past the board
const RAD = Math.PI / 180;
const VIOLET = 'var(--series-magnitude)';
const ORANGE = 'var(--series-2)';
const GREEN = 'var(--series-3)';

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const scale = (v, k) => v.map((c) => c * k);
const unit = (v) => { const n = Math.hypot(...v); return n > 1e-9 ? scale(v, 1 / n) : null; };
const p2 = (v) => view(v, S);
const pts = (vs) => vs.map((v) => { const p = p2(v); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join(' ');

const corner = (sx, sy, sz) => [sx * L, sy * W, sz * H];
const FACES = [
  { name: 'top', fill: BOARD.top, pts: [corner(1, 1, 1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, 1)] },
  { name: 'bottom', fill: BOARD.bottom, pts: [corner(1, 1, -1), corner(-1, 1, -1), corner(-1, -1, -1), corner(1, -1, -1)] },
  { name: 'nose', fill: BOARD.side, pts: [corner(1, 1, 1), corner(1, 1, -1), corner(1, -1, -1), corner(1, -1, 1)] },
  { name: 'tail', fill: BOARD.side, pts: [corner(-1, 1, 1), corner(-1, -1, 1), corner(-1, -1, -1), corner(-1, 1, -1)] },
  { name: 'left', fill: BOARD.side, pts: [corner(1, 1, 1), corner(-1, 1, 1), corner(-1, 1, -1), corner(1, 1, -1)] },
  { name: 'right', fill: BOARD.side, pts: [corner(1, -1, 1), corner(1, -1, -1), corner(-1, -1, -1), corner(-1, -1, 1)] },
];
const ON_TOP = H * 1.01;
const ARROW = [[-0.33, 0, ON_TOP], [0.33, 0, ON_TOP], [0.21, 0.11, ON_TOP], [0.33, 0, ON_TOP], [0.21, -0.11, ON_TOP]];

// the floor: the disc's rim, a tick each 30 degrees, the four points
const circle = (r, z = 0, n = 72) => Array.from({ length: n + 1 }, (_, i) => [r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n), z]);
const RIM = pts(circle(FLOOR_R));
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30) * RAD, c = Math.cos(a), s = Math.sin(a);
  const [x1, y1] = p2([FLOOR_R * c, FLOOR_R * s, 0]);
  const [x2, y2] = p2([(FLOOR_R - 0.12) * c, (FLOOR_R - 0.12) * s, 0]);
  return { x1, y1, x2, y2 };
});
// north +X, west +Y: east -Y, south -X
const POINTS = [['N', [1, 0]], ['E', [0, -1]], ['S', [-1, 0]], ['W', [0, 1]]].map(([t, [x, y]]) => {
  const [px, py] = p2([(FLOOR_R + 0.22) * x, (FLOOR_R + 0.22) * y, 0]);
  return { t, x: px, y: py };
});

// the room's axes in the board's: rows north, west, up; board -> room is
// [v.north, v.west, v.up]
const frame = computed(() => {
  const c = props.steps;
  if (!c?.U || !c.north || !c.east) return null;
  return { n: c.north, w: scale(c.east, -1), u: c.U };
});
const toRoom = (f, v) => [dot(v, f.n), dot(v, f.w), dot(v, f.u)];

const faces = computed(() => {
  const f = frame.value;
  if (!f) return [];
  return FACES.map((face) => {
    const room = face.pts.map((v) => toRoom(f, v));
    const p = room.map(p2);
    return { ...face, points: p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' '), depth: p.reduce((s, q) => s + q[2], 0) / p.length };
  }).sort((a, b) => a.depth - b.depth);
});
const noseArrow = computed(() => (frame.value ? pts(ARROW.map((v) => toRoom(frame.value, v))) : ''));

// an arrow from the centre to tip (room axes): its line and a head
function arrow(tip) {
  const [x1, y1] = p2([0, 0, 0]);
  const [x2, y2] = p2(tip);
  const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
  const ux = dx / n, uy = dy / n, h = 9;
  const head = `${x2},${y2} ${x2 - h * ux + h * 0.5 * uy},${y2 - h * uy - h * 0.5 * ux} ${x2 - h * ux - h * 0.5 * uy},${y2 - h * uy + h * 0.5 * ux}`;
  return { x1, y1, x2, y2, head };
}
const at = (v, k = 1.12) => { const [x, y] = p2(scale(v, k)); return { x, y }; };

const scene = computed(() => {
  const f = frame.value, c = props.steps;
  if (!f || !props.b) return null;
  const B = unit(toRoom(f, props.b));
  if (!B) return null;
  const Bfield = scale(B, FIELD);
  const Bflat = [Bfield[0], Bfield[1], 0]; // on the floor: along north
  // the field on the board's own plane: B less its part along the board's z
  const zb = toRoom(f, [0, 0, 1]);
  const onBoard = Bfield.map((v, i) => v - dot(Bfield, zb) * zb[i]);
  // the nose laid level, on the floor
  const xb = toRoom(f, [1, 0, 0]);
  const xh = unit([xb[0], xb[1], 0]);
  // the dip: from the floor down to B, in the plane of north and up
  const dip = c.dip ?? 0;
  const dipArc = Array.from({ length: 25 }, (_, i) => { const t = (-dip * RAD * i) / 24; return [ARC_DIP * Math.cos(t), 0, ARC_DIP * Math.sin(t)]; });
  // the heading: from north, clockwise seen from above (toward east, -Y)
  const psi = c.heading;
  const psiArc = psi === null || psi === undefined ? null : Array.from({ length: 49 }, (_, i) => { const t = (-psi * RAD * i) / 48; return [ARC_PSI * Math.cos(t), ARC_PSI * Math.sin(t), 0]; });
  const mid = (arc) => arc[Math.floor(arc.length / 2)];
  const [dx1, dy1] = p2(Bflat);
  const [dx2, dy2] = p2(Bfield);
  return {
    field: arrow(Bfield), fieldLabel: at(Bfield),
    flat: arrow(Bflat), flatLabel: at(Bflat, 1.13),
    drop: { x1: dx1, y1: dy1, x2: dx2, y2: dy2 }, // B_h's tip down to B's: the dip's right triangle
    onBoard: arrow(onBoard), onBoardLabel: at(onBoard, 1.18),
    nose: xh ? arrow(scale(xh, NOSE)) : null, noseLabel: xh ? at(scale(xh, NOSE), 1.24) : null,
    dipArc: pts(dipArc), dipLabel: at(mid(dipArc), 1.5),
    // the arc's label only once the arc is long enough to be told from xₕ
    psiArc: psiArc ? pts(psiArc) : null, psiLabel: psiArc && psi > 8 && psi < 352 ? at(mid(psiArc), 1.35) : null,
  };
});
</script>

<template>
  <svg viewBox="-170 -90 340 180" class="w-full max-w-xl live-view" role="img" aria-label="The compass in 3D: the board held as it is in the room, the field dipping into the floor toward north, its level part, the field on the board's own plane, and the nose laid level with the heading from north">
    <!-- under the floor first, so the see-through floor lies over it: the
         field dipping into the ground, the dip, the drop from B_h's tip -->
    <template v-if="scene">
      <polyline :points="scene.dipArc" fill="none" :style="{ stroke: VIOLET }" stroke-width="1.5" />
      <line :x1="scene.drop.x1" :y1="scene.drop.y1" :x2="scene.drop.x2" :y2="scene.drop.y2" :style="{ stroke: VIOLET }" stroke-width="1" stroke-dasharray="2 3" />
      <line :x1="scene.field.x1" :y1="scene.field.y1" :x2="scene.field.x2" :y2="scene.field.y2" :style="{ stroke: VIOLET }" stroke-width="3" />
      <polygon :points="scene.field.head" :style="{ fill: VIOLET }" />
    </template>
    <!-- the floor, see-through, and its points -->
    <polygon :points="RIM" fill="rgb(148 163 184 / 0.28)" stroke="#94a3b8" stroke-width="1" />
    <line v-for="(t, i) in TICKS" :key="i" :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2" stroke="#94a3b8" stroke-width="1" />
    <text v-for="p in POINTS" :key="p.t" :x="p.x" :y="p.y + 4" text-anchor="middle" font-size="12" font-weight="600" class="fill-slate-600 dark:fill-slate-300">{{ p.t }}</text>
    <!-- the board, back to front -->
    <g v-for="face in faces" :key="face.name">
      <polygon :points="face.points" :fill="face.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" fill-opacity="0.92" />
      <polyline v-if="face.name === 'top'" :points="noseArrow" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <template v-if="scene">
      <!-- on the floor, drawn over the board (construction lines, so the board
           doesn't hide them): the field's level part, the heading -->
      <line :x1="scene.flat.x1" :y1="scene.flat.y1" :x2="scene.flat.x2" :y2="scene.flat.y2" :style="{ stroke: VIOLET }" stroke-width="2" stroke-dasharray="5 4" />
      <polyline v-if="scene.psiArc" :points="scene.psiArc" fill="none" :style="{ stroke: GREEN }" stroke-width="2" />
      <text v-if="scene.psiLabel" :x="scene.psiLabel.x" :y="scene.psiLabel.y + 4" text-anchor="middle" font-size="13" font-style="italic" :style="{ fill: GREEN }">ψ</text>
      <template v-if="scene.nose">
        <line :x1="scene.nose.x1" :y1="scene.nose.y1" :x2="scene.nose.x2" :y2="scene.nose.y2" :style="{ stroke: GREEN }" stroke-width="2.5" stroke-dasharray="6 4" />
        <polygon :points="scene.nose.head" :style="{ fill: GREEN }" />
        <text :x="scene.noseLabel.x" :y="scene.noseLabel.y + 4" text-anchor="middle" font-size="12" :style="{ fill: GREEN }">xₕ</text>
      </template>
      <!-- the field on the board's own plane: what the level-only heading uses -->
      <line :x1="scene.onBoard.x1" :y1="scene.onBoard.y1" :x2="scene.onBoard.x2" :y2="scene.onBoard.y2" :style="{ stroke: ORANGE }" stroke-width="2" stroke-dasharray="3 3" />
      <polygon :points="scene.onBoard.head" :style="{ fill: ORANGE }" />
      <!-- the labels last, over everything -->
      <text :x="scene.dipLabel.x" :y="scene.dipLabel.y + 4" text-anchor="middle" font-size="13" font-style="italic" :style="{ fill: VIOLET }">δ</text>
      <text :x="scene.fieldLabel.x" :y="scene.fieldLabel.y + 4" text-anchor="middle" font-size="13" font-weight="700" :style="{ fill: VIOLET }">B</text>
      <text :x="scene.flatLabel.x" :y="scene.flatLabel.y + 4" text-anchor="middle" font-size="12" :style="{ fill: VIOLET }">Bₕ</text>
    </template>
    <text v-else x="0" y="78" text-anchor="middle" font-size="12" class="fill-slate-500 dark:fill-slate-400">connect a board, held still, to see it</text>
  </svg>
</template>
