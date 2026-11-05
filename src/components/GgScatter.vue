<script setup>
// A g-g diagram: x against y (the board's axes as printed: x right, y up),
// the last trailMs as a fading trail and the latest as a dot, redrawn each
// frame from source() (the chart's buffers: { t, ys: [x, y, ...] }). At
// rest the dot sits where gravity's share puts it (flat: the centre); a
// push, a turn or a shake draws its shape. The range grows past FLOOR_G
// to keep the trail in.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  source: { type: Function, required: true },
  trailMs: { type: Number, default: 3000 },
});

const FLOOR_G = 1.5; // the least half-range
const RING_STEP_G = 0.5;
const LABEL_PX = 11;
const DOT_PX = 5;
const LINE_PX = 2;

const canvas = ref(null);
const box = ref(null);
const { full, toggle } = useFullscreen(box);
let frame = 0;

function draw() {
  frame = requestAnimationFrame(draw);
  const c = canvas.value;
  if (!c) return;
  const dpr = devicePixelRatio || 1;
  const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d');
  const css = getComputedStyle(c);
  const color = (name) => css.getPropertyValue(name).trim();
  g.clearRect(0, 0, w, h);

  const { t, ys } = props.source();
  const [xs, yv] = ys;
  const from = performance.now() - props.trailMs;
  let first = t.length;
  while (first > 0 && t[first - 1] >= from) first--;
  let top = FLOOR_G;
  for (let i = first; i < t.length; i++) top = Math.max(top, Math.abs(xs[i]), Math.abs(yv[i]));
  top = Math.ceil(top / RING_STEP_G) * RING_STEP_G;

  const side = Math.min(w, h);
  const half = side / 2 - LABEL_PX * 2 * dpr;
  const cx = w / 2, cy = h / 2;
  const px = (v) => cx + (v / top) * half;
  const py = (v) => cy - (v / top) * half;

  g.lineWidth = dpr;
  g.strokeStyle = color('--chart-grid');
  g.fillStyle = color('--chart-text');
  g.font = `${LABEL_PX * dpr}px system-ui, sans-serif`;
  g.textAlign = 'left';
  g.textBaseline = 'bottom';
  for (let r = RING_STEP_G; r <= top + 1e-9; r += RING_STEP_G) {
    g.beginPath();
    g.arc(cx, cy, (r / top) * half, 0, 2 * Math.PI);
    g.stroke();
    if (Number.isInteger(r)) g.fillText(`${r} g`, cx + (r / top) * half * Math.SQRT1_2 + 3 * dpr, cy - (r / top) * half * Math.SQRT1_2);
  }
  g.beginPath();
  g.moveTo(cx - half, cy); g.lineTo(cx + half, cy);
  g.moveTo(cx, cy - half); g.lineTo(cx, cy + half);
  g.stroke();
  g.textBaseline = 'middle';
  g.fillText('+x', cx + half + 4 * dpr, cy);
  g.textAlign = 'center';
  g.fillText('+y', cx, cy - half - LABEL_PX * dpr);

  const ink = color('--series-2');
  g.strokeStyle = ink;
  g.lineWidth = LINE_PX * dpr;
  g.lineJoin = 'round';
  for (let i = Math.max(first, 1); i < t.length; i++) {
    g.globalAlpha = Math.max(0, (t[i] - from) / props.trailMs);
    g.beginPath();
    g.moveTo(px(xs[i - 1]), py(yv[i - 1]));
    g.lineTo(px(xs[i]), py(yv[i]));
    g.stroke();
  }
  g.globalAlpha = 1;
  if (t.length) {
    g.fillStyle = ink;
    g.beginPath();
    g.arc(px(xs[t.length - 1]), py(yv[t.length - 1]), DOT_PX * dpr, 0, 2 * Math.PI);
    g.fill();
  }
}

onMounted(() => { frame = requestAnimationFrame(draw); });
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <canvas ref="canvas" :class="full ? 'h-[min(90vh,90vw)] w-[min(90vh,90vw)]' : 'mx-auto block aspect-square w-full max-w-72'" role="img" :aria-label="`g-g diagram: x against y, the last ${trailMs / 1000} s`" />
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
