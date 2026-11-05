<script setup>
// An accelerometer's reading as three flat views, as an engineering drawing
// has them: from above (x right, y up: the axes as printed), from the
// board's right side (x right, z up; y points away), from its nose (y
// right, z up; x points out at you). In each, the board's outline, a 1 g
// circle, and the reading's arrow as it falls on that plane: its length
// is the share of the reading in that plane. Past CUT_G the arrow is cut
// short and dashed. A button takes the three full screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  x: { type: Number, default: 0 }, // g, the board's axes
  y: { type: Number, default: 0 },
  z: { type: Number, default: 1 },
});

const R = 100; // the viewBox's half size
const PX_PER_G = 60;
const CUT_G = 1.55; // the arrow's longest, inside the box
const HEAD_PX = 10;
// the board, half sizes (px): as Learn the IMU's 3D board, 1.1 x 0.65 x 0.07
const HALF = { x: 55, y: 32.5, z: 3.5 };

const VIEWS = [
  { key: 'top', title: 'From above', h: 'x', v: 'y', away: 'z points at you' },
  { key: 'side', title: 'From its right side', h: 'x', v: 'z', away: 'y points away' },
  { key: 'nose', title: 'From its nose', h: 'y', v: 'z', away: 'x points at you' },
];

function arrow(h, v) {
  const n = Math.hypot(h, v);
  const cut = n > CUT_G;
  const len = Math.min(n, CUT_G) * PX_PER_G;
  if (n === 0) return { t: [0, 0], head: '', cut, n };
  const ux = h / n, uy = -v / n;
  const t = [ux * len, uy * len];
  const head = len < HEAD_PX ? '' : `${t[0] - HEAD_PX * (ux - 0.5 * uy)},${t[1] - HEAD_PX * (uy + 0.5 * ux)} ${t[0]},${t[1]} ${t[0] - HEAD_PX * (ux + 0.5 * uy)},${t[1] - HEAD_PX * (uy - 0.5 * ux)}`;
  return { t, head, cut, n };
}

const views = computed(() => VIEWS.map((w) => ({ ...w, a: arrow(props[w.h], props[w.v]), bw: HALF[w.h], bh: HALF[w.v], hv: props[w.h], vv: props[w.v] })));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <figure v-for="w in views" :key="w.key" class="flex flex-col items-center">
        <figcaption class="mb-1 text-sm font-semibold">{{ w.title }}</figcaption>
        <svg :viewBox="`${-R} ${-R} ${2 * R} ${2 * R}`" :class="full ? 'h-[60vh] w-full' : 'h-48 w-full max-w-60'" role="img" :aria-label="`${w.title}: ${w.h} ${w.hv.toFixed(2)} g, ${w.v} ${w.vv.toFixed(2)} g`">
          <circle :r="PX_PER_G" fill="none" stroke="var(--chart-grid)" stroke-width="1.5" />
          <line :x1="-R + 8" y1="0" :x2="R - 8" y2="0" stroke="var(--chart-grid)" />
          <line x1="0" :y1="-R + 8" x2="0" :y2="R - 8" stroke="var(--chart-grid)" />
          <rect :x="-w.bw" :y="-w.bh" :width="2 * w.bw" :height="2 * w.bh" rx="2" fill="#1f5fa8" fill-opacity="0.35" stroke="#1f5fa8" />
          <text :x="R - 6" y="-6" text-anchor="end" font-size="11" fill="var(--chart-text)">+{{ w.h }}</text>
          <text x="5" :y="-R + 14" font-size="11" fill="var(--chart-text)">+{{ w.v }}</text>
          <text :x="PX_PER_G * 0.71 + 3" :y="-PX_PER_G * 0.71 - 3" font-size="10" fill="var(--chart-text)">1 g</text>
          <g stroke="#e11d48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <line x1="0" y1="0" :x2="w.a.t[0]" :y2="w.a.t[1]" :stroke-dasharray="w.a.cut ? '8 4' : ''" />
            <polyline v-if="w.a.head" :points="w.a.head" />
          </g>
          <circle r="3" fill="#e11d48" />
        </svg>
        <p class="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">{{ w.h }} {{ w.hv.toFixed(2) }} · {{ w.v }} {{ w.vv.toFixed(2) }} g · {{ w.away }}</p>
      </figure>
    </div>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
