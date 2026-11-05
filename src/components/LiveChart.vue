<script setup>
// A live line chart: the last windowMs of up to three series, redrawn each
// frame from source() (the caller's buffers, not reactive: { t: [ms], ys:
// [[...], ...] }). The y range is symmetric around 0, never below floor, so
// the noise at rest isn't blown up; ticks at 1-2-5 steps. A button takes it
// full screen (the Fullscreen API, where the browser has it; Esc leaves).
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, required: true },
  series: { type: Array, required: true }, // [{ label, color: '--series-1' }]
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
const full = ref(false);
const canFull = typeof document !== 'undefined' && document.fullscreenEnabled;
let frame = 0;

function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen();
  else figure.value?.requestFullscreen();
}
function onFullChange() {
  full.value = document.fullscreenElement === figure.value;
}

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
  const now = performance.now();
  const from = now - props.windowMs;
  let lo = Infinity, hi = -Infinity;
  for (const y of ys) {
    for (let i = 0; i < y.length; i++) {
      if (t[i] < from) continue;
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
    for (let i = 0; i < y.length; i++) {
      if (t[i] < from) continue;
      if (started) g.lineTo(xOf(t[i]), yOf(y[i]));
      else { g.moveTo(xOf(t[i]), yOf(y[i])); started = true; }
    }
    g.stroke();
  });
}

onMounted(() => {
  frame = requestAnimationFrame(draw);
  document.addEventListener('fullscreenchange', onFullChange);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  document.removeEventListener('fullscreenchange', onFullChange);
});

const fmt = (v) => (v === undefined ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(props.digits)}`);
</script>

<template>
  <figure ref="figure" class="flex flex-col gap-2" :class="full && 'h-full bg-white p-6 dark:bg-slate-800'">
    <figcaption class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span class="font-semibold">{{ title }} <span class="font-normal text-slate-500 dark:text-slate-400">{{ unit }}</span></span>
      <span v-for="(s, k) in series" :key="s.label" class="flex items-center gap-1.5 font-mono text-sm tabular-nums">
        <span class="inline-block h-0.5 w-4 rounded" :style="{ background: `var(${s.color})` }" />
        {{ s.label }} {{ fmt(values[k]) }}
      </span>
      <button v-if="canFull" type="button" class="ml-auto self-center rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :title="full ? 'Exit full screen (Esc)' : 'Full screen'" :aria-label="full ? 'Exit full screen' : 'Full screen'" @click="toggleFull">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="!full" d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" />
          <path v-else d="M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4" />
        </svg>
      </button>
    </figcaption>
    <canvas ref="canvas" class="w-full" :class="full ? 'min-h-0 flex-1' : 'h-48'" role="img" :aria-label="`${title}, ${unit}: the last ${windowMs / 1000} s of ${series.map((s) => s.label).join(', ')}`" />
  </figure>
</template>
