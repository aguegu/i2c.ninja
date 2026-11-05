<script setup>
// The board held still on screen, its accelerometer's reading as an arrow
// from its middle (Board3D's vector), |a| under it; a button takes it full
// screen.
import { ref, computed } from 'vue';
import Board3D from './Board3D.vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  x: { type: Number, default: 0 }, // g, the board's axes
  y: { type: Number, default: 0 },
  z: { type: Number, default: 1 },
});

const vector = computed(() => [props.x, props.y, props.z]);
const size = computed(() => Math.hypot(props.x, props.y, props.z));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative flex flex-col items-center" :class="full && 'h-full! w-full! justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <Board3D :vector="vector" :svg-class="full ? 'h-[80vh] w-full' : 'h-72 w-full max-w-sm'" />
    <p :class="full ? 'font-mono text-2xl tabular-nums' : 'font-mono text-sm tabular-nums'">|a| {{ size.toFixed(3) }} g</p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
