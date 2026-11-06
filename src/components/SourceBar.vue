<script setup>
// A physics page's connect bar: connect and scan, the sensor found (choose
// one when there are several), a failure if any, and a note naming the
// chips it looks for, each linked to its page (its wiring is there).
// src: a useSource() (reactive).
import { hasWebUsb, hex } from '../lib/dongle.js';

defineProps({ src: { type: Object, required: true } });
const link = 'text-emerald-700 underline dark:text-emerald-400';
// "a", "a or b", "a, b or c"
const sep = (i, n) => (i === 0 ? '' : i === n - 1 ? ' or ' : ', ');
</script>

<template>
  <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
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
    <div v-if="src.failure" class="w-full rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ src.failure.title }}</p>
      <p v-if="src.failure.detail" class="mt-1">{{ src.failure.detail }}</p>
      <p v-if="src.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ src.failure.error }}</p>
    </div>
  </div>
  <p class="text-sm text-slate-500 dark:text-slate-400">
    It looks for any {{ src.noun }} this site knows on the dongle's bus:
    <template v-for="(c, i) in src.chips" :key="c.name">{{ sep(i, src.chips.length) }}<RouterLink :to="c.to" :class="link">{{ c.name }}</RouterLink></template>
    (each one's page shows its wiring), and reads it 50 times a second.
  </p>
</template>
