<script setup>
// A page's connect bar: connect and scan, the sensor found for each
// quantity (choose one when there are several), a failure if any, and a
// note naming the chips it looks for, each linked to its page (its wiring
// is there). src: a useSources() or useSource() (reactive).
import { hasWebUsb, hex } from '../lib/dongle.js';

defineProps({ src: { type: Object, required: true } });
const link = 'text-emerald-700 underline dark:text-emerald-400';
// "a", "a or b", "a, b or c"
const sep = (i, n) => (i === 0 ? '' : i === n - 1 ? ' or ' : ', ');
const cap = (w) => w[0].toUpperCase() + w.slice(1);
// "It looks for any accelerometer this site knows on the dongle's bus: A, B
// or C, and any gyroscope ...: D (each ...), and reads it ...", as text and links
const note = (parts) => [
  { text: 'It looks for ' },
  ...parts.flatMap((p, j) => [
    { text: `${j === 0 ? '' : ', and '}any ${p.noun} this site knows${j === 0 ? ' on the dongle\'s bus' : ''}: ` },
    ...p.chips.flatMap((c, i) => [{ text: sep(i, p.chips.length) }, { text: c.name, to: c.to }]),
  ]),
  { text: ` (each one's page shows its wiring), and reads ${parts.length > 1 ? 'them' : 'it'} ` },
];
</script>

<template>
  <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
    <h2 class="text-lg font-semibold">Live</h2>
    <template v-if="hasWebUsb">
      <button v-if="src.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50" :disabled="src.state === 'connecting'" @click="src.connect">
        {{ src.state === 'connecting' ? 'Looking…' : 'Connect and find a sensor' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="src.disconnect">Stop</button>
      <template v-if="src.state === 'running'">
        <template v-for="p in src.parts" :key="p.key">
          <label v-if="src.found[p.key].length > 1" class="flex items-center gap-2 text-sm">{{ src.parts.length > 1 ? cap(p.noun) : 'Sensor' }}
            <select :value="src.chosen[p.key]" class="rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800" @change="src.choose(p.key, Number($event.target.value))">
              <option v-for="(f, i) in src.found[p.key]" :key="f.address" :value="i">{{ f.name }} at {{ hex(f.address) }}</option>
            </select>
          </label>
          <span v-else-if="src.found[p.key].length === 1" class="font-mono text-sm text-slate-500 dark:text-slate-400"><template v-if="src.parts.length > 1">{{ p.noun }}: </template>{{ src.found[p.key][0].name }} at {{ hex(src.found[p.key][0].address) }}</span>
        </template>
      </template>
    </template>
    <span v-else class="text-sm text-amber-700 dark:text-amber-400">This browser has no WebUSB: open the page in Chrome, Edge or another Chromium.</span>
    <div v-if="src.failure" class="w-full rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ src.failure.title }}</p>
      <p v-if="src.failure.detail" class="mt-1">{{ src.failure.detail }}</p>
      <p v-if="src.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ src.failure.error }}</p>
    </div>
  </div>
  <p class="text-sm text-slate-500 dark:text-slate-400">
    <template v-for="(seg, i) in note(src.parts)" :key="i"><RouterLink v-if="seg.to" :to="seg.to" :class="link">{{ seg.text }}</RouterLink><template v-else>{{ seg.text }}</template></template>{{ src.rate }} times a second.
  </p>
</template>
