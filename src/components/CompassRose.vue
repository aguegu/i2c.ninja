<script setup>
// A compass rose as a phone shows one: the board's nose fixed at the top,
// the rose turned so its N points at magnetic north; the board's x (the
// nose) and y (its left) marked round the rim in the charts' colours
// (x blue, y orange, z green), z (out of the board, toward
// you: seen from above) at the bottom right. heading: degrees
// clockwise from magnetic north to the nose (null: none yet). A button
// takes it full screen, the heading written large there.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  heading: { type: Number, default: null },
});

const R = 100;
const LABEL_ROOM = 36; // round the rose for the axis marks: x above, y left, z bottom right
const RING = 86;
const MARK = RING + 16; // the axis marks' inner end: just outside the rim
const ARROW = 12; // their length
const LABEL = ARROW + 6; // their labels, beyond them
const CARDINALS = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];
const NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

const turn = computed(() => `rotate(${-(props.heading ?? 0)})`);
const name = computed(() => (props.heading === null ? '' : NAMES[Math.round(props.heading / 45) % 8]));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative flex flex-col items-center" :class="full && 'h-full! w-full! justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <svg :viewBox="`${-R - LABEL_ROOM} ${-R - LABEL_ROOM} ${2 * (R + LABEL_ROOM)} ${2 * (R + LABEL_ROOM)}`" :class="full ? 'h-[min(80vh,80vw)] w-[min(80vh,80vw)]' : 'h-56 w-56'" role="img" :aria-label="heading === null ? 'Compass: no heading yet' : `Compass: heading ${heading.toFixed(0)} degrees, ${name}`">
      <circle :r="RING + 10" fill="#f8fafc" stroke="#334155" stroke-width="4" />
      <g :transform="turn">
        <line v-for="d in TICKS" :key="d" x1="0" :y1="-RING" x2="0" :y2="d % 30 ? -RING + 6 : -RING + 11" :transform="`rotate(${d})`" stroke="#475569" :stroke-width="d % 30 ? 1 : 2" />
        <text v-for="[c, d] in CARDINALS" :key="c" x="0" :y="-RING + 26" :transform="`rotate(${d})`" text-anchor="middle" font-size="15" font-weight="bold" :fill="c === 'N' ? '#e11d48' : '#334155'">{{ c }}</text>
        <path d="M 0 -52 L 9 0 L -9 0 Z" fill="#e11d48" />
        <path d="M 0 52 L 9 0 L -9 0 Z" fill="#94a3b8" />
      </g>
      <circle r="5" fill="#334155" />
      <!-- the board's x (its nose): fixed, above the rose -->
      <path :d="`M 0 ${-MARK - ARROW} L -7 ${-MARK} L 7 ${-MARK} Z`" fill="var(--series-1)" stroke="var(--series-1)" />
      <text x="0" :y="-MARK - LABEL" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--series-1)">x</text>
      <!-- the board's y: fixed, left of the rose -->
      <path :d="`M ${-MARK - ARROW} 0 L ${-MARK} -7 L ${-MARK} 7 Z`" fill="var(--series-2)" stroke="var(--series-2)" />
      <text :x="-MARK - LABEL" y="5" text-anchor="end" font-size="14" font-weight="bold" fill="var(--series-2)">y</text>
      <!-- the board's z: out of it, toward you (seen from above, face up): at the bottom right, as far out as x and y -->
      <g :transform="`translate(${MARK + ARROW / 2} ${MARK + ARROW / 2})`">
        <circle r="7" fill="var(--series-3)" stroke="var(--series-3)" />
        <circle r="2.2" fill="white" />
      </g>
      <text :x="MARK + LABEL" :y="MARK + LABEL + 10" font-size="14" font-weight="bold" fill="var(--series-3)">z</text>
    </svg>
    <p :class="full ? 'font-mono text-3xl tabular-nums' : 'mt-1 font-mono text-lg tabular-nums'">{{ heading === null ? '—' : `${heading.toFixed(0)}° ${name}` }}</p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
