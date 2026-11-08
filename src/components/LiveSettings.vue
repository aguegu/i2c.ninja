<script setup>
// A Live card's settings: a cog that opens a small menu (closed by a click
// outside it or Esc). Its first switch: the timing meter (components/
// PerfMeter, lib/perf.js), frames and readings in a corner of the page.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { meterOn, setMeter } from '../lib/perf.js';

const open = ref(false);
const root = ref(null);
const outside = (e) => { if (open.value && !root.value?.contains(e.target)) open.value = false; };
const esc = (e) => { if (e.key === 'Escape') open.value = false; };
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', esc); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', esc); });
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :aria-expanded="open" aria-haspopup="true" aria-label="Settings" title="Settings" @click="open = !open">
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    </button>
    <div v-if="open" class="absolute right-0 z-30 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800" role="menu">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p id="meter-label" class="text-sm font-medium">Timing meter</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Frames and readings a second, in a corner of the page. For this tab.</p>
        </div>
        <button type="button" role="switch" :aria-checked="meterOn" aria-labelledby="meter-label" class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors" :class="meterOn ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'" @click="setMeter(!meterOn)">
          <span class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" :class="meterOn && 'translate-x-5'" />
        </button>
      </div>
    </div>
  </div>
</template>
