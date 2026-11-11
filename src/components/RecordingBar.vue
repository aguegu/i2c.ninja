<script setup>
// The bar at the top of every page while a recording runs (lib/recorder.js):
// stays in sight as the page scrolls; the file, the time, the rows, its
// size, the room left, and Stop recording.
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
  <div v-if="recording" class="sticky top-0 z-40 bg-rose-600 text-white shadow" role="status" aria-live="polite">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
      <span class="flex items-center gap-2 font-semibold">
        <svg viewBox="0 0 24 24" class="h-3 w-3 animate-pulse" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10" /></svg>
        Recording
      </span>
      <span class="font-mono tabular-nums">{{ clock(elapsed(now)) }} · {{ rows.toLocaleString() }} rows · {{ size(bytes) }}<template v-if="room !== null"> · {{ size(room) }} free</template></span>
      <span class="hidden truncate opacity-80 sm:inline">{{ fileName }}</span>
      <button type="button" class="ml-auto rounded-lg bg-white/15 px-3 py-1 font-medium hover:bg-white/25" @click="stopRecording">Stop recording</button>
    </div>
  </div>
</template>
