<script setup>
// Maxwell's colour triangle: pure red, green and blue at the corners, a mix
// a point inside pulled towards each corner by its share (the centre: equal
// parts). shares: [r, g, b] summing to 1, drawn as a filled dot in its own
// colour; ring: another mix, a dashed ring. Colour and light's diagram, and
// the home page's
import { computed } from 'vue';

const props = defineProps({
  shares: { type: Array, default: null },
  ring: { type: Array, default: null },
});

const CORNERS = { red: [24, 236], green: [150, 18], blue: [276, 236] };
const at = (s) => (s ? [0, 1].map((i) => s[0] * CORNERS.red[i] + s[1] * CORNERS.green[i] + s[2] * CORNERS.blue[i]) : null);
const CENTRE = at([1 / 3, 1 / 3, 1 / 3]);
const seen = computed(() => at(props.shares));
const ringAt = computed(() => at(props.ring));
const pct = (x) => `${Math.round(x * 100)} %`;
// shares as a screen colour, the strongest at full
const asColour = (s) => {
  if (!s) return 'transparent';
  const top = Math.max(...s);
  return `rgb(${s.map((x) => Math.round((255 * x) / top)).join(', ')})`;
};
</script>

<template>
  <svg viewBox="0 0 300 270" class="mx-auto w-full max-w-sm" role="img" :aria-label="shares ? `Maxwell's colour triangle: ${pct(shares[0])} red, ${pct(shares[1])} green, ${pct(shares[2])} blue` : 'Maxwell\'s colour triangle: red, green and blue at the corners'">
    <polygon :points="[CORNERS.red, CORNERS.green, CORNERS.blue].map((p) => p.join(',')).join(' ')" fill="none" style="stroke: var(--chart-text)" stroke-width="1.5" />
    <circle v-for="(p, k) in CORNERS" :key="k" :cx="p[0]" :cy="p[1]" r="9" :style="{ fill: `var(--channel-${k})` }" />
    <text :x="CORNERS.red[0]" :y="CORNERS.red[1] + 26" text-anchor="middle" font-size="12" style="fill: var(--chart-text)">red</text>
    <text :x="CORNERS.green[0] + 16" :y="CORNERS.green[1] + 4" font-size="12" style="fill: var(--chart-text)">green</text>
    <text :x="CORNERS.blue[0]" :y="CORNERS.blue[1] + 26" text-anchor="middle" font-size="12" style="fill: var(--chart-text)">blue</text>
    <g style="stroke: var(--chart-text)" stroke-width="1"><line :x1="CENTRE[0] - 5" :x2="CENTRE[0] + 5" :y1="CENTRE[1]" :y2="CENTRE[1]" /><line :x1="CENTRE[0]" :x2="CENTRE[0]" :y1="CENTRE[1] - 5" :y2="CENTRE[1] + 5" /></g>
    <circle v-if="ringAt" :cx="ringAt[0]" :cy="ringAt[1]" r="7" fill="none" style="stroke: var(--chart-text)" stroke-width="2" stroke-dasharray="3 2" />
    <circle v-if="seen" :cx="seen[0]" :cy="seen[1]" r="8" :style="{ fill: asColour(shares), stroke: 'var(--chart-text)' }" stroke-width="2" />
  </svg>
</template>
