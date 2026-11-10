<script setup>
// A strip of colour scrolling with time: each reading's red, green and blue
// counts as a screen colour (scaled to the brightest of the three, as the
// page's swatch), from the reading to the next, the newest at the right.
// Drawn each frame from source() (the page's buffers: { t: [ms], ys: [red,
// green, blue, ...] }), at the views' cadence (lib/frame.js), only while on
// screen; its size from a ResizeObserver, as LiveChart does.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { frameDue } from '../lib/frame.js';

const props = defineProps({
  source: { type: Function, required: true },
  windowMs: { type: Number, default: 60000 },
});

const canvas = ref(null);
let frame = 0;
let size = { w: 0, h: 0 };
let observers = [];

// a reading's colour, or null when it saw no light
function colour(r, g, b) {
  const top = Math.max(r, g, b);
  if (!top) return null;
  const v = (x) => Math.round((255 * x) / top);
  return `rgb(${v(r)}, ${v(g)}, ${v(b)})`;
}

function draw() {
  frame = requestAnimationFrame(draw);
  const c = canvas.value;
  if (!c || !size.w || !size.h || !frameDue()) return;
  if (c.width !== size.w || c.height !== size.h) { c.width = size.w; c.height = size.h; }
  const g = c.getContext('2d');
  g.clearRect(0, 0, size.w, size.h);
  const { t, ys } = props.source();
  const now = performance.now();
  const x = (ms) => size.w * (1 - (now - ms) / props.windowMs);
  for (let i = 0; i < t.length; i++) {
    const x1 = i + 1 < t.length ? x(t[i + 1]) : size.w;
    if (x1 < 0) continue;
    const fill = colour(ys[0][i], ys[1][i], ys[2][i]);
    if (!fill) continue;
    g.fillStyle = fill;
    const x0 = Math.max(0, x(t[i]));
    g.fillRect(Math.floor(x0), 0, Math.ceil(x1 - x0) + 1, size.h);
  }
}

const start = () => { if (!frame) frame = requestAnimationFrame(draw); };
const stop = () => { cancelAnimationFrame(frame); frame = 0; };

onMounted(() => {
  const c = canvas.value;
  const resize = new ResizeObserver(([e]) => {
    const dpr = devicePixelRatio || 1;
    const box = e.devicePixelContentBoxSize?.[0];
    size = box ? { w: box.inlineSize, h: box.blockSize } : { w: Math.round(e.contentRect.width * dpr), h: Math.round(e.contentRect.height * dpr) };
  });
  resize.observe(c);
  const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  seen.observe(c);
  observers = [resize, seen];
});
onBeforeUnmount(() => {
  stop();
  for (const o of observers) o.disconnect();
});
</script>

<template>
  <figure>
    <canvas ref="canvas" class="block h-12 w-full rounded-md border border-slate-200 dark:border-slate-700" role="img" :aria-label="`The tint it saw over the last ${windowMs / 1000} seconds, the newest at the right`" />
    <figcaption class="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
      <span>−{{ windowMs / 1000 }} s</span><span>now</span>
    </figcaption>
  </figure>
</template>
