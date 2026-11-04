<script setup>
// A live line chart: the last windowMs of up to three series, redrawn each
// frame from source() (the caller's buffers, not reactive: { t: [ms], ys:
// [[...], ...] }). The y range is symmetric around 0, never below floor, so
// the noise at rest isn't blown up; ticks at 1-2-5 steps.
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, required: true },
  series: { type: Array, required: true }, // [{ label, color: '--series-1' }]
  values: { type: Array, default: () => [] }, // the latest value of each, for the legend
  source: { type: Function, required: true },
  windowMs: { type: Number, default: 10000 },
  floor: { type: Number, default: 1 },
  digits: { type: Number, default: 2 },
});

const canvas = ref(null);
let frame = 0;

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
  let top = props.floor;
  for (const y of ys) {
    for (let i = 0; i < y.length; i++) if (t[i] >= from) top = Math.max(top, Math.abs(y[i]));
  }
  const step = niceStep(2 * top, 4);
  top = Math.ceil(top / step) * step;

  const left = AXIS_GUTTER_PX * dpr, pad = PAD_PX * dpr;
  const xOf = (ms) => left + ((ms - from) / props.windowMs) * (w - left - pad);
  const yOf = (v) => h / 2 - (v / top) * (h / 2 - pad);

  g.font = `${LABEL_PX * dpr}px system-ui, sans-serif`;
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  g.lineWidth = dpr;
  for (let v = -top; v <= top + step / 2; v += step) {
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

onMounted(() => { frame = requestAnimationFrame(draw); });
onBeforeUnmount(() => cancelAnimationFrame(frame));

const fmt = (v) => (v === undefined ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(props.digits)}`);
</script>

<template>
  <figure class="flex flex-col gap-2">
    <figcaption class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span class="font-semibold">{{ title }} <span class="font-normal text-slate-500 dark:text-slate-400">{{ unit }}</span></span>
      <span v-for="(s, k) in series" :key="s.label" class="flex items-center gap-1.5 font-mono text-sm tabular-nums">
        <span class="inline-block h-0.5 w-4 rounded" :style="{ background: `var(${s.color})` }" />
        {{ s.label }} {{ fmt(values[k]) }}
      </span>
    </figcaption>
    <canvas ref="canvas" class="h-48 w-full" role="img" :aria-label="`${title}, ${unit}: the last ${windowMs / 1000} s of ${series.map((s) => s.label).join(', ')}`" />
  </figure>
</template>
