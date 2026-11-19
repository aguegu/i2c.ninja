<script setup>
// While a magnetometer calibrates (useHardIron): how far each axis has swung
// (swingProgress), a bar each, and which way to turn the board next for the
// axis furthest behind.
import { computed } from 'vue';
import { swingProgress } from '../lib/useHardIron.js';

const props = defineProps({
  span: { type: Object, default: null }, // useHardIron()'s span
});

const AXES = [
  { k: 'x', color: 'var(--series-1)' },
  { k: 'y', color: 'var(--series-2)' },
  { k: 'z', color: 'var(--series-3)' },
];

const p = computed(() => swingProgress(props.span));
const behind = computed(() => AXES.map((a) => a.k).reduce((m, k) => (p.value[k] < p.value[m] ? k : m)));
const hint = computed(() => {
  if (!props.span || p.value.all === 0) return 'Turn the board slowly: flat all the way round first.';
  if (p.value.all >= 1) return 'Every axis has swung far enough: press Done.';
  return `${behind.value} has swung least so far: turn the board so its ${behind.value} arrow points every way, up and down too.`;
});
</script>

<template>
  <div class="mt-3 max-w-xl" role="group" aria-label="Calibration progress">
    <div v-for="a in AXES" :key="a.k" class="flex items-center gap-3 py-0.5 text-sm">
      <span class="w-4 font-mono">{{ a.k }}</span>
      <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" :aria-label="`${a.k} swing`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(p[a.k] * 100)">
        <div class="h-full rounded-full transition-[width] duration-200" :style="{ width: `${p[a.k] * 100}%`, background: a.color }"></div>
      </div>
      <span class="w-10 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">{{ Math.round(p[a.k] * 100) }}%</span>
    </div>
    <p class="mt-1 text-sm" :class="p.all >= 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'">{{ hint }}</p>
  </div>
</template>
