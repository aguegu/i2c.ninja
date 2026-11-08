<script setup>
// The board in 3D in the corner of a "glass box", as in an engineering
// drawing: its true orthographic projection on the floor (seen from above),
// on the wall behind it (seen from its nose, along X) and on the wall to its
// right (seen from its left side, along Y). The world's axes X, Y, Z (capitals) leave the walls'
// shared corner along their edges; the board's own x, y, z (lowercase) from
// its centre, turned with it. Turned by q (the board's axes into the
// world's), seen from in front of it and to its left. The walls take the
// axes' chart colours (x blue, y orange, z green). A button takes it full
// screen.
//
// Drawn on a canvas, not in SVG (bench/ measured a live SVG's restyle and
// repaint as most of a busy frame): the walls and the world's axes drawn
// once into two layers of their own (again on a resize or a theme change),
// each frame those stamped in their order with the shadows and the board
// drawn between and over them; only while on screen.
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { camera } from '../lib/view.js';
import { rotate } from '../lib/quaternion.js';
import { BOARD, FACES, ARROW, BODY_AXES } from '../lib/board.js';

const props = defineProps({
  q: { type: Array, default: () => [1, 0, 0, 0] },
});

const S = 52; // px a unit
const D = 1.7; // the walls' distance from the board's centre, and their half size
const VIEW = { x: -170, y: -172, w: 340, h: 312 }; // the drawing's box, in its units (as an SVG viewBox)
// each wall: the world axis it stands across, where, the side it's seen
// from (eye: inside the box, as ProjectionViews shows it), its colour, its label
const WALLS = [
  { key: 'floor', axis: 2, at: -D, eye: [0, 0, 1], color: '--series-3', label: 'the floor: ψ' },
  { key: 'back', axis: 0, at: -D, eye: [1, 0, 0], color: '--series-1', label: 'the wall behind: φ' },
  { key: 'side', axis: 1, at: -D, eye: [0, 1, 0], color: '--series-2', label: 'the right wall: θ' },
];

// in front of the board and to its left, up: the walls stand behind it, and
// the world's axes leave their shared corner, as in a textbook drawing
const VIEW_AZ_DEG = 40;
const VIEW_EL_DEG = 25;
const project = camera(VIEW_AZ_DEG, VIEW_EL_DEG);
const at = (v) => project(v, S);
const xy = (v) => at(v).slice(0, 2);
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const onWall = (w, v) => v.map((c, k) => (k === w.axis ? w.at : c)); // a point dropped straight onto a wall

// where each wall's label sits: inside it, near its outer edge on screen
// (the right wall's at its left, reading inward; the others' at their right)
const TAGS = { floor: [0.9 * D, 0.55 * D, -D], back: [-D, 0.9 * D, 0.85 * D], side: [0.9 * D, -D, 0.85 * D] };
// the floor's label centred across the floor at its height: the same room
// to the frame's edge on each side (FLOOR_TAG_UP: a little above its anchor)
const FLOOR_TAG_UP = 2;
// where a horizontal line at y crosses a polygon's edges: [leftmost, rightmost] x
function across(poly, y) {
  const xs = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  });
  return [Math.min(...xs), Math.max(...xs)];
}
// the walls' squares, faint grids on them
const walls = WALLS.map((w) => {
  const [a, b] = [0, 1, 2].filter((k) => k !== w.axis);
  const p = (u, v) => { const r = [0, 0, 0]; r[w.axis] = w.at; r[a] = u; r[b] = v; return r; };
  const grid = [-D / 2, 0, D / 2].flatMap((t) => [[p(t, -D), p(t, D)], [p(-D, t), p(D, t)]]);
  return { ...w, square: [p(-D, -D), p(D, -D), p(D, D), p(-D, D)].map(xy), grid: grid.map(([u, v]) => [xy(u), xy(v)]), tag: xy(TAGS[w.key]) };
});

// an arrow from o to e on screen: its head's three points, and where its label sits
function arrowTo(o, e, len, half, tagAt) {
  const dx = e[0] - o[0], dy = e[1] - o[1], n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  return { o, e, head: [[e[0], e[1]], [e[0] - len * ux - half * uy, e[1] - len * uy + half * ux], [e[0] - len * ux + half * uy, e[1] - len * uy - half * ux]], tag: [e[0] + tagAt * ux, e[1] + tagAt * uy] };
}
// the world's axes, capitals (the board's at the start, Z up), leaving the
// corner where the three walls meet, along their shared edges: X between the
// floor and the right wall, Y between the floor and the wall behind, Z up
// the two walls' corner
const CORNER = -D;
const AXIS_TO = 1.25 * D; // how far along: the whole edge and a little out of the walls
const AXES = [
  { key: 'X', on: [0, -D, -D], dir: [1, 0, 0], color: '--series-1' },
  { key: 'Y', on: [-D, 0, -D], dir: [0, 1, 0], color: '--series-2' },
  { key: 'Z', on: [-D, -D, 0], dir: [0, 0, 1], color: '--series-3' },
].map((a) => ({ ...a, ...arrowTo(at(a.on.map((c, k) => c + CORNER * a.dir[k])), at(a.on.map((c, k) => c + AXIS_TO * a.dir[k])), 9, 4, 10) }));
// the board's own (body) axes, lowercase, from its centre: turned with it
const BODY_LEN = 1.45; // out past the board's edges (half length 1.1), clear of the white arrow
const BODY_COLOR = Object.fromEntries(BODY_AXES.map((a) => [a.key, a.color.slice(4, -1)])); // var(--series-n) -> --series-n

// the moving part, for q: the shadows on each wall (every face dropped onto
// it, and the nose arrow while the top faces the wall's eye), the board's
// faces back to front, its nose arrow, its own axes
function scene(q) {
  const room = FACES.map((f) => ({ ...f, room: f.pts.map((v) => rotate(q, v)) }));
  const up = rotate(q, [0, 0, 1]);
  const arrowRoom = ARROW.map((v) => rotate(q, v));
  return {
    shadows: WALLS.map((w) => ({ color: w.color, faces: room.map((f) => f.room.map((v) => xy(onWall(w, v)))), arrow: dot3(up, w.eye) > 0 ? arrowRoom.map((v) => xy(onWall(w, v))) : null })),
    board: room.map((f) => { const p = f.room.map(at); return { fill: f.fill, top: f.name === 'top', points: p, depth: p.reduce((s, v) => s + v[2], 0) / p.length }; }).sort((a, b) => a.depth - b.depth),
    arrow: arrowRoom.map(xy),
    body: BODY_AXES.map((a) => ({ key: a.key, color: BODY_COLOR[a.key], ...arrowTo(at([0, 0, 0]), at(rotate(q, a.dir).map((c) => c * BODY_LEN)), 8, 3.5, 9) })),
  };
}

const box = ref(null);
const canvas = ref(null);
const { full, toggle } = useFullscreen(box);

let layers = null; // { walls, axes }: offscreen canvases, drawn once a size and a theme
let colors = null; // the chart colours, read from the page's CSS
let fontFamily = 'sans-serif';
let fit = null; // { s, ox, oy }: the drawing's units to the canvas's pixels
let seen = true;
let frame = 0;

const color = (name) => colors[name];
function readColors(c) {
  const css = getComputedStyle(c);
  colors = Object.fromEntries(['--series-1', '--series-2', '--series-3'].map((n) => [n, css.getPropertyValue(n).trim()]));
  fontFamily = css.fontFamily || 'sans-serif';
}
// the drawing's units onto a context, fitted and centred (as SVG's xMidYMid meet)
const place = (g) => g.setTransform(fit.s, 0, 0, fit.s, fit.ox - VIEW.x * fit.s, fit.oy - VIEW.y * fit.s);
function path(g, ps, close) {
  g.beginPath();
  ps.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (close) g.closePath();
}
function text(g, s, x, y, size, align, fill, bold = false) {
  g.font = `${bold ? 'bold ' : ''}${size}px ${fontFamily}`;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  g.fillStyle = fill;
  g.fillText(s, x, y);
}

function makeLayers(w, h) {
  const layer = () => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const lw = layer(), la = layer();
  let g = lw.getContext('2d');
  place(g);
  g.lineWidth = 1;
  for (const wall of walls) {
    const c = color(wall.color);
    path(g, wall.square, true);
    g.globalAlpha = 0.08; g.fillStyle = c; g.fill();
    g.globalAlpha = 0.6; g.strokeStyle = c; g.stroke();
    g.globalAlpha = 0.2;
    for (const [p0, p1] of wall.grid) { path(g, [p0, p1]); g.stroke(); }
    g.globalAlpha = 1;
    if (wall.key === 'floor') {
      const y = wall.tag[1] - FLOOR_TAG_UP;
      const [l, r] = across(wall.square, y);
      text(g, wall.label, (l + r) / 2, y, 10, 'center', c);
    } else text(g, wall.label, wall.tag[0], wall.tag[1], 10, wall.key === 'side' ? 'left' : 'right', c);
  }
  g = la.getContext('2d');
  place(g);
  for (const a of AXES) {
    const c = color(a.color);
    g.strokeStyle = c; g.lineWidth = 2.5;
    path(g, [a.o, a.e]); g.stroke();
    g.fillStyle = c; path(g, a.head, true); g.fill();
    text(g, a.key, a.tag[0], a.tag[1] + 4, 12, 'center', c, true);
  }
  layers = { walls: lw, axes: la };
}

function draw() {
  frame = 0;
  const c = canvas.value;
  if (!c || !seen) return;
  const dpr = devicePixelRatio || 1;
  const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (!w || !h) return;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; layers = null; }
  if (!colors) { readColors(c); layers = null; }
  if (!layers) {
    const s = Math.min(w / VIEW.w, h / VIEW.h);
    fit = { s, ox: (w - VIEW.w * s) / 2, oy: (h - VIEW.h * s) / 2 };
    makeLayers(w, h);
  }
  const g = c.getContext('2d');
  const sc = scene(props.q);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, w, h);
  g.drawImage(layers.walls, 0, 0);
  place(g);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const sh of sc.shadows) {
    const col = color(sh.color);
    g.fillStyle = col; g.globalAlpha = 0.3;
    for (const f of sh.faces) { path(g, f, true); g.fill(); }
    g.globalAlpha = 1;
    if (sh.arrow) { g.strokeStyle = col; g.lineWidth = 2; path(g, sh.arrow); g.stroke(); }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(layers.axes, 0, 0);
  place(g);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const f of sc.board) {
    path(g, f.points, true);
    g.fillStyle = f.fill; g.fill();
    g.strokeStyle = BOARD.edge; g.lineWidth = 1; g.stroke();
    if (f.top) { g.strokeStyle = 'white'; g.lineWidth = 3; path(g, sc.arrow); g.stroke(); }
  }
  g.lineCap = 'butt';
  for (const a of sc.body) {
    const col = color(a.color);
    g.strokeStyle = col; g.lineWidth = 1.5; path(g, [a.o, a.e]); g.stroke();
    g.fillStyle = col; path(g, a.head, true); g.fill();
    text(g, a.key, a.tag[0], a.tag[1] + 4, 11, 'center', col);
  }
}
// at most once a frame, however often q changes
const later = () => { if (!frame) frame = requestAnimationFrame(draw); };

watch(() => props.q, later);
let observers = [];
onMounted(() => {
  const c = canvas.value;
  const resize = new ResizeObserver(later);
  resize.observe(c);
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) later(); });
  io.observe(c);
  // the colours read again on a theme change: the header's switch or the device's
  const theme = new MutationObserver(() => { colors = null; later(); });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  const media = matchMedia('(prefers-color-scheme: dark)');
  const onMedia = () => { colors = null; later(); };
  media.addEventListener('change', onMedia);
  observers = [resize, io, theme, { disconnect: () => media.removeEventListener('change', onMedia) }];
  later();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  for (const o of observers) o.disconnect();
});
</script>

<template>
  <div ref="box" class="relative flex justify-center live-view" :class="full && 'h-full! w-full! items-center bg-white p-4 dark:bg-slate-900'">
    <!-- its own shape, the drawing's: a flex parent sizing it to its content still gets the whole drawing -->
    <canvas ref="canvas" class="aspect-[340/312] max-w-full" :class="full ? 'h-[85vh]' : 'h-80'" role="img" aria-label="The board in 3D in the corner of three walls, its projection on each: on the floor from above, on the wall ahead from behind it, on the wall to its left from its right side" />
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
