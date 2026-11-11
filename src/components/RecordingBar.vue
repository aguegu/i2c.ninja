<script setup>
// The bar at the top of every page while a recording runs (lib/recorder.js):
// stays in sight as the page scrolls; the file, the time, the rows, its
// size, the room left, and its stop (a square, its name in the tooltip).
import { ref, watch, onBeforeUnmount } from 'vue';
import { recording, rows, bytes, room, fileName, elapsed, stopRecording } from '../lib/recorder.js';

const TICK_MS = 1000;
const now = ref(Date.now());
let tick = 0;
watch(recording, (on) => {
  clearInterval(tick);
  if (on) tick = setInterval(() => { now.value = Date.now(); }, TICK_MS);
}, { immediate: true });
onBeforeUnmount(() => clearInterval(tick));

const size = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${(n / 1e3).toFixed(0)} kB`);
const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const hms = [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, '0')).join(':');
  return d ? `${d} d ${hms}` : hms;
};
</script>

<template>
  <div v-if="recording" class="sticky top-0 z-40 border-b border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100" role="status" aria-live="polite">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
      <span class="flex items-center gap-2 font-semibold">
        <svg viewBox="0 0 24 24" class="h-3 w-3 animate-pulse text-rose-600 dark:text-rose-400" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        Recording
      </span>
      <span class="font-mono tabular-nums">{{ clock(elapsed(now)) }} · {{ rows.toLocaleString() }} rows · {{ size(bytes) }}<template v-if="room !== null"> · {{ size(room) }} free</template></span>
      <span class="hidden truncate text-rose-700/80 sm:inline dark:text-rose-200/80">{{ fileName }}</span>
      <button type="button" class="ml-auto rounded-md border border-rose-300 bg-white p-1.5 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-100 dark:hover:bg-rose-800" title="Stop recording and save the CSV" aria-label="Stop recording and save the CSV" @click="stopRecording">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
      </button>
    </div>
  </div>
</template>
