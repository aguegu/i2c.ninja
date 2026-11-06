<script setup>
// A physics page's live card: connect, the sensors found on the bus for its
// quantity (choose one when there are several), x, y, z and their size,
// and the chart. src: a useSource() (reactive). Extra readings in the slot.
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';

const props = defineProps({
  src: { type: Object, required: true },
  title: { type: String, required: true }, // the chart's
  floor: { type: Number, default: 1 },
  digits: { type: Number, default: 3 },
  chart: { type: Boolean, default: true }, // false: the page charts it in a card of its own
});

const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
const v = computed(() => props.src.latest);
const size = computed(() => (v.value ? Math.hypot(...v.value) : null));
const fmt = (n) => (n === undefined || n === null ? '—' : n.toFixed(props.digits));
</script>

<template>
  <section class="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h2 class="text-lg font-semibold">Live</h2>
      <template v-if="hasWebUsb">
        <button v-if="src.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50" :disabled="src.state === 'connecting'" @click="src.connect">
          {{ src.state === 'connecting' ? 'Looking…' : 'Connect and find a sensor' }}
        </button>
        <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="src.disconnect">Stop</button>
        <label v-if="src.found.length > 1 && src.state === 'running'" class="flex items-center gap-2 text-sm">Sensor
          <select :value="src.chosen" class="rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800" @change="src.choose(Number($event.target.value))">
            <option v-for="(f, i) in src.found" :key="f.address" :value="i">{{ f.name }} at {{ hex(f.address) }}</option>
          </select>
        </label>
        <span v-else-if="src.found.length === 1 && src.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ src.found[0].name }} at {{ hex(src.found[0].address) }}</span>
      </template>
      <span v-else class="text-sm text-amber-700 dark:text-amber-400">This browser has no WebUSB: open the page in Chrome, Edge or another Chromium.</span>
    </div>
    <div v-if="src.failure" class="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ src.failure.title }}</p>
      <p v-if="src.failure.detail" class="mt-1">{{ src.failure.detail }}</p>
      <p v-if="src.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ src.failure.error }}</p>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div v-for="(k, i) in AXES" :key="k">
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ k }}</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(v?.[i]) }} <span class="text-sm">{{ src.unit }}</span></p>
      </div>
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">size, all three</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(size) }} <span class="text-sm">{{ src.unit }}</span></p>
      </div>
    </div>
    <!-- the slot (a note, more readings) at the card's foot when the card is taller than its content -->
    <div class="mt-auto">
      <slot :v="v" :size="size" />
    </div>
    <div v-if="chart" class="mt-3">
      <LiveChart :title="title" :unit="src.unit" :series="SERIES" :values="v ?? []" :source="src.source" :window-ms="10000" :floor="floor" :digits="digits" />
    </div>
  </section>
</template>
