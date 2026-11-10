<script setup>
// The saturation curve: the most water vapour air can hold at each
// temperature (lib/humidity.js's Magnus formula), and the air's state on
// it when given (temperature C, relative humidity %): its point, the line up
// to what it could hold, the line across to its dew point. Humidity and dew
// point's diagram, and the home page's
import { computed } from 'vue';
import { saturation, vapourPressure, dewPoint } from '../lib/humidity.js';

const props = defineProps({
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null },
  height: { type: Number, default: 320 }, // the drawing's height in its units (600 wide): taller in the home page's carousel
});

const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
// the saturation curve, drawn: temperature across, vapour pressure up
const W = 600;
const H = props.height;
const PAD = { l: 52, r: 16, t: 16, b: 40 };
const T_MIN = -10;
const T_MAX = 40;
const E_MAX = 80; // hPa: e_s(40 C) is 73.8
const T_TICKS = [-10, 0, 10, 20, 30, 40];
const E_TICKS = [0, 20, 40, 60, 80];
const CURVE_STEP_C = 0.5;
const x = (t) => PAD.l + ((t - T_MIN) / (T_MAX - T_MIN)) * (W - PAD.l - PAD.r);
const y = (e) => H - PAD.b - (e / E_MAX) * (H - PAD.t - PAD.b);
const curve = (() => {
  const pts = [];
  for (let t = T_MIN; t <= T_MAX; t += CURVE_STEP_C) pts.push(`${x(t).toFixed(1)},${y(saturation(t)).toFixed(1)}`);
  return `M${pts.join('L')}`;
})();
// the air now: its point (T, e), the most it could hold at T, its dew point
// the air's label: right of its dot, or in the empty top-left corner when
// the dot is in the right half (inside the drawing, clear of the curve)
const labelRight = computed(() => props.temperature !== null && x(props.temperature) > W / 2);
const state = computed(() => {
  if (props.temperature === null || props.humidity === null) return null;
  const t = props.temperature, rh = props.humidity, td = dewPoint(t, rh);
  const e = vapourPressure(t, rh);
  return { t, e, es: saturation(t), td, rh };
});

</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto w-full max-w-2xl" role="img" :aria-label="state ? `The saturation curve; the air now at ${fmt(state.t, 1)} °C holds ${fmt(state.e, 1)} hPa of vapour of the ${fmt(state.es, 1)} it could; its dew point ${fmt(state.td, 1)} °C` : 'The saturation curve: the most water vapour air can hold, rising steeply with temperature'">
    <g style="stroke: var(--chart-grid)" stroke-width="1">
      <line v-for="e in E_TICKS" :key="`e${e}`" :x1="PAD.l" :x2="W - PAD.r" :y1="y(e)" :y2="y(e)" />
      <line v-for="t in T_TICKS" :key="`t${t}`" :x1="x(t)" :x2="x(t)" :y1="PAD.t" :y2="H - PAD.b" />
    </g>
    <g style="fill: var(--chart-text)" font-size="12">
      <text v-for="e in E_TICKS" :key="`el${e}`" :x="PAD.l - 6" :y="y(e) + 4" text-anchor="end">{{ e }}</text>
      <text v-for="t in T_TICKS" :key="`tl${t}`" :x="x(t)" :y="H - PAD.b + 16" text-anchor="middle">{{ t }}</text>
      <text :x="(PAD.l + W - PAD.r) / 2" :y="H - 6" text-anchor="middle">temperature, °C</text>
      <text :x="14" :y="(PAD.t + H - PAD.b) / 2" text-anchor="middle" :transform="`rotate(-90 14 ${(PAD.t + H - PAD.b) / 2})`">water vapour pressure, hPa</text>
    </g>
    <path :d="curve" fill="none" style="stroke: var(--series-1)" stroke-width="2" />
    <text :x="x(30) - 8" :y="y(saturation(30)) - 8" text-anchor="end" font-size="12" style="fill: var(--chart-text)">saturated: 100 %, it condenses above</text>
    <g v-if="state">
      <line :x1="x(state.t)" :x2="x(state.t)" :y1="y(state.e)" :y2="y(state.es)" style="stroke: var(--series-2)" stroke-width="2" stroke-dasharray="4 4" />
      <line :x1="x(state.td)" :x2="x(state.t)" :y1="y(state.e)" :y2="y(state.e)" style="stroke: var(--series-1)" stroke-width="2" stroke-dasharray="4 4" />
      <circle :cx="x(state.td)" :cy="y(state.e)" r="5" style="fill: var(--series-1)" />
      <circle :cx="x(state.t)" :cy="y(state.e)" r="6" style="fill: var(--series-2); stroke: var(--chart-grid)" stroke-width="2" />
      <text :x="labelRight ? PAD.l + 10 : x(state.t) + 10" :y="labelRight ? PAD.t + 16 : y(state.e) + 4" font-size="12" style="fill: var(--chart-text)">the air now: {{ fmt(state.e, 1) }} hPa, {{ fmt(state.rh, 0) }} % of {{ fmt(state.es, 1) }}</text>
      <text :x="x(state.td) - 8" :y="y(state.e) + 18" text-anchor="end" font-size="12" style="fill: var(--chart-text)">dew point {{ fmt(state.td, 1) }} °C</text>
    </g>
  </svg>
</template>
