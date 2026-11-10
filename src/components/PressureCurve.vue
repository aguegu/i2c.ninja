<script setup>
// Pressure against height in the standard atmosphere (lib/pressure.js),
// height up, pressure across: the curve, a summit marked, and a reading on
// it when given (Pa): the height the standard atmosphere puts it at. Air
// pressure and height's diagram
import { computed } from 'vue';
import { isaHeight, isaPressure } from '../lib/pressure.js';

const props = defineProps({
  pressure: { type: Number, default: null }, // Pa
});

const W = 600;
const H = 360;
const PAD = { l: 56, r: 16, t: 16, b: 40 };
const P_MAX = 1300; // hPa: room right of sea level for its label
const H_MAX = 10; // km
const P_TICKS = [0, 200, 400, 600, 800, 1000, 1200];
const H_TICKS = [0, 2, 4, 6, 8, 10];
const STEP_KM = 0.1;
const EVEREST_KM = 8.849; // its summit's height
const NOTE_KM = 6.8; // the reading's words: right of the curve, under Everest's
const x = (hpa) => PAD.l + (hpa / P_MAX) * (W - PAD.l - PAD.r);
const y = (km) => H - PAD.b - (km / H_MAX) * (H - PAD.t - PAD.b);
const curve = (() => {
  const pts = [];
  for (let km = 0; km <= H_MAX + 1e-9; km += STEP_KM) pts.push(`${x(isaPressure(km * 1000) / 100).toFixed(1)},${y(km).toFixed(1)}`);
  return `M${pts.join('L')}`;
})();
const everest = { hpa: isaPressure(EVEREST_KM * 1000) / 100, km: EVEREST_KM };
// the reading: its height in the standard atmosphere (below sea level drawn at 0)
const at = computed(() => {
  if (props.pressure === null) return null;
  const m = isaHeight(props.pressure);
  return { hpa: props.pressure / 100, m, km: Math.max(0, m / 1000) };
});
const fmtM = (m) => (m < 0 ? `${Math.round(-m)} m below sea level` : `${Math.round(m)} m`);
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto w-full max-w-2xl" role="img" :aria-label="at ? `Pressure against height in the standard atmosphere; ${at.hpa.toFixed(1)} hPa is ${fmtM(at.m)} there` : 'Pressure against height in the standard atmosphere: 1013 hPa at sea level, half that at 5.6 km'">
    <g style="stroke: var(--chart-grid)" stroke-width="1">
      <line v-for="t in H_TICKS" :key="`h${t}`" :x1="PAD.l" :x2="W - PAD.r" :y1="y(t)" :y2="y(t)" />
      <line v-for="t in P_TICKS" :key="`p${t}`" :x1="x(t)" :x2="x(t)" :y1="PAD.t" :y2="H - PAD.b" />
    </g>
    <g style="fill: var(--chart-text)" font-size="12">
      <text v-for="t in H_TICKS" :key="`hl${t}`" :x="PAD.l - 6" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
      <text v-for="t in P_TICKS" :key="`pl${t}`" :x="x(t)" :y="H - PAD.b + 16" text-anchor="middle">{{ t }}</text>
      <text :x="(PAD.l + W - PAD.r) / 2" :y="H - 6" text-anchor="middle">air pressure, hPa</text>
      <text :x="16" :y="(PAD.t + H - PAD.b) / 2" text-anchor="middle" :transform="`rotate(-90 16 ${(PAD.t + H - PAD.b) / 2})`">height, km</text>
    </g>
    <path :d="curve" fill="none" style="stroke: var(--series-1)" stroke-width="2" />
    <circle :cx="x(everest.hpa)" :cy="y(everest.km)" r="4" style="fill: var(--chart-text)" />
    <text :x="x(everest.hpa) + 8" :y="y(everest.km) + 4" font-size="12" style="fill: var(--chart-text)">Everest's summit: {{ Math.round(everest.hpa) }} hPa</text>
    <circle :cx="x(1013.25)" :cy="y(0)" r="4" style="fill: var(--chart-text)" />
    <text :x="x(1013.25) + 8" :y="y(0) - 8" font-size="12" style="fill: var(--chart-text)">sea level: 1013 hPa</text>
    <g v-if="at">
      <line :x1="PAD.l" :x2="x(at.hpa)" :y1="y(at.km)" :y2="y(at.km)" style="stroke: var(--series-2)" stroke-width="2" stroke-dasharray="4 4" />
      <circle :cx="x(at.hpa)" :cy="y(at.km)" r="6" style="fill: var(--series-2); stroke: var(--chart-grid)" stroke-width="2" />
      <!-- its words in the empty space right of the curve, under Everest's -->
      <text :x="W - PAD.r - 8" :y="y(NOTE_KM)" text-anchor="end" font-size="13" style="fill: var(--chart-text)">yours: {{ at.hpa.toFixed(1) }} hPa,</text>
      <text :x="W - PAD.r - 8" :y="y(NOTE_KM) + 18" text-anchor="end" font-size="13" style="fill: var(--chart-text)">{{ fmtM(at.m) }} in the standard atmosphere</text>
    </g>
  </svg>
</template>
