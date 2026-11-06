<script setup>
// A heading indicator, as on an aircraft's panel: a card marked every 5
// degrees (numbers every 30, in tens: 3 is 30, 33 is 330) turning behind a
// fixed aircraft, read at the top. In an aircraft it's a gyro too: no north
// of its own, it drifts and is set to the compass now and then; here 0 is
// the board's heading at the start. heading: degrees, turning right + (null:
// none yet). A button takes it full screen, the heading written large there.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  heading: { type: Number, default: null },
});

const SIZE = 200;
const R = SIZE / 2;
const FACE = 96;
const RING = 88; // the card's rim, its marks inside
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const NUMBERS = Array.from({ length: 12 }, (_, i) => i * 30);
const FACE_FILL = '#1e293b';
const MARKS = 'white';
const AIRCRAFT = '#f59e0b';

const shown = computed(() => (props.heading === null ? 0 : ((props.heading % 360) + 360) % 360));
const card = computed(() => `rotate(${-shown.value})`);
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! flex-col items-center justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <svg :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" :class="full ? 'h-[min(80vh,80vw)] w-[min(80vh,80vw)]' : 'h-52 w-52'" role="img" :aria-label="heading === null ? 'Heading: none yet' : `Heading: ${shown.toFixed(0)} degrees from the start`">
      <circle :r="FACE" :fill="FACE_FILL" />
      <g :transform="card">
        <line v-for="d in TICKS" :key="d" x1="0" :y1="-RING" x2="0" :y2="d % 10 ? -RING + 6 : -RING + 11" :transform="`rotate(${d})`" :stroke="MARKS" :stroke-width="d % 10 ? 1 : 1.5" />
        <text v-for="d in NUMBERS" :key="`n${d}`" x="0" :y="-RING + 26" :transform="`rotate(${d})`" text-anchor="middle" font-size="14" font-weight="bold" :fill="MARKS">{{ d / 10 }}</text>
      </g>
      <!-- the lubber line at the top, and the aircraft: fixed -->
      <path :d="`M 0 ${-FACE} L -6 ${-FACE + 10} L 6 ${-FACE + 10} Z`" :fill="AIRCRAFT" />
      <path d="M 0 -26 V 26 M -24 2 L 0 -6 L 24 2 M -10 22 L 0 18 L 10 22" fill="none" :stroke="AIRCRAFT" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <circle :r="FACE" fill="none" stroke="#334155" stroke-width="4" />
    </svg>
    <p v-if="full" class="font-mono text-2xl tabular-nums">heading {{ heading === null ? '—' : `${shown.toFixed(0)}°` }}</p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
