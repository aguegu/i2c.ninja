<script setup>
// The MLX90614 live on the CH341 dongle: what it's pointed at, its own
// temperature, and how a thermometer reads heat without touching
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { useMlx90614 } from '../lib/useMlx90614.js';

const WINDOW_MS = 30000;
const SPAN_C = 2;
const fmt = (v) => (v === undefined || v === null ? '—' : v.toFixed(2));

const mlx = reactive(useMlx90614({ windowMs: WINDOW_MS }));
const r = computed(() => mlx.latest);
const series = [
  { label: 'object', color: '--series-2' },
  { label: 'ambient (itself)', color: '--series-1' },
];
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">MLX90614</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        Melexis' infrared thermometer: the temperature of whatever it's pointed at, without touching it, the way a forehead or kitchen thermometer gun works, and its own temperature beside it. Live over the CH341 dongle.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-mlx90614.svg" alt="A CH341T dongle wired to a blue MLX90614 module with a black tube over its sensor: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA, all crossing" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The blue board with the sensor under a black tube: its VIN, GND, SCL, SDA run opposite the dongle's, so the four wires cross. Point the tube at what to measure.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="mlx.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="mlx.state === 'connecting'" @click="mlx.connect">
        {{ mlx.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="mlx.disconnect">Stop</button>
      <span v-if="mlx.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">0x5A · SMBus 100 kHz</span>
    </section>
    <div v-if="mlx.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ mlx.failure.title }}</p>
      <p v-if="mlx.failure.detail" class="mt-1">{{ mlx.failure.detail }}</p>
      <p v-if="mlx.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ mlx.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">What it's pointed at</p>
        <p class="font-mono text-4xl tabular-nums">{{ fmt(r?.object) }} <span class="text-lg">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Itself (ambient)</p>
        <p class="font-mono text-4xl tabular-nums">{{ fmt(r?.ambient) }} <span class="text-lg">°C</span></p>
      </section>
    </div>

    <section :class="card">
      <LiveChart title="Temperature" unit="°C" :series="series" :values="r ? [r.object, r.ambient] : []" :source="mlx.source" :window-ms="WINDOW_MS" :floor="SPAN_C" :digits="2" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Point it at your hand, a cup of hot tea, a cold drink, a window: the object line moves at once, its own barely.</p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it reads heat without touching</h2>
      <p class="mb-2">
        <b>Everything warm glows,</b> in infrared, invisible to us: the warmer, the brighter. The sensor is a thermopile, a stack of tiny junctions that warm up a little in that glow; their voltage says how much infrared comes in. Its chip compares that with its own temperature (the second reading) and works out the object's.
      </p>
      <p class="mb-2">
        <b>It sees an area, not a point.</b> The reading is the average over everything in its field of view, a cone that widens with distance: close up a cup fills it and it reads the cup; far away the cup is a small part of it and it reads mostly the room. The tube shades it from light coming in at an angle.
      </p>
      <SvgDrawing src="/mlx90614-view.svg" alt="Close up, a hot cup fills the sensor's cone-shaped field of view and it reads the cup; far away the cup is a small part of the cone and it reads mostly the room" class="mx-auto mb-3 w-full max-w-xl" />
      <p class="mb-2">
        <b>Shiny things read wrong.</b> It's calibrated for an emissivity of 1, a surface that glows like a perfect black body: skin, water, paint, most matt things come close. A shiny metal glows little and mirrors the room instead: point it at a spoon or foil, and it reads the room. The emissivity it assumes can be set from 0.1 to 1.0.
      </p>
      <p>
        <b>The numbers:</b> objects from −70 to +380 °C, itself from −40 to +125 °C, in steps of 0.02 °C, accurate to ±0.5 °C between 0 and 50 °C. Each reading comes back with a checksum (a PEC), which atiic checks; its bus runs at 100 kHz at most.
      </p>
    </section>
  </main>
</template>
