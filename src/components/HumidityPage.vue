<script setup>
// A humidity sensor's page: its drawing, connect, temperature and relative
// humidity as tiles and charts (the dew point: the physics page), what the
// numbers mean;
// the sensor's own intro (slot intro) and how it measures (slot measures)
import LiveSettings from './LiveSettings.vue';
import CollapsibleCard from './CollapsibleCard.vue';
import ConnectButton from './ConnectButton.vue';
import StopButton from './StopButton.vue';
import SvgDrawing from './SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from './LiveChart.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useHumidity } from '../lib/humidity.js';

const props = defineProps({
  driver: { type: Function, required: true },
  drawing: { type: String, default: null }, // none yet: the caption alone
  drawingAlt: { type: String, default: '' },
  drawingCaption: { type: String, required: true },
  // more boards the same chip family comes on: [{ src, alt, caption }], each drawn after the first
  moreDrawings: { type: Array, default: () => [] },
  responseS: { type: Number, required: true }, // its humidity response time, 63 %
  resolution: { type: String, default: null }, // the first, for a driver with RESOLUTIONS
});

const WINDOW_MS = 120000; // two minutes: the air changes slowly
const TEMPERATURE_SPAN_C = 1;
const HUMIDITY_SPAN = 4;
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }];
const HUMIDITY = [{ label: 'humidity', color: '--series-3' }];

const s = reactive(useHumidity(props.driver, { windowMs: WINDOW_MS, resolution: props.resolution }));
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
// 'RH/T' bits, as a person reads them
const label = (r) => { const [rh, t] = r.split('/'); return `RH ${rh} bit, T ${t} bit`; };
const name = props.driver.chip.name;
const r = computed(() => s.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ name }}</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        <slot name="intro" />
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing v-if="drawing" :src="drawing" :alt="drawingAlt" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ drawingCaption }} New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.</figcaption>
      <template v-for="d in moreDrawings" :key="d.src">
        <SvgDrawing :src="d.src" :alt="d.alt" class="mx-auto mt-6 w-full lg:w-3/5" />
        <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ d.caption }}</figcaption>
      </template>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="s.state !== 'running'" :busy="s.state === 'connecting'" @click="s.connect">{{ s.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="s.disconnect" />
      <label v-if="s.resolutions.length" :class="field">Resolution
        <select :value="s.resolution" :class="select" @change="s.setResolution($event.target.value)">
          <option v-for="res in s.resolutions" :key="res" :value="res">{{ label(res) }}</option>
        </select>
      </label>
      <label v-if="s.repeatabilities.length" :class="field">Repeatability
        <select :value="s.repeatability" :class="select" @change="s.setRepeatability($event.target.value)">
          <option v-for="rep in s.repeatabilities" :key="rep" :value="rep">{{ rep }}</option>
        </select>
      </label>
      <span v-if="s.state === 'running'" class=" font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(s.address) }} · a reading every {{ s.readMs / 1000 }} s{{ s.hold ? ' · hold master' : '' }}</span>
      <span v-if="s.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${s.failed.count} of ${s.failed.of} readings didn't come through and were skipped; the last: ${s.failed.last}`">· {{ s.failed.count }} {{ s.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="s.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ s.failure.title }}</p>
      <p v-if="s.failure.detail" class="mt-1">{{ s.failure.detail }}</p>
      <p v-if="s.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ s.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.temperature, 2) }} <span class="text-base">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Relative humidity</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.humidity, 1) }} <span class="text-base">%</span></p>
      </section>
    </div>

    <CollapsibleCard id="temperature" title="Temperature">
      <LiveChart title="Temperature" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature] : []" :source="s.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="2" fit />
    </CollapsibleCard>
    <CollapsibleCard id="relative-humidity" title="Relative humidity">
      <LiveChart title="Relative humidity" unit="%" :series="HUMIDITY" :values="r ? [r.humidity] : []" :source="s.humiditySource" :window-ms="WINDOW_MS" :floor="HUMIDITY_SPAN" :digits="1" fit />
    </CollapsibleCard>

    <CollapsibleCard id="what-the-numbers-mean" title="What the numbers mean" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">What the numbers mean</h2>
      <p class="mb-2">
        <b>Relative humidity</b> is how much water vapour the air holds, against the most it could hold at its temperature. Warm air holds more: the same moisture reads lower as the air warms. Breathe near the sensor and watch it jump; then it comes back down, over seconds (its response time is about {{ responseS }} s).
      </p>
      <p>
        <b>From the two:</b> how much water the air really holds, and the dew point, the temperature where it would condense, worked out live on <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>, with how a chip like this measures them.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <slot name="measures" :read-ms="s.readMs" :hold="s.hold" :resolution="s.resolution" />
    </CollapsibleCard>
  </main>
</template>
