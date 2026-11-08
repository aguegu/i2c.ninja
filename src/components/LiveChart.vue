<script setup>
// A live line chart: the last windowMs of up to three series, redrawn each
// frame from source() (the caller's buffers, not reactive: { t: [ms], ys:
// [[...], ...] }). The y range is symmetric around 0, never below floor, so
// the noise at rest isn't blown up; ticks at 1-2-5 steps. A button takes it
// full screen (the Fullscreen API, where the browser has it; Esc leaves).
// Cheap per frame (bench/ measures it): its size from a ResizeObserver and
// its colours read once (again on a theme change), so a frame never makes
// the page lay out; no frames at all while it's off screen.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, required: true },
  series: { type: Array, required: true }, // [{ label, sub (a subscript, optional), color: '--series-1' }]
  values: { type: Array, default: () => [] }, // the latest value of each, for the legend
  source: { type: Function, required: true },
  windowMs: { type: Number, default: 10000 },
  floor: { type: Number, default: 1 },
  // fit: the range follows the data (its min to max over the window, at
  // least floor wide, centred on them), for values far from zero (a bus
  // voltage); else symmetric around 0, never below +/-floor (an IMU's axes)
  fit: { type: Boolean, default: false },
  digits: { type: Number, default: 2 },
});

const canvas = ref(null);
const figure = ref(null);
const { full, toggle: toggleFull } = useFullscreen(figure);
let frame = 0;
let size = { w: 0, h: 0 }; // device pixels, from the ResizeObserver
let colors = null; // the tokens' values, read once, cleared on a theme change
let observers = [];

const LINE_PX = 2;
const LABEL_PX = 11;
const AXIS_GUTTER_PX = 44; // the y labels' room
const PAD_PX = 6;

// the step for about n ticks over span: 1, 2 or 5 times a power of ten
function niceStep(span, n) {
  const raw = span / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw);
}

// the first index at or after ms (t ascending)
function firstFrom(t, ms) {
  let a = 0, b = t.length;
  while (a < b) {
    const m = (a + b) >> 1;
    if (t[m] < ms) a = m + 1; else b = m;
  }
  return a;
}

function draw() {
  frame = requestAnimationFrame(draw);
  const c = canvas.value;
  if (!c || !size.w || !size.h) return;
  const dpr = devicePixelRatio || 1;
  const { w, h } = size;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d');
  if (!colors) {
    const css = getComputedStyle(c);
    colors = Object.fromEntries(['--chart-grid', '--chart-text', ...props.series.map((x) => x.color)].map((n) => [n, css.getPropertyValue(n).trim()]));
  }
  const color = (name) => colors[name];
  g.clearRect(0, 0, w, h);

  const { t, ys } = props.source();
  const now = performance.now();
  const from = now - props.windowMs;
  const i0 = firstFrom(t, from);
  let lo = Infinity, hi = -Infinity;
  for (const y of ys) {
    for (let i = i0; i < y.length; i++) {
      lo = Math.min(lo, y[i]);
      hi = Math.max(hi, y[i]);
    }
  }
  let step;
  if (props.fit) {
    if (lo > hi) { lo = 0; hi = props.floor; } // nothing yet
    const mid = (lo + hi) / 2, half = Math.max(hi - lo, props.floor) / 2;
    step = niceStep(2 * half, 4);
    lo = Math.floor((mid - half) / step) * step;
    hi = Math.ceil((mid + half) / step) * step;
  } else {
    let top = props.floor;
    if (lo <= hi) top = Math.max(top, Math.abs(lo), Math.abs(hi));
    step = niceStep(2 * top, 4);
    hi = Math.ceil(top / step) * step;
    lo = -hi;
  }

  const left = AXIS_GUTTER_PX * dpr, pad = PAD_PX * dpr;
  const xOf = (ms) => left + ((ms - from) / props.windowMs) * (w - left - pad);
  const yOf = (v) => pad + ((hi - v) / (hi - lo)) * (h - 2 * pad);

  g.font = `${LABEL_PX * dpr}px system-ui, sans-serif`;
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  g.lineWidth = dpr;
  for (let v = lo; v <= hi + step / 2; v += step) {
    g.strokeStyle = color('--chart-grid');
    g.globalAlpha = Math.abs(v) < step / 2 ? 1 : 0.6; // the zero line a little stronger
    g.beginPath();
    g.moveTo(left, Math.round(yOf(v)) + 0.5);
    g.lineTo(w - pad, Math.round(yOf(v)) + 0.5);
    g.stroke();
    g.globalAlpha = 1;
    g.fillStyle = color('--chart-text');
    g.fillText(`${+v.toFixed(6)}`, left - 6 * dpr, yOf(v));
  }

  g.lineWidth = LINE_PX * dpr;
  g.lineJoin = 'round';
  props.series.forEach((s, k) => {
    const y = ys[k];
    g.strokeStyle = color(s.color);
    g.beginPath();
    let started = false;
    for (let i = i0; i < y.length; i++) {
      if (started) g.lineTo(xOf(t[i]), yOf(y[i]));
      else { g.moveTo(xOf(t[i]), yOf(y[i])); started = true; }
    }
    g.stroke();
  });
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
  // drawn only while on screen (or full screen)
  const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  seen.observe(c);
  // the colours read again when the theme changes: the header's switch
  // (data-theme on <html>) or the device's own setting
  const theme = new MutationObserver(() => { colors = null; });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  const media = matchMedia('(prefers-color-scheme: dark)');
  const onMedia = () => { colors = null; };
  media.addEventListener('change', onMedia);
  observers = [resize, seen, theme, { disconnect: () => media.removeEventListener('change', onMedia) }];
});
onBeforeUnmount(() => {
  stop();
  for (const o of observers) o.disconnect();
});

const fmt = (v) => (v === undefined ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(props.digits)}`);
</script>

<template>
  <figure ref="figure" class="flex flex-col gap-2" :class="full && 'h-full bg-white p-6 dark:bg-slate-800'">
    <figcaption class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span class="font-semibold">{{ title }} <span class="font-normal text-slate-500 dark:text-slate-400">{{ unit }}</span></span>
      <span v-for="(s, k) in series" :key="s.label + (s.sub ?? '')" class="flex items-center gap-1.5 font-mono text-sm tabular-nums">
        <span class="inline-block h-0.5 w-4 rounded" :style="{ background: `var(${s.color})` }" />
        <span>{{ s.label }}<sub v-if="s.sub">{{ s.sub }}</sub></span> {{ fmt(values[k]) }}
      </span>
      <FullscreenButton v-if="canFullscreen" :full="full" class="ml-auto self-center" @toggle="toggleFull" />
    </figcaption>
    <canvas ref="canvas" class="w-full" :class="full ? 'min-h-0 flex-1' : 'h-48'" role="img" :aria-label="`${title}, ${unit}: the last ${windowMs / 1000} s of ${series.map((s) => s.label + (s.sub ? `_${s.sub}` : '')).join(', ')}`" />
  </figure>
</template>
