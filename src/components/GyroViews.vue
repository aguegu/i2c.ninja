<script setup>
// A gyro's reading, every way the site shows one: the rates (about x, y,
// z) with Zero for the bias, the gyro ball beside them, the turn added up
// (three flat views, Reset), and the chart. A page brings the reading
// ({ x, y, z } deg/s, or null), the chart's buffers (source()) and a
// useTurned() (reactive) fed by its readings; running enables the buttons.
// tiles=false leaves out the rates and the ball, chart=false the chart.
import CollapsibleCard from './CollapsibleCard.vue';
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import GyroBall from './GyroBall.vue';
import TurnViews from './TurnViews.vue';
import HintNote from './HintNote.vue';

const props = defineProps({
  g: { type: Object, default: null }, // { x, y, z } deg/s
  turned: { type: Object, required: true }, // useTurned(), reactive
  source: { type: Function, default: null },
  running: { type: Boolean, default: false },
  windowMs: { type: Number, default: 10000 },
  tiles: { type: Boolean, default: true },
  chart: { type: Boolean, default: true },
});

const FLOOR_DPS = 10; // the chart's least half-range: the noise at rest stays small
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
// the rates with the bias taken off, for the ball
const rates = computed(() => (props.g ? AXES.map((k) => props.g[k] - props.turned.bias[k]) : [0, 0, 0]));
const phases = computed(() => AXES.map((k) => props.turned.angles[k]));
const fmt = (n, d = 1) => (n === undefined || n === null ? '—' : n.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <div v-if="tiles" class="grid gap-4 md:grid-cols-[1fr_auto]">
    <section :class="[card, 'flex flex-col']">
      <div class="grid grid-cols-3 gap-4">
        <div v-for="k in AXES" :key="k">
          <p class="text-sm text-slate-500 dark:text-slate-400">about {{ k }}</p>
          <p class="font-mono text-3xl tabular-nums">{{ fmt(g?.[k]) }} <span class="text-base">°/s</span></p>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button :class="button" :disabled="!running || turned.zeroing" @click="turned.zero">{{ turned.zeroing ? 'Hold still…' : 'Zero' }}</button>
        <span v-if="turned.zeroed" class="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">bias {{ fmt(turned.bias.x, 2) }}, {{ fmt(turned.bias.y, 2) }}, {{ fmt(turned.bias.z, 2) }} °/s</span>
      </div>
      <HintNote class="mt-auto pt-3">Held still a gyro should read 0 on every axis, but each has a small offset of its own, its zero-rate bias. Hold it still and press Zero: two seconds' average is taken off from then on.</HintNote>
    </section>
    <section :class="[card, 'flex flex-col items-center']">
      <GyroBall :rates="rates" :phases="phases" />
      <p class="text-xs text-slate-500 dark:text-slate-400">rings turn as the board does; the arrow: its spin axis</p>
    </section>
  </div>

  <section :class="card">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 class="text-lg font-semibold">Turned so far</h2>
      <button v-if="!tiles" :class="button" :disabled="!running || turned.zeroing" @click="turned.zero">{{ turned.zeroing ? 'Hold still…' : 'Zero' }}</button>
      <button :class="button" :disabled="!running" @click="turned.reset">Reset</button>
    </div>
    <div class="mt-3">
      <TurnViews :angles="turned.angles" />
    </div>
    <p class="mt-3 leading-relaxed">
      A gyro tells how fast, not where: add up each reading times the time since the last, and you get how far it has turned, here about each axis on its own, drawn from three sides. Press Reset, turn the board a quarter turn about z and back, and watch. Then leave it still: the angles creep, because every leftover bit of bias is added up too, second after second. That drift is why a gyro alone can't keep its heading, and why it's paired with an accelerometer (for which way is down) and a compass (for north). (Each axis added up alone is right for one turn at a time; mixed turns need them added up together, as q does on <RouterLink to="/algorithms/attitude" class="text-emerald-700 underline dark:text-emerald-400">Attitude from accel and gyro</RouterLink>.)
    </p>
  </section>

  <CollapsibleCard v-if="chart && source" id="turning-rate" title="Turning rate">
    <LiveChart title="Turning rate" unit="°/s" :series="SERIES" :values="g ? [g.x, g.y, g.z] : []" :source="source" :window-ms="windowMs" :floor="FLOOR_DPS" :digits="1" />
  </CollapsibleCard>
</template>
