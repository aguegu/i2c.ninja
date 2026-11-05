<script setup>
// The SHT20 live on the CH341 dongle: temperature and relative humidity, the
// dew point worked out from them, and what each number means
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { useSht20 } from '../lib/useSht20.js';

const WINDOW_MS = 120000; // two minutes: the air changes slowly
const TEMPERATURE_SPAN_C = 1;
const HUMIDITY_SPAN = 4;
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }, { label: 'dew point', color: '--series-1' }];
const HUMIDITY = [{ label: 'humidity', color: '--series-3' }];

const sht = reactive(useSht20({ windowMs: WINDOW_MS }));
const r = computed(() => sht.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">SHT20</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        Sensirion's humidity and temperature sensor: how warm the air is, how much of the moisture it could hold it holds, and from the two, the dew point. Live over the CH341 dongle.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <img src="/setup-sht20.svg" alt="A CH341T dongle wired to a small green SHT20 module: SDA to sda and SCL to scl, crossing, GND to gnd, VCC (3.3 V) to vcc" class="w-full rounded-lg bg-white lg:w-3/5">
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The small green SHT20 board: its header runs scl, sda, gnd, vcc, so the SDA and SCL wires cross. Keep it away from warm parts.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="sht.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="sht.state === 'connecting'" @click="sht.connect">
        {{ sht.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="sht.disconnect">Stop</button>
      <span v-if="sht.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">0x40 · a reading every {{ sht.readMs / 1000 }} s</span>
    </section>
    <div v-if="sht.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ sht.failure.title }}</p>
      <p v-if="sht.failure.detail" class="mt-1">{{ sht.failure.detail }}</p>
      <p v-if="sht.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ sht.failure.error }}</p>
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
      <LiveChart title="Temperature and dew point" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature, r.dewPoint] : []" :source="sht.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="2" fit />
    </section>
    <section :class="card">
      <LiveChart title="Relative humidity" unit="%" :series="HUMIDITY" :values="r ? [r.humidity] : []" :source="sht.humiditySource" :window-ms="WINDOW_MS" :floor="HUMIDITY_SPAN" :digits="1" fit />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What the numbers mean</h2>
      <p class="mb-2">
        <b>Relative humidity</b> is how much water vapour the air holds, against the most it could hold at its temperature. Warm air holds more: the same moisture reads lower as the air warms. Breathe near the sensor and watch it jump; then it comes back down, over seconds (its response time is about 8 s).
      </p>
      <p class="mb-2">
        <b>The dew point</b> is the temperature the air would have to cool to before that moisture condenses: a cold glass sweats when it's below the dew point. Unlike relative humidity, it stays put when the room just warms or cools, so it tells how much water is in the air.
        Worked out here from the two readings with the Magnus formula and the coefficients Sensirion's datasheet gives (over water: β = 17.62, λ = 243.12 °C):
        <span class="font-mono">{{ r ? `${fmt(r.temperature, 2)} °C, ${fmt(r.humidity, 1)} % → ${fmt(r.dewPoint, 1)} °C` : '—' }}</span>.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        Inside, a tiny capacitor whose dielectric takes up water vapour: its capacitance follows the humidity. A band-gap sensor beside it gives the temperature. The chip turns both into numbers: humidity in 12 bits (steps of 0.04 %RH), temperature in 14 bits (0.01 °C).
        Fine steps are not accuracy: typically ±3 %RH and ±0.3 °C, so two sensors side by side may read a few percent apart.
      </p>
      <p class="mb-2">
        Each reading is a command (temperature 0xF3, humidity 0xF5), a wait while it measures (up to 85 ms and 29 ms), and three bytes back: the value and a CRC checksum, which atiic checks.
        Then <span class="font-mono">T = −46.85 + 175.72 × S / 2¹⁶</span> and <span class="font-mono">RH = −6 + 125 × S / 2¹⁶</span>.
      </p>
      <p>
        <b>Why every {{ sht.readMs / 1000 }} seconds:</b> measuring warms the sensor. Sensirion asks it be active no more than 10% of the time to stay within 0.1 °C; a pair of readings keeps it busy about 115 ms.
      </p>
    </section>
  </main>
</template>
