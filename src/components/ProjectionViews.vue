<script setup>
// The glass box's three walls unfolded (ProjectionBox): the board seen
// straight along each of the world's axes, an orthographic view, as it
// projects onto that wall. The floor from above (Z at you), the right wall
// from the board's left side (Y at you), the wall behind from its nose (X at
// you). World axes in capitals at the walls' edges; the board's own (body)
// axes in lowercase from its centre. q turns the board's axes into the
// world's. captions: per wall { sym, sub, value, name } under it. A button
// takes the three full screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { rotate } from '../lib/quaternion.js';
import { BOARD, FACES, ARROW, BODY_AXES } from '../lib/board.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
  captions: { type: Object, default: null }, // { floor, side, back }
});

const S = 50; // px a unit, as the walls' 1.7 units = 85 px
const WALL = 85;
const GRID = [-WALL / 2, 0, WALL / 2];
const R = 118; // room round the wall for the axes sticking out
const D = WALL / S; // the walls' half size, units: as the glass box's
const CORNER = [-D, -D, -D]; // where the three walls meet: the world's axes leave it
const AXIS_LEN = 2.25 * D; // the whole edge and a little out, as in the glass box
const BODY_LEN = 1.45; // the body axes' arrows, units: out past the board's edges, clear of the white arrow
const WORLD = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
const WORLD_COLOR = { X: 'var(--series-1)', Y: 'var(--series-2)', Z: 'var(--series-3)' };
// each wall seen straight on: its screen right (h) and up (v) in world axes,
// toward the eye (eye), and the world axis it is seen along
const VIEWS = [
  { key: 'floor', title: 'The floor, from above', h: [1, 0, 0], v: [0, 1, 0], eye: [0, 0, 1], along: 'Z', away: 'Z points at you' },
  { key: 'side', title: 'The right wall, from its left side', h: [-1, 0, 0], v: [0, 0, 1], eye: [0, 1, 0], along: 'Y', away: 'Y points at you' },
  { key: 'back', title: 'The wall behind, from its nose', h: [0, 1, 0], v: [0, 0, 1], eye: [1, 0, 0], along: 'X', away: 'X points at you' },
];

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const flat = (w, p) => [S * dot(p, w.h), -S * dot(p, w.v)];
const pts = (w, ps) => ps.map((p) => flat(w, p).map((c) => c.toFixed(1)).join(',')).join(' ');
// an arrow from o to e (screen px): its head and where its label goes
function arrowFrom(o, e) {
  const dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  const head = [[e[0], e[1]], [e[0] - 9 * ux - 4 * uy, e[1] - 9 * uy + 4 * ux], [e[0] - 9 * ux + 4 * uy, e[1] - 9 * uy - 4 * ux]];
  return { e, head: head.map((p) => p.map((c) => c.toFixed(1)).join(',')).join(' '), tag: [e[0] + 9 * ux, e[1] + 9 * uy + 4] };
}

// an arrow from the centre to the end e (screen px): its line and head
function arrowTo(e) {
  const n = Math.hypot(e[0], e[1]);
  if (n < 6) return null; // seen end on: a dot instead
  const ux = e[0] / n, uy = e[1] / n;
  const head = [[e[0], e[1]], [e[0] - 8 * ux - 3.5 * uy, e[1] - 8 * uy + 3.5 * ux], [e[0] - 8 * ux + 3.5 * uy, e[1] - 8 * uy - 3.5 * ux]];
  return { e, head: head.map((p) => p.map((c) => c.toFixed(1)).join(',')).join(' '), tag: [e[0] + 9 * ux, e[1] + 9 * uy + 4] };
}

const views = computed(() => VIEWS.map((w) => {
  // the faces facing the eye, nearest drawn last (a box: no overlaps among them)
  const faces = FACES
    .map((f) => ({ ...f, room: f.pts.map((v) => rotate(props.q, v)), facing: dot(rotate(props.q, f.n), w.eye) }))
    .filter((f) => f.facing > 1e-6)
    .map((f) => ({ name: f.name, fill: f.fill, points: pts(w, f.room) }));
  const top = faces.some((f) => f.name === 'top');
  const body = BODY_AXES.map((a) => {
    const d = rotate(props.q, a.dir);
    return { ...a, toward: dot(d, w.eye), arrow: arrowTo(flat(w, d.map((c) => c * BODY_LEN))) };
  });
  // the world's axes as in the glass box: the two across this wall from the
  // walls' corner along its edges, the third seen end on at that corner
  const o = flat(w, CORNER);
  const world = Object.entries(WORLD).filter(([k]) => k !== w.along).map(([k, d]) => {
    const e = flat(w, CORNER.map((c, i) => c + AXIS_LEN * d[i]));
    const a = arrowFrom(o, e);
    return { key: k, o, ...a, color: WORLD_COLOR[k] };
  });
  return { ...w, o, faces, top, arrow: top ? pts(w, ARROW.map((v) => rotate(props.q, v))) : null, body, world, color: WORLD_COLOR[w.along], caption: props.captions?.[w.key] };
}));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <figure v-for="w in views" :key="w.key" class="flex flex-col items-center">
        <figcaption class="mb-1 text-center text-sm font-semibold">{{ w.title }}</figcaption>
        <svg :viewBox="`${-R} ${-R} ${2 * R} ${2 * R}`" :class="full ? 'h-[60vh] w-full' : 'h-48 w-full max-w-60'" role="img" :aria-label="`${w.title}: the board seen along ${w.along}`">
          <rect :x="-WALL" :y="-WALL" :width="2 * WALL" :height="2 * WALL" :fill="w.color" fill-opacity="0.08" :stroke="w.color" stroke-opacity="0.6" />
          <g :stroke="w.color" stroke-opacity="0.2">
            <line v-for="t in GRID" :key="`v${t}`" :x1="t" :y1="-WALL" :x2="t" :y2="WALL" />
            <line v-for="t in GRID" :key="`h${t}`" :x1="-WALL" :y1="t" :x2="WALL" :y2="t" />
          </g>
          <!-- the world's axes, capitals, from the walls' corner along the edges, as in the glass box -->
          <g v-for="a in w.world" :key="a.key" :stroke="a.color" :fill="a.color">
            <line :x1="a.o[0]" :y1="a.o[1]" :x2="a.e[0]" :y2="a.e[1]" stroke-width="2.5" />
            <polygon :points="a.head" stroke="none" />
            <text :x="a.tag[0]" :y="a.tag[1]" font-size="12" font-weight="bold" text-anchor="middle" stroke="none">{{ a.key }}</text>
          </g>
          <polygon v-for="f in w.faces" :key="f.name" :points="f.points" :fill="f.fill" :stroke="BOARD.edge" stroke-width="1" stroke-linejoin="round" />
          <polyline v-if="w.arrow" :points="w.arrow" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <!-- the board's own axes, lowercase -->
          <g v-for="a in w.body" :key="a.key" :stroke="a.color" :fill="a.color" :opacity="a.toward < -0.2 ? 0.45 : 1">
            <template v-if="a.arrow">
              <line x1="0" y1="0" :x2="a.arrow.e[0]" :y2="a.arrow.e[1]" stroke-width="1.5" />
              <polygon :points="a.arrow.head" stroke="none" />
              <text :x="a.arrow.tag[0]" :y="a.arrow.tag[1]" font-size="11" text-anchor="middle" stroke="none">{{ a.key }}</text>
            </template>
          </g>
          <!-- the third axis, seen end on at the corner: a dot toward you, a cross away -->
          <g :transform="`translate(${w.o[0]} ${w.o[1]})`" :stroke="w.color" :fill="w.color">
            <circle r="7" fill="white" stroke-width="2" />
            <circle v-if="w.eye[0] + w.eye[1] + w.eye[2] > 0" r="2.4" stroke="none" />
            <g v-else stroke-width="2"><line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" /><line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" /></g>
            <text :x="w.o[0] < 0 ? -11 : 11" :y="w.o[1] < 0 ? -9 : 17" :text-anchor="w.o[0] < 0 ? 'end' : 'start'" font-size="12" font-weight="bold" stroke="none">{{ w.along }}</text>
          </g>
        </svg>
        <p v-if="w.caption" class="font-mono text-sm tabular-nums">{{ w.caption.sym }}<sub>{{ w.caption.sub }}</sub> {{ w.caption.value }} · {{ w.caption.name }}</p>
        <p class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ w.away }}</p>
      </figure>
    </div>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
