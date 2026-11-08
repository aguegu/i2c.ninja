<script setup>
// The glass box's three walls unfolded (ProjectionBox): the board seen
// straight along each of the world's axes, an orthographic view, as it
// projects onto that wall. The floor from above (Z at you), the right wall
// from the board's left side (Y at you), the wall behind from its nose (X at
// you). World axes in capitals at the walls' edges; the board's own (body)
// axes in lowercase from its centre. q turns the board's axes into the
// world's. captions: per wall { sym, sub, value, name } under it. A button
// takes the three full screen.
//
// Each drawn on a canvas (lib/canvas.js): the wall with its grid and the
// world's axes, and the axis seen end on, drawn once into layers of their
// own, each frame the board and its own axes drawn between them.
import { ref, watch } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { rotate } from '../lib/quaternion.js';
import { BOARD, FACES, ARROW, BODY_AXES } from '../lib/board.js';
import { readStyle, fitPixels, viewFit, path, text, layerLike, useLiveCanvas } from '../lib/canvas.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
  captions: { type: Object, default: null }, // { floor, side, back }
});

const S = 50; // px a unit, as the walls' 1.7 units = 85 px
const WALL = 85;
const GRID = [-WALL / 2, 0, WALL / 2];
const R = 118; // room round the wall for the axes sticking out
const VIEW = { x: -R, y: -R, w: 2 * R, h: 2 * R };
const D = WALL / S; // the walls' half size, units: as the glass box's
const CORNER = [-D, -D, -D]; // where the three walls meet: the world's axes leave it
const AXIS_LEN = 2.25 * D; // the whole edge and a little out, as in the glass box
const BODY_LEN = 1.45; // the body axes' arrows, units: out past the board's edges, clear of the white arrow
const WORLD = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
const WORLD_COLOR = { X: '--series-1', Y: '--series-2', Z: '--series-3' };
const BODY_COLOR = Object.fromEntries(BODY_AXES.map((a) => [a.key, a.color.slice(4, -1)])); // var(--series-n) -> --series-n
const BEHIND_OPACITY = 0.45; // a body axis pointing away from the eye: drawn faint
// each wall seen straight on: its screen right (h) and up (v) in world axes,
// toward the eye (eye), and the world axis it is seen along
const VIEWS = [
  { key: 'floor', title: 'The floor, from above', h: [1, 0, 0], v: [0, 1, 0], eye: [0, 0, 1], along: 'Z', away: 'Z points at you' },
  { key: 'side', title: 'The right wall, from its left side', h: [-1, 0, 0], v: [0, 0, 1], eye: [0, 1, 0], along: 'Y', away: 'Y points at you' },
  { key: 'back', title: 'The wall behind, from its nose', h: [0, 1, 0], v: [0, 0, 1], eye: [1, 0, 0], along: 'X', away: 'X points at you' },
];

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const flat = (w, p) => [S * dot(p, w.h), -S * dot(p, w.v)];
// an arrow ending at e from o (screen px): its head's points and where its label goes
function arrowHead(o, e, len, half) {
  const dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  return { e, head: [[e[0], e[1]], [e[0] - len * ux - half * uy, e[1] - len * uy + half * ux], [e[0] - len * ux + half * uy, e[1] - len * uy - half * ux]], tag: [e[0] + 9 * ux, e[1] + 9 * uy + 4] };
}

// each view's fixed parts: the walls' corner on it, the two world axes across it
const FIXED = VIEWS.map((w) => {
  const o = flat(w, CORNER);
  const world = Object.entries(WORLD).filter(([k]) => k !== w.along)
    .map(([k, d]) => ({ key: k, color: WORLD_COLOR[k], o, ...arrowHead(o, flat(w, CORNER.map((c, i) => c + AXIS_LEN * d[i])), 9, 4) }));
  return { o, world, color: WORLD_COLOR[w.along] };
});

// each view's moving part for q: the faces toward the eye, the nose arrow
// while the top is one of them, the board's own axes (none seen end on)
function moving(w, q) {
  const faces = FACES.filter((f) => dot(rotate(q, f.n), w.eye) > 1e-6).map((f) => ({ name: f.name, fill: f.fill, points: f.pts.map((v) => flat(w, rotate(q, v))) }));
  const top = faces.some((f) => f.name === 'top');
  const body = BODY_AXES.map((a) => {
    const d = rotate(q, a.dir), e = flat(w, d.map((c) => c * BODY_LEN));
    return { key: a.key, color: BODY_COLOR[a.key], toward: dot(d, w.eye), arrow: Math.hypot(e[0], e[1]) < 6 ? null : arrowHead([0, 0], e, 8, 3.5) };
  });
  return { faces, arrow: top ? ARROW.map((v) => flat(w, rotate(q, v))) : null, body };
}

const box = ref(null);
const canvases = [];
const { full, toggle } = useFullscreen(box);
let style = null;
let layers = [];

function drawLayers(i, c, fit) {
  const w = VIEWS[i], f = FIXED[i], col = (n) => style.colors[n];
  const back = layerLike(c), front = layerLike(c);
  let g = back.getContext('2d');
  g.setTransform(...fit);
  g.lineWidth = 1;
  g.globalAlpha = 0.08; g.fillStyle = col(f.color); g.fillRect(-WALL, -WALL, 2 * WALL, 2 * WALL);
  g.globalAlpha = 0.6; g.strokeStyle = col(f.color); g.strokeRect(-WALL, -WALL, 2 * WALL, 2 * WALL);
  g.globalAlpha = 0.2;
  for (const t of GRID) { path(g, [[t, -WALL], [t, WALL]]); g.stroke(); path(g, [[-WALL, t], [WALL, t]]); g.stroke(); }
  g.globalAlpha = 1;
  for (const a of f.world) {
    g.strokeStyle = col(a.color); g.lineWidth = 2.5; path(g, [a.o, a.e]); g.stroke();
    g.fillStyle = col(a.color); path(g, a.head, true); g.fill();
    text(g, style, a.key, a.tag[0], a.tag[1], 12, 'center', col(a.color), true);
  }
  // the third axis, seen end on at the corner: a dot toward you, a cross away
  g = front.getContext('2d');
  g.setTransform(...fit);
  g.translate(f.o[0], f.o[1]);
  g.beginPath(); g.arc(0, 0, 7, 0, 2 * Math.PI);
  g.fillStyle = 'white'; g.fill();
  g.strokeStyle = col(f.color); g.lineWidth = 2; g.stroke();
  if (w.eye[0] + w.eye[1] + w.eye[2] > 0) { g.beginPath(); g.arc(0, 0, 2.4, 0, 2 * Math.PI); g.fillStyle = col(f.color); g.fill(); }
  else { path(g, [[-4.5, -4.5], [4.5, 4.5]]); g.stroke(); path(g, [[4.5, -4.5], [-4.5, 4.5]]); g.stroke(); }
  text(g, style, w.along, f.o[0] < 0 ? -11 : 11, f.o[1] < 0 ? -9 : 17, 12, f.o[0] < 0 ? 'right' : 'left', col(f.color), true);
  layers[i] = { back, front, fit };
}

function draw(fresh) {
  if (fresh || !style) style = readStyle(box.value);
  VIEWS.forEach((w, i) => {
    const c = canvases[i];
    if (!c) return;
    if (fitPixels(c) || fresh || !layers[i]) {
      if (!c.width || !c.height) return;
      drawLayers(i, c, viewFit(VIEW, c.width, c.height));
    }
    const { back, front, fit } = layers[i];
    const g = c.getContext('2d');
    const m = moving(w, props.q);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(back, 0, 0);
    g.setTransform(...fit);
    g.lineJoin = 'round';
    for (const f of m.faces) {
      path(g, f.points, true);
      g.fillStyle = f.fill; g.fill();
      g.strokeStyle = BOARD.edge; g.lineWidth = 1; g.stroke();
    }
    if (m.arrow) { g.lineCap = 'round'; g.strokeStyle = 'white'; g.lineWidth = 4; path(g, m.arrow); g.stroke(); g.lineCap = 'butt'; }
    for (const a of m.body) {
      if (!a.arrow) continue;
      const col = style.colors[a.color];
      g.globalAlpha = a.toward < -0.2 ? BEHIND_OPACITY : 1;
      g.strokeStyle = col; g.lineWidth = 1.5; path(g, [[0, 0], a.arrow.e]); g.stroke();
      g.fillStyle = col; path(g, a.arrow.head, true); g.fill();
      text(g, style, a.key, a.arrow.tag[0], a.arrow.tag[1], 11, 'center', col);
    }
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(front, 0, 0);
  });
}
const later = useLiveCanvas(box, draw);
watch(() => props.q, later);
</script>

<template>
  <div ref="box" class="relative live-view" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <figure v-for="(w, i) in VIEWS" :key="w.key" class="flex flex-col items-center">
        <figcaption class="mb-1 text-center text-sm font-semibold">{{ w.title }}</figcaption>
        <canvas :ref="(el) => { canvases[i] = el; }" class="aspect-square max-w-full" :class="full ? 'h-[60vh]' : 'h-48'" role="img" :aria-label="`${w.title}: the board seen along ${w.along}`" />
        <p v-if="captions?.[w.key]" class="font-mono text-sm tabular-nums">{{ captions[w.key].sym }}<sub>{{ captions[w.key].sub }}</sub> {{ captions[w.key].value }} · {{ captions[w.key].name }}</p>
        <p class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ w.away }}</p>
      </figure>
    </div>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
