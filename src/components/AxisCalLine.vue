<script setup>
// One axis of the accelerometer's calibration on a number line: where it
// read pointing up and pointing down, against the ideal +1 g and -1 g, the
// midpoint between them (the offset) and the span (twice the scale). The
// errors are tiny, so they're drawn EXAGGERATE times larger.
import { computed } from 'vue';

const props = defineProps({
  axis: { type: String, required: true },
  color: { type: String, required: true }, // a CSS var name, e.g. --series-1
  up: { type: Number, default: null }, // g, the reading pointing up
  down: { type: Number, default: null }, // g, pointing down
});

const EXAGGERATE = 10;
const W = 520, H = 70, PAD = 30;
const RANGE = 1.6; // the line's half span, in drawn g
const xOf = (g) => PAD + ((g + RANGE) / (2 * RANGE)) * (W - 2 * PAD);
// a reading drawn at its ideal place, plus its error exaggerated
const drawn = (reading, ideal) => ideal + EXAGGERATE * (reading - ideal);

const marks = computed(() => {
  const m = {};
  if (props.up !== null) m.up = xOf(drawn(props.up, 1));
  if (props.down !== null) m.down = xOf(drawn(props.down, -1));
  if (props.up !== null && props.down !== null) {
    m.offset = (props.up + props.down) / 2;
    m.scale = (props.up - props.down) / 2;
    m.mid = xOf(EXAGGERATE * m.offset);
  }
  return m;
});
const f = (v, n = 3) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n);
</script>

<template>
  <div class="flex flex-col gap-1">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full max-w-xl" role="img" :aria-label="`The ${axis} axis' calibration`">
      <line :x1="PAD" :y1="35" :x2="W - PAD" :y2="35" stroke="var(--chart-grid)" stroke-width="2" />
      <g v-for="g in [-1, 0, 1]" :key="g">
        <line :x1="xOf(g)" y1="27" :x2="xOf(g)" y2="43" stroke="var(--chart-text)" stroke-width="1.5" />
        <text :x="xOf(g)" y="62" text-anchor="middle" font-size="12" fill="var(--chart-text)">{{ g === 0 ? '0' : `${g > 0 ? '+' : '−'}1 g` }}</text>
      </g>
      <text x="4" y="40" font-size="14" font-weight="bold" :fill="`var(${color})`">{{ axis }}</text>
      <line v-if="marks.mid !== undefined" :x1="marks.down" y1="18" :x2="marks.up" y2="18" :stroke="`var(${color})`" stroke-width="2" opacity="0.5" />
      <circle v-if="marks.down !== undefined" :cx="marks.down" cy="35" r="7" :fill="`var(${color})`" stroke="white" stroke-width="2" />
      <circle v-if="marks.up !== undefined" :cx="marks.up" cy="35" r="7" :fill="`var(${color})`" stroke="white" stroke-width="2" />
      <g v-if="marks.mid !== undefined">
        <line :x1="marks.mid" y1="22" :x2="marks.mid" y2="48" stroke="#f59e0b" stroke-width="3" />
        <text :x="marks.mid" y="14" text-anchor="middle" font-size="11" fill="#f59e0b">offset</text>
      </g>
    </svg>
    <p class="font-mono text-sm tabular-nums">
      {{ axis }}: down {{ down === null ? '—' : f(down) }} g, up {{ up === null ? '—' : f(up) }} g<template v-if="marks.mid !== undefined"> → offset {{ f(marks.offset, 4) }} g, scale {{ marks.scale.toFixed(4) }}</template>
    </p>
  </div>
</template>
