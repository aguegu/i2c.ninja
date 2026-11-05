<script setup>
// A bubble level, seen from above with the board's axes as printed (x
// right, y up): the bubble drifts to the high side. Tilted so +x rises, +x
// points a little up and reads a little of gravity's +1 g: the bubble's
// offset follows (x, y). Its distance from the centre is the tilt from
// level (the angle between the board's z and up), 0 to TILT_MAX_DEG at the
// rim; past it (or upside down) the bubble stays at the rim.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';
import { DEG } from '../lib/tilt.js';

const props = defineProps({
  x: { type: Number, default: 0 }, // g
  y: { type: Number, default: 0 },
  z: { type: Number, default: 1 },
});

const SIZE = 200;
const R = SIZE / 2;
const VIAL_R = 90;
const BUBBLE_R = 14;
const TILT_MAX_DEG = 30; // the rim
const RINGS_DEG = [2, 10, 20]; // 2: the centre ring, "level"
const LEVEL_DEG = 2;
const travel = VIAL_R - BUBBLE_R;

const tilt = computed(() => Math.atan2(Math.hypot(props.x, props.y), props.z) * DEG);
const bubble = computed(() => {
  const h = Math.hypot(props.x, props.y);
  const r = (Math.min(tilt.value, TILT_MAX_DEG) / TILT_MAX_DEG) * travel;
  return h === 0 ? { cx: 0, cy: 0 } : { cx: (props.x / h) * r, cy: (-props.y / h) * r };
});
const level = computed(() => tilt.value < LEVEL_DEG);
const ringR = (deg) => (deg / TILT_MAX_DEG) * travel;

const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! flex-col items-center justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <svg :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" :class="full ? 'h-[min(80vh,80vw)] w-[min(80vh,80vw)]' : 'h-52 w-52'" role="img" :aria-label="`Bubble level: ${tilt.toFixed(1)} degrees from level`">
      <circle :r="VIAL_R + 4" fill="#475569" />
      <circle :r="VIAL_R" fill="#d9f99d" stroke="#84cc16" stroke-width="1" />
      <circle v-for="d in RINGS_DEG" :key="d" :r="ringR(d) + BUBBLE_R" fill="none" :stroke="d === LEVEL_DEG ? '#15803d' : '#65a30d'" :stroke-width="d === LEVEL_DEG ? 2 : 1" :stroke-dasharray="d === LEVEL_DEG ? '' : '3 3'" />
      <line :x1="-VIAL_R" y1="0" :x2="VIAL_R" y2="0" stroke="#65a30d" stroke-width="0.75" />
      <line x1="0" :y1="-VIAL_R" x2="0" :y2="VIAL_R" stroke="#65a30d" stroke-width="0.75" />
      <text :x="VIAL_R - 4" y="-4" text-anchor="end" font-size="10" fill="#3f6212">+x</text>
      <text x="4" :y="-VIAL_R + 12" font-size="10" fill="#3f6212">+y</text>
      <circle :cx="bubble.cx" :cy="bubble.cy" :r="BUBBLE_R" :fill="level ? '#f0fdf4' : '#ffffff'" fill-opacity="0.9" :stroke="level ? '#15803d' : '#4d7c0f'" stroke-width="2" />
      <circle :cx="bubble.cx - 4" :cy="bubble.cy - 4" r="3.5" fill="#ffffff" />
    </svg>
    <p :class="full ? 'font-mono text-2xl tabular-nums' : 'mt-2 text-center font-mono text-sm tabular-nums'">
      {{ level ? 'level' : `${tilt.toFixed(1)}° off level` }}
    </p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
