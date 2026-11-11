<script setup>
// Record, beside the pages' Stop (StopButton.vue): the page's named series
// written to a CSV on the disk as they come (lib/recorder.js); Stop
// recording, the page's Stop or leaving the page ends it and saves the
// file to the browser's downloads. While it runs: the rows, the time, the
// file's size and the room left.
import { ref, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { hasRecorder, recording, rows, bytes, room, failure, elapsed, startRecording, stopRecording } from '../lib/recorder.js';

const TICK_MS = 1000;
const route = useRoute();
// the file's name: the page's path, /physics/acceleration -> physics-acceleration
const label = () => route.path.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'i2c-ninja';

const now = ref(Date.now());
const tick = setInterval(() => { now.value = Date.now(); }, TICK_MS);
onBeforeUnmount(() => {
  clearInterval(tick);
  stopRecording();
});

const size = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${(n / 1e3).toFixed(0)} kB`);
const clock = (ms) => {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const hms = [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, '0')).join(':');
  return d ? `${d} d ${hms}` : hms;
};
</script>

<template>
  <template v-if="hasRecorder">
    <button v-if="!recording" type="button" class="inline-flex items-center gap-2 rounded-lg border border-rose-600 px-4 py-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950" title="Record every reading to a CSV file, until you stop" @click="startRecording(label())">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
      Record
    </button>
    <button v-else type="button" class="inline-flex items-center gap-2 rounded-lg border border-rose-600 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300" title="Stop recording and save the CSV" @click="stopRecording">
      <svg viewBox="0 0 24 24" class="h-4 w-4 animate-pulse" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
      Stop recording
    </button>
    <span v-if="recording" class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
      {{ clock(elapsed(now)) }} · {{ rows.toLocaleString() }} rows · {{ size(bytes) }}<template v-if="room !== null"> · {{ size(room) }} free</template>
    </span>
    <span v-if="failure" class="text-sm text-red-700 dark:text-red-400">{{ failure }}</span>
  </template>
</template>
