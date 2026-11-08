<script setup>
// A magnetometer's reading, every way the site shows one: the field (x, y,
// z, |B|) and its dip with the compass rose beside them, the hard-iron
// calibration, the field three ways, the board against the field line, and
// the chart. A page brings a useHardIron() (reactive) fed by its readings;
// running enables the buttons.
import CollapsibleCard from './CollapsibleCard.vue';
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import CompassRose from './CompassRose.vue';
import VectorViews from './VectorViews.vue';
import AttitudeViews from './AttitudeViews.vue';
import { DEG } from '../lib/tilt.js';

const props = defineProps({
  cal: { type: Object, required: true }, // useHardIron(), reactive
  running: { type: Boolean, default: false },
  windowMs: { type: Number, default: 30000 },
});

const FLOOR_UT = 60; // the chart's least half-range: Earth's field, 25-65 uT
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
const FIELD_COLOR = '#7c3aed'; // the field's arrows: not gravity's red
const SCALE_UT = 50; // the views' reference circle: about Earth's field
const b = computed(() => props.cal.latest);
const size = computed(() => (b.value ? Math.hypot(b.value.x, b.value.y, b.value.z) : null));
const level = computed(() => (b.value ? Math.hypot(b.value.x, b.value.y) : null));
// clockwise from magnetic north to the nose (x), y to its left, held level:
// north is where the field's level part points
const heading = computed(() => (b.value ? (Math.atan2(b.value.y, b.value.x) * DEG + 360) % 360 : null));
// the field's angle below level (z up): the dip
const dip = computed(() => (b.value ? Math.atan2(-b.value.z, level.value) * DEG : null));
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_auto]">
    <section :class="card">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="k in AXES" :key="k">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ k }}</p>
          <p class="font-mono text-3xl tabular-nums">{{ fmt(b?.[k]) }} <span class="text-base">µT</span></p>
        </div>
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">|B|, all three</p>
          <p class="font-mono text-3xl tabular-nums">{{ fmt(size) }} <span class="text-base">µT</span></p>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Earth's field is 25 to 65 µT over its surface. It isn't level: it dips into the ground, steeply near the poles, so held level the z axis reads a big share of it. Here the field dips {{ fmt(dip, 0) }}° below level{{ cal.calibrated ? '' : ' (before calibrating, the board\'s own field skews this)' }}.
      </p>
    </section>
    <section :class="[card, 'flex flex-col items-center']">
      <CompassRose :heading="heading" />
      <p class="text-xs text-slate-500 dark:text-slate-400">magnetic north, held level</p>
    </section>
  </div>

  <section :class="card">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 class="text-lg font-semibold">Calibrate</h2>
      <button v-if="!cal.calibrating" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="!running" @click="cal.start">{{ cal.calibrated ? 'Again' : 'Start' }}</button>
      <button v-else class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700" @click="cal.finish">Done</button>
      <button v-if="cal.calibrated" class="text-sm text-slate-500 underline dark:text-slate-400" @click="cal.clear">Clear</button>
      <span v-if="cal.calibrated" class="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">offset {{ fmt(cal.offset.x) }}, {{ fmt(cal.offset.y) }}, {{ fmt(cal.offset.z) }} µT</span>
    </div>
    <p class="mt-2 leading-relaxed">
      The board, its pins and anything steel nearby carry fields of their own, added to Earth's, the same whichever way it's turned: "hard iron". Press Start, turn the board slowly all the way round, flat, then on its edges and upside down, and press Done: each axis's middle, between the largest and smallest it read, is the board's own field, and it's taken off every reading from then on.
    </p>
    <table v-if="cal.calibrating && cal.span" class="mt-3 w-full max-w-xl text-left font-mono text-sm tabular-nums">
      <thead class="text-slate-500 dark:text-slate-400"><tr><th class="py-1 font-normal">axis</th><th class="font-normal">smallest</th><th class="font-normal">largest</th><th class="font-normal">middle</th></tr></thead>
      <tbody>
        <tr v-for="k in AXES" :key="k" class="border-t border-slate-200 dark:border-slate-700">
          <td class="py-1">{{ k }}</td><td>{{ fmt(cal.span.min[k]) }}</td><td>{{ fmt(cal.span.max[k]) }}</td><td>{{ fmt((cal.span.min[k] + cal.span.max[k]) / 2) }}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <CollapsibleCard id="what-the-chip-feels-three-ways" title="What the chip feels, three ways">
    <h2 class="mb-2 font-semibold">What the chip feels, three ways</h2>
    <VectorViews :x="b?.x ?? 0" :y="b?.y ?? 0" :z="b?.z ?? 0" unit="µT" :scale="SCALE_UT" :digits="1" :color="FIELD_COLOR" />
    <p class="mt-3 leading-relaxed">
      The field as an arrow, seen from three sides, the board (its outline) still, in its own axes as printed{{ cal.calibrated ? '' : ' (calibrate first: the board\'s own field shifts it)' }}. Lying level it points north and down into the ground: from above you see only its level part, pointing north; from the side, how steeply it dips. Turn the board and the arrow swings the other way on the screen, still pointing the same way in the room.
    </p>
  </CollapsibleCard>

  <CollapsibleCard id="the-board-against-the-field-the-field-he" title="The board against the field: the field held still">
    <h2 class="mb-2 font-semibold">The board against the field: the field held still</h2>
    <AttitudeViews :x="b?.x ?? 0" :y="b?.y ?? 0" :z="b?.z ?? -1" field="magnetic" />
    <p class="mt-3 leading-relaxed">
      As with gravity for an accelerometer, but the field line held still instead, drawn down the page, and the board turned against it. The side views show how the board's nose and side tilt against the field; along the field line, a turn about it can't be seen, just as an accelerometer can't see a turn about the vertical. The field line isn't vertical (it dips into the ground at an angle) and the two together, gravity and the field, are what fix every turn: that's a tilt-compensated compass.
    </p>
  </CollapsibleCard>

  <CollapsibleCard id="magnetic-field" title="Magnetic field">
    <LiveChart title="Magnetic field" unit="µT" :series="SERIES" :values="b ? [b.x, b.y, b.z] : []" :source="cal.source" :window-ms="windowMs" :floor="FLOOR_UT" :digits="1" />
  </CollapsibleCard>
</template>
