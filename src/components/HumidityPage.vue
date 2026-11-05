<script setup>
// A humidity sensor's page: its drawing, connect, temperature, relative
// humidity and the dew point as tiles and charts, what the numbers mean;
// the sensor's own intro (slot intro) and how it measures (slot measures)
import { reactive, computed } from 'vue';
import LiveChart from './LiveChart.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useHumidity } from '../lib/humidity.js';

const props = defineProps({
  driver: { type: Function, required: true },
  drawing: { type: String, required: true },
  drawingAlt: { type: String, required: true },
  drawingCaption: { type: String, required: true },
  responseS: { type: Number, required: true }, // its humidity response time, 63 %
});

const WINDOW_MS = 120000; // two minutes: the air changes slowly
const TEMPERATURE_SPAN_C = 1;
const HUMIDITY_SPAN = 4;
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }, { label: 'dew point', color: '--series-1' }];
const HUMIDITY = [{ label: 'humidity', color: '--series-3' }];

const s = reactive(useHumidity(props.driver, { windowMs: WINDOW_MS }));
const name = props.driver.chip.name;
const r = computed(() => s.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ name }}</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        <slot name="intro" />
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <img :src="drawing" :alt="drawingAlt" class="w-full rounded-lg bg-white dark:bg-transparent lg:w-3/5">
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ drawingCaption }}</figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="s.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="s.state === 'connecting'" @click="s.connect">
        {{ s.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="s.disconnect">Stop</button>
      <span v-if="s.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(s.address) }} · a reading every {{ s.readMs / 1000 }} s</span>
    </section>
    <div v-if="s.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ s.failure.title }}</p>
      <p v-if="s.failure.detail" class="mt-1">{{ s.failure.detail }}</p>
      <p v-if="s.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ s.failure.error }}</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.temperature, 2) }} <span class="text-base">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Relative humidity</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.humidity, 1) }} <span class="text-base">%</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Dew point</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.dewPoint, 1) }} <span class="text-base">°C</span></p>
      </section>
    </div>

    <section :class="card">
      <LiveChart title="Temperature and dew point" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature, r.dewPoint] : []" :source="s.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="2" fit />
    </section>
    <section :class="card">
      <LiveChart title="Relative humidity" unit="%" :series="HUMIDITY" :values="r ? [r.humidity] : []" :source="s.humiditySource" :window-ms="WINDOW_MS" :floor="HUMIDITY_SPAN" :digits="1" fit />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What the numbers mean</h2>
      <p class="mb-2">
        <b>Relative humidity</b> is how much water vapour the air holds, against the most it could hold at its temperature. Warm air holds more: the same moisture reads lower as the air warms. Breathe near the sensor and watch it jump; then it comes back down, over seconds (its response time is about {{ responseS }} s).
      </p>
      <p class="mb-2">
        <b>The dew point</b> is the temperature the air would have to cool to before that moisture condenses: a cold glass sweats when it's below the dew point. Unlike relative humidity, it stays put when the room just warms or cools, so it tells how much water is in the air.
        Worked out here from the two readings with the Magnus formula (over water: β = 17.62, λ = 243.12 °C, as Sensirion's SHT20 datasheet gives them):
        <span class="font-mono">{{ r ? `${fmt(r.temperature, 2)} °C, ${fmt(r.humidity, 1)} % → ${fmt(r.dewPoint, 1)} °C` : '—' }}</span>.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <slot name="measures" :read-ms="s.readMs" />
    </section>
  </main>
</template>
