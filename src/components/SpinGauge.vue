<script setup>
// A spin meter: the rate's size as a needle over a half dial to the gyro's
// full scale, in deg/s and rpm (deg/s / 6), the peak marked
import { computed } from 'vue';

const props = defineProps({
  spin: { type: Number, default: 0 }, // deg/s
  peak: { type: Number, default: 0 },
  full: { type: Number, default: 2000 }, // deg/s, the dial's end
});

const R = 80;
const TICKS = [0, 500, 1000, 1500, 2000];
const DEG_PER_RPM = 6;
const at = (v) => Math.PI * (1 - Math.min(v, props.full) / props.full); // radians, 0 to the right
const point = (v, r) => [r * Math.cos(at(v)), -r * Math.sin(at(v))];
const arc = (v0, v1, r) => {
  const [x0, y0] = point(v0, r), [x1, y1] = point(v1, r);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
const needle = computed(() => point(props.spin, R - 10));
const peakAt = computed(() => [point(props.peak, R - 4), point(props.peak, R + 8)]);
</script>

<template>
  <div class="flex flex-col items-center">
    <svg viewBox="-100 -96 200 110" class="w-full max-w-72" role="img" :aria-label="`Spin ${spin.toFixed(0)} degrees a second, ${(spin / DEG_PER_RPM).toFixed(0)} rpm; peak ${peak.toFixed(0)}`">
      <path :d="arc(0, full, R)" fill="none" stroke="var(--chart-grid)" stroke-width="10" />
      <path v-if="spin > 0.5" :d="arc(0, spin, R)" fill="none" stroke="#f59e0b" stroke-width="10" />
      <g v-for="t in TICKS" :key="t">
        <line :x1="point(t, R + 6)[0]" :y1="point(t, R + 6)[1]" :x2="point(t, R - 6)[0]" :y2="point(t, R - 6)[1]" stroke="var(--chart-text)" stroke-width="1.5" />
        <text :x="point(t, R - 20)[0]" :y="point(t, R - 20)[1] + 4" text-anchor="middle" font-size="9" fill="var(--chart-text)">{{ t }}</text>
      </g>
      <line v-if="peak > 0.5" :x1="peakAt[0][0]" :y1="peakAt[0][1]" :x2="peakAt[1][0]" :y2="peakAt[1][1]" stroke="#e11d48" stroke-width="3" />
      <line x1="0" y1="0" :x2="needle[0]" :y2="needle[1]" stroke="var(--chart-text)" stroke-width="3" stroke-linecap="round" />
      <circle r="5" fill="var(--chart-text)" />
    </svg>
    <p class="font-mono text-3xl tabular-nums">{{ (spin / DEG_PER_RPM).toFixed(0) }} <span class="text-base">rpm</span></p>
    <p class="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">{{ spin.toFixed(0) }} °/s · peak <span class="text-rose-600 dark:text-rose-400">{{ (peak / DEG_PER_RPM).toFixed(0) }} rpm</span></p>
  </div>
</template>
