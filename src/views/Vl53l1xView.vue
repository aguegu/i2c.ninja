<script setup>
// The VL53L1X live on the CH341 dongle: the distance to what it faces, a
// gauge, the readings in time, each one's status, and how light measures it
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { useVl53l1x, STATUS } from '../lib/useVl53l1x.js';

const WINDOW_MS = 15000;
const GAUGE_MM = 4000; // long distance mode's reach, in the dark (ST's ULD)
const DISTANCE_SPAN_MM = 50;
const SERIES = [{ label: 'distance', color: '--series-1' }];
const LIGHT_MM_PER_NS = 299.792458; // the speed of light
const TICKS = [0, 1000, 2000, 3000, 4000];

const tof = reactive(useVl53l1x({ windowMs: WINDOW_MS }));
const r = computed(() => tof.latest);
const gauge = computed(() => (r.value?.valid ? Math.min(1, r.value.distance / GAUGE_MM) : null));
// the light's round trip to the target and back
const roundTripNs = computed(() => (r.value?.valid ? (2 * r.value.distance) / LIGHT_MM_PER_NS : null));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">VL53L1X</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        ST's time-of-flight distance sensor: it times light to whatever it faces and back, and turns the time into millimetres, up to about 4 m. Live over the CH341 dongle.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <img src="/setup-vl53l1x.svg" alt="A CH341T dongle wired to a purple VL53L1X module: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; GPIO1 and XSHUT free" class="w-full rounded-lg bg-white lg:w-3/5">
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The common purple board ("VL53L0/1XV2"): four wires from its VIN, GND, SCL, SDA; GPIO1 and XSHUT stay free. Its window faces away from the pins.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="tof.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="tof.state === 'connecting'" @click="tof.connect">
        {{ tof.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="tof.disconnect">Stop</button>
      <span v-if="tof.state === 'running'" class="ml-auto font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">0x29 · {{ tof.rate.toFixed(1) }} readings/s</span>
    </section>
    <div v-if="tof.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ tof.failure.title }}</p>
      <p v-if="tof.failure.detail" class="mt-1">{{ tof.failure.detail }}</p>
      <p v-if="tof.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ tof.failure.error }}</p>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="font-mono text-5xl tabular-nums">{{ r?.valid ? r.distance : '—' }} <span class="text-xl">mm</span></p>
        <p class="text-sm" :class="r && !r.valid ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'">
          {{ r ? (STATUS[r.status] ?? `status ${r.status}`) : 'not connected' }}
        </p>
      </div>
      <div class="relative mt-4 h-6 rounded-full bg-slate-100 dark:bg-slate-700">
        <div v-if="gauge !== null" class="absolute inset-y-0 left-0 rounded-full bg-emerald-600 transition-[width] duration-100" :style="{ width: `${gauge * 100}%` }" />
      </div>
      <div class="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
        <span v-for="t in TICKS" :key="t">{{ t / 1000 }} m</span>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Wave a hand over it, or point it at a wall and walk back. {{ tof.span.min !== null ? `Seen so far: ${tof.span.min}-${tof.span.max} mm.` : '' }}
      </p>
    </section>

    <section :class="card">
      <LiveChart title="Distance" unit="mm" :series="SERIES" :values="r?.valid ? [r.distance] : []" :source="tof.source" :window-ms="WINDOW_MS" :floor="DISTANCE_SPAN_MM" :digits="0" fit />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <img src="/time-of-flight.svg" alt="Time of flight: the sensor sends a pulse of light to a wall and its detector catches the weaker echo a time Δt later; the distance d is the speed of light times Δt, halved; 1 m away the echo comes back after 6.67 ns" class="mx-auto mb-3 w-full max-w-xl rounded-lg bg-white">
      <p class="mb-2">
        <b>Time of flight.</b> It sends out pulses of light and times how long they take to bounce back. Light goes about 300 mm a nanosecond, so the times are tiny:
        <span class="font-mono">{{ roundTripNs !== null ? `${r.distance} mm there and back is ${roundTripNs.toFixed(2)} ns` : 'a metre there and back is under 7 ns' }}</span>.
        No stopwatch is that fast for one pulse: it gathers the echoes of many pulses over a reading and works the distance out from when they arrive.
      </p>
      <p class="mb-2">
        <b>A reading takes about 100 ms</b>, its timing budget: longer gathers more photons, so reaches farther and is steadier. In its long distance mode (the one used here) it reaches up to 4 m in the dark; bright light and dark, matt targets cut that down. Short mode gives up range (1.3 m) for better immunity to ambient light.
      </p>
      <p class="mb-2">
        <b>Each reading comes with a status.</b> Valid, or why not: too uncertain, too little light back (a far or dark target, or nothing at all), or past its range. The gauge and the chart show the valid ones only.
      </p>
      <p>
        <b>Under the hood,</b> ST publishes no register map for it, only their "Ultra Lite Driver": atiic follows it, loading its 91 bytes of default configuration and reading two result registers.
      </p>
    </section>
  </main>
</template>
