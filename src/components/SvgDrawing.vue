<script setup>
// A drawing (a wiring guide, an explainer SVG) with a full-screen button
// in its corner; the size and placement classes go on it as on an <img>
import { ref } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
});
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! max-w-none! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <img :src="src" :alt="alt" class="w-full rounded-lg bg-white dark:bg-transparent" :class="full && 'h-full object-contain'">
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-1 right-1 bg-white/70 dark:bg-slate-800/70" @toggle="toggle" />
  </div>
</template>
