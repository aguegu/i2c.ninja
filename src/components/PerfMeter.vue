<script setup>
// The on-page timing meter, on with ?perf in the address (remembered for the
// tab; ?perf=0 off): frames a second and their times (median, 95th
// percentile, worst; over 33 ms is a dropped frame), and when a sensor is
// reading, readings a second and the longest gap between two. A strip of the
// last frame times, lines at 16.7 and 33 ms. To tell a slow frame (drawing)
// from an uneven reading (data) when the motion isn't smooth. Served by our
// dev or preview server (not i2c.ninja), the numbers are posted to it every
// two seconds too (/__perf, vite.config.js), to be read off that machine.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { perf } from '../lib/perf.js';

const WINDOW_MS = 1000; // the numbers: over the last second
const DROPS_MS = 10000; // dropped frames: over the last ten seconds
const DROP_FRAME_MS = 33.4; // two frames at 60 Hz
const SHOW_EVERY_MS = 500;
const STRIP = 120; // frames in the strip
const STRIP_W = 240, STRIP_H = 48, STRIP_TOP_MS = 50;
const POST_EVERY_MS = 2000;
const POSTS = !/(^|\.)i2c\.ninja$/.test(location.hostname); // our dev or preview server

const stats = ref(null);
const strip = ref(null);
const frames = []; // [t, ms]
let frame = 0, last = 0, shownAt = 0, postedAt = 0;
// the slow frames' anatomy, where the browser has the Long Animation Frames
// API (Chromium 123+): each over 50 ms, how its time went (script, style and
// layout, the rest of the render) and its longest script, posted with the
// numbers (cleared each post)
let slow = [];
let loaf = null;
function watchSlowFrames() {
  if (!PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) return;
  loaf = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      const top = [...e.scripts].sort((a, b) => b.duration - a.duration)[0];
      slow.push({
        ms: Math.round(e.duration),
        script: Math.round(e.scripts.reduce((n, x) => n + x.duration, 0)),
        style: Math.round(e.renderStart && e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0),
        render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0),
        top: top ? `${top.invoker || top.invokerType} ${top.sourceFunctionName || ''} ${(top.sourceURL || '').split('/').pop()}:${top.sourceCharPosition ?? ''}`.trim() : '',
        topMs: top ? Math.round(top.duration) : 0,
        y: Math.round(scrollY),
      });
    }
  });
  loaf.observe({ type: 'long-animation-frame', buffered: false });
}


const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? 0;

function tick(t) {
  frame = requestAnimationFrame(tick);
  if (last) frames.push([t, t - last]);
  last = t;
  while (frames.length && frames[0][0] < t - DROPS_MS) frames.shift();
  if (t - shownAt < SHOW_EVERY_MS) return;
  shownAt = t;
  const recent = frames.filter(([ft]) => ft >= t - WINDOW_MS).map(([, ms]) => ms);
  const sorted = [...recent].sort((a, b) => a - b);
  const rs = perf.readings.filter((r) => r >= t - WINDOW_MS);
  let gap = 0;
  for (let i = 1; i < rs.length; i++) gap = Math.max(gap, rs[i] - rs[i - 1]);
  stats.value = {
    fps: recent.length * (1000 / WINDOW_MS),
    p50: pct(sorted, 0.5), p95: pct(sorted, 0.95), worst: sorted.at(-1) ?? 0,
    drops: frames.filter(([, ms]) => ms > DROP_FRAME_MS).length,
    readings: rs.length * (1000 / WINDOW_MS), gap,
  };
  draw();
  if (POSTS && t - postedAt >= POST_EVERY_MS) {
    postedAt = t;
    const r1 = (v) => Math.round(v * 10) / 10;
    const body = JSON.stringify({ path: location.pathname, y: Math.round(scrollY), ...Object.fromEntries(Object.entries(stats.value).map(([k, v]) => [k, r1(v)])), ...(slow.length ? { slow } : {}) });
    slow = [];
    fetch('/__perf', { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}

function draw() {
  const c = strip.value;
  if (!c) return;
  const g = c.getContext('2d');
  const dpr = devicePixelRatio || 1;
  if (c.width !== STRIP_W * dpr) { c.width = STRIP_W * dpr; c.height = STRIP_H * dpr; }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, STRIP_W, STRIP_H);
  const y = (ms) => STRIP_H - (Math.min(ms, STRIP_TOP_MS) / STRIP_TOP_MS) * STRIP_H;
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  for (const ms of [16.7, DROP_FRAME_MS]) { g.beginPath(); g.moveTo(0, y(ms)); g.lineTo(STRIP_W, y(ms)); g.stroke(); }
  const bar = STRIP_W / STRIP;
  frames.slice(-STRIP).forEach(([, ms], i) => {
    g.fillStyle = ms > DROP_FRAME_MS ? '#f87171' : ms > 20 ? '#fbbf24' : '#34d399';
    g.fillRect(i * bar, y(ms), Math.max(1, bar - 0.5), STRIP_H - y(ms));
  });
}

onMounted(() => { perf.on = true; frame = requestAnimationFrame(tick); watchSlowFrames(); });
onBeforeUnmount(() => { perf.on = false; perf.readings.length = 0; cancelAnimationFrame(frame); loaf?.disconnect(); });
const f1 = (v) => v.toFixed(1);
</script>

<template>
  <aside class="pointer-events-none fixed bottom-3 left-3 z-40 rounded-lg bg-slate-900/85 p-2 font-mono text-[11px] leading-4 text-slate-100 shadow-lg tabular-nums" aria-label="Timing meter">
    <template v-if="stats">
      <div>{{ f1(stats.fps) }} fps · frame {{ f1(stats.p50) }} / {{ f1(stats.p95) }} / {{ f1(stats.worst) }} ms</div>
      <div :class="stats.drops ? 'text-red-300' : ''">dropped (&gt;33 ms, 10 s): {{ stats.drops }}</div>
      <div v-if="stats.readings">readings {{ f1(stats.readings) }}/s · longest gap {{ f1(stats.gap) }} ms</div>
      <div v-else class="text-slate-400">readings: none (not connected)</div>
    </template>
    <canvas ref="strip" class="mt-1 block" :style="{ width: `${STRIP_W}px`, height: `${STRIP_H}px` }" />
  </aside>
</template>
