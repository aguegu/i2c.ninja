<script setup>
// A spectrum as bars: the AS7341's eight visible bands, each in the colour its
// light looks (style.css's --band-f1..f8), and its near infrared apart at the
// right in grey, invisible to an eye. Its shape, not its counts: each bar a
// share of the strongest visible band, so a dim lamp and a bright one compare;
// the NIR on the same scale, cut at the top with its share written when taller
import { computed } from 'vue';

const props = defineProps({
  values: { type: Object, default: null }, // { f1..f8, nir } counts
  nm: { type: Object, required: true }, // { f1..f8, nir } nm
  small: { type: Boolean, default: false }, // no numbers, no nm row: a held one
  label: { type: String, default: 'A spectrum' },
});

const VISIBLE = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
const VW = 640, GAP = 12, NIR_GAP = 36;
const VH = computed(() => (props.small ? 150 : 270));
const TOP = computed(() => (props.small ? 10 : 28));
const BOTTOM = computed(() => VH.value - (props.small ? 22 : 50));
const BAR_W = (VW - GAP * 9 - NIR_GAP) / 9;

const peak = computed(() => (props.values ? Math.max(1, ...VISIBLE.map((k) => props.values[k])) : 1));
const bars = computed(() => [...VISIBLE, 'nir'].map((key, i) => {
  const share = props.values ? props.values[key] / peak.value : 0;
  const h = (BOTTOM.value - TOP.value) * Math.min(1, share);
  const x = GAP + i * (BAR_W + GAP) + (key === 'nir' ? NIR_GAP : 0);
  return { key, share, x, y: BOTTOM.value - h, h, color: key === 'nir' ? null : `var(--band-${key})` };
}));
const pct = (s) => (s >= 10 ? `${s.toFixed(0)}×` : s > 1 ? `${s.toFixed(1)}×` : `${Math.round(s * 100)}`);
const aria = computed(() => (props.values ? `${props.label}: ${bars.value.map((b) => `${props.nm[b.key]} nm ${Math.round(b.share * 100)} %`).join(', ')}` : `${props.label}, once connected`));
</script>

<template>
  <svg :viewBox="`0 0 ${VW} ${VH}`" class="w-full" role="img" :aria-label="aria">
    <line :x1="GAP / 2" :x2="VW - GAP / 2" :y1="BOTTOM" :y2="BOTTOM" stroke="currentColor" stroke-opacity="0.25" />
    <line :x1="bars[8].x - NIR_GAP / 2 - GAP / 2" :x2="bars[8].x - NIR_GAP / 2 - GAP / 2" :y1="TOP" :y2="BOTTOM" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4" />
    <g v-for="b in bars" :key="b.key">
      <rect :x="b.x" :y="b.y" :width="BAR_W" :height="Math.max(b.h, 0)" rx="4" :fill="b.color ?? 'currentColor'" :fill-opacity="b.color ? 1 : 0.35" />
      <text v-if="!small && values" :x="b.x + BAR_W / 2" :y="b.y - 6" text-anchor="middle" font-size="13" fill="currentColor" class="font-mono">{{ pct(b.share) }}</text>
      <text v-if="small && b.share > 1" :x="b.x + BAR_W / 2" :y="TOP - 1" text-anchor="middle" font-size="12" fill="currentColor" class="font-mono">{{ pct(b.share) }}</text>
      <text :x="b.x + BAR_W / 2" :y="BOTTOM + 17" text-anchor="middle" :font-size="small ? 14 : 13" fill="currentColor" fill-opacity="0.7">{{ nm[b.key] }}</text>
      <text v-if="!small" :x="b.x + BAR_W / 2" :y="BOTTOM + 34" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.55">{{ b.key === 'nir' ? 'NIR' : b.key.toUpperCase() }}</text>
    </g>
  </svg>
</template>
