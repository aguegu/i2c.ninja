<script setup>
// An accelerometer's reading, every way the site shows one: the readings
// (x, y, z, |a|) with the dial beside them, the reading three ways, the
// board in the room with gravity held still, and the chart. A page brings
// the reading ({ x, y, z } in g, or null) and the chart's buffers
// (source()), and its own controls and note in the readings card's slots:
// #top above the readings, #note at the card's foot. tiles=false leaves out
// the readings and the dial (a page that has its own), chart=false the chart.
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import AttitudeIndicator from './AttitudeIndicator.vue';
import VectorViews from './VectorViews.vue';
import AttitudeViews from './AttitudeViews.vue';
import { rollOf, pitchOf } from '../lib/tilt.js';

const props = defineProps({
  a: { type: Object, default: null }, // { x, y, z } g
  source: { type: Function, default: null }, // the chart's buffers
  windowMs: { type: Number, default: 10000 },
  tiles: { type: Boolean, default: true },
  chart: { type: Boolean, default: true },
});

const FLOOR_G = 1.2; // the chart's least half-range: 1 g at rest stays in view
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
const v = computed(() => props.a ?? { x: 0, y: 0, z: 1 }); // flat, at rest, until there's a reading
const size = computed(() => (props.a ? Math.hypot(props.a.x, props.a.y, props.a.z) : null));
const roll = computed(() => rollOf(v.value.x, v.value.y, v.value.z));
const pitch = computed(() => pitchOf(v.value.x, v.value.y, v.value.z));
const fmt = (n) => (n === undefined || n === null ? '—' : n.toFixed(3));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <div v-if="tiles" class="grid gap-4 md:grid-cols-[1fr_auto]">
    <section :class="[card, 'flex flex-col']">
      <slot name="top" />
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="k in AXES" :key="k">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ k }}</p>
          <p class="font-mono text-3xl tabular-nums">{{ fmt(a?.[k]) }} <span class="text-base">g</span></p>
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">|a|, all three</p>
          <p class="font-mono text-3xl tabular-nums">{{ fmt(size) }} <span class="text-base">g</span></p>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">At rest |a| is about 1 g whichever way it's turned: gravity, shared among the axes by the tilt. Shake it and |a| moves; drop it onto a cushion and it falls toward 0 g.</p>
      <div class="mt-auto">
        <slot name="note" />
      </div>
    </section>
    <section :class="[card, 'flex flex-col items-center']">
      <AttitudeIndicator :roll="roll" :pitch="pitch" />
      <p class="mt-2 font-mono text-sm tabular-nums">roll {{ roll.toFixed(0) }}° · pitch {{ pitch.toFixed(0) }}°</p>
      <p class="text-xs text-slate-500 dark:text-slate-400">from gravity, held still</p>
    </section>
  </div>

  <section :class="card">
    <h2 class="mb-2 font-semibold">What the chip feels, three ways</h2>
    <VectorViews :x="v.x" :y="v.y" :z="v.z" />
    <p class="mt-3 leading-relaxed">
      The reading as an arrow, seen from three sides like an engineering drawing; the board (its outline) stays still, in its own axes as printed. At rest the arrow is 1 g long, pointing up, away from the floor: not gravity's pull but the springs holding the mass up against it. Lying flat it stands straight up in the two side views and is a dot from above; tilt the real board and it leans in the views that see the tilt, still pointing at the ceiling. Shake it and it swings and stretches (dashed past 1.55 g); drop it onto a cushion and it shrinks toward the centre.
    </p>
  </section>

  <section :class="card">
    <h2 class="mb-2 font-semibold">The board in the room: gravity held still</h2>
    <AttitudeViews :x="v.x" :y="v.y" :z="v.z" />
    <p class="mt-3 leading-relaxed">
      The other way round: gravity stays put, pointing down, and the board turns as the reading says. From its right side you see the pitch (nose up or down), from behind the roll (a side down). From above you'd see the yaw, the heading, but an accelerometer can't: turning the board about the vertical changes nothing in how gravity falls on its axes. So here it always points straight ahead; a gyro or a compass is what tells the heading. Held still, that's all exact; shaken, the pushes get mistaken for tilt.
    </p>
  </section>

  <section v-if="chart && source" :class="card">
    <LiveChart title="Acceleration" unit="g" :series="SERIES" :values="a ? [a.x, a.y, a.z] : []" :source="source" :window-ms="windowMs" :floor="FLOOR_G" :digits="3" />
  </section>
</template>
