<script setup>
// The SPL06 live on the bridge: air pressure and temperature, its
// datasheet's three use cases to pick, how it's read, its settings; the
// purple CJMCU board's wiring (from the user's photo)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useSpl06, MODES } from '../lib/useSpl06.js';

const WINDOW_MS = 120000;
const PRESSURE_SPAN_HPA = 0.1; // the chart's least span: 10 Pa, about a metre of height
const TEMPERATURE_SPAN_C = 0.5;
const PRESSURE = [{ label: 'pressure', color: '--series-1' }];
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }];
// its settings, from Goertek's datasheet (SPL06-001, Version 7.0), and the ones this page uses
const SPECS = [
  ['Range', '300 to 1100 hPa (from about 9 km up to 700 m below sea level, in the standard atmosphere), -40 to 85 °C', 'all of it'],
  ['Accuracy', 'absolute ±1 hPa; relative ±0.06 hPa between 950 and 1050 hPa (±0.5 m); temperature ±0.5 °C', 'as it comes'],
  ['Precision', '5 Pa down to 0.5 Pa RMS by oversampling (1 to 128 times), 3.6 to 207 ms a measurement', 'its three use cases, picked above'],
  ['Rate', '1 to 128 measurements a second, in the background or one at a time', '1, 2 or 4 a second, in the background'],
  ['Address', '0x77, or 0x76 with SDO to GND', '0x77 or 0x76, whichever answers'],
  ['Interface', 'I2C up to 3.4 MHz, or SPI', 'I2C, 400 kHz'],
  ['Supply', '1.7 to 3.6 V (4 V at most)', '3.3 V'],
  ['Extras', 'a 32-reading FIFO, an interrupt on SDO', 'none'],
];

const p = reactive(useSpl06({ windowMs: WINDOW_MS }));
const r = computed(() => p.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">SPL06</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Goertek's barometric pressure sensor: the weight of the air above it, fine enough to notice the board lifted by a few centimetres, and the temperature. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-spl06.svg" alt="A CH341T bridge wired to a purple SPL06 module: VCC (3.3 V) to VCC, GND to GND, SCL to SCK, SDA to SDI; CSB and SDO free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The purple CJMCU board: VCC, GND, then SCK and SDI, the SPI names of I2C's SCL and SDA; CSB and SDO stay free (SDO left high: 0x77). <b>3.3 V only</b>: the board has no regulator and the chip takes 3.6 V at most. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @click="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <label :class="field">Mode
        <select :value="p.mode" :class="select" @change="p.setMode($event.target.value)">
          <option v-for="[m, label] in MODES" :key="m" :value="m">{{ label }}</option>
        </select>
      </label>
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(p.address) }}</span>
      <span v-if="p.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${p.failed.count} of ${p.failed.of} readings didn't come through and were skipped; the last: ${p.failed.last}`">· {{ p.failed.count }} {{ p.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Air pressure</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r ? r.pressure / 100 : null, 2) }} <span class="text-base">hPa</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.temperature, 2) }} <span class="text-base">°C</span></p>
      </section>
    </div>

    <CollapsibleCard id="pressure" title="Air pressure">
      <LiveChart title="Air pressure" unit="hPa" :series="PRESSURE" :values="r ? [r.pressure / 100] : []" :source="p.pressureSource" :window-ms="WINDOW_MS" :floor="PRESSURE_SPAN_HPA" :digits="2" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Lift the board from the desk to above your head, and back: near sea level the air pressure falls by about 12 Pa (0.12 hPa) for every metre up, enough to see in the sports mode. Why, and height from it: <RouterLink to="/physics/pressure" :class="link">Air pressure and height</RouterLink>.
      </p>
    </CollapsibleCard>
    <CollapsibleCard id="temperature" title="Temperature">
      <LiveChart title="Temperature" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature] : []" :source="p.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="2" fit />
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        Inside is a tiny MEMS membrane: the air outside pushes on it, and its bending is measured as a change in capacitance (its datasheet: a capacitive sensing principle), with a temperature sensor in the same element. atiic knows the chip by its ID (0x10 in register 0Dh), resets it and reads its 18 bytes of factory calibration: nine coefficients, each its own size (12, 20 or 16 bits).
      </p>
      <p class="mb-2">
        Then it measures by itself in the background, at one of the three use cases its datasheet gives: <b>weather</b> (2 times oversampled, once a second, 5 Pa), <b>indoor</b> (16 times, twice a second, 1.2 Pa) or <b>sports</b> (64 times, 4 a second, 0.5 Pa). More oversampling averages away more noise, and takes longer. Each result, 24 bits for pressure and for temperature, goes through the datasheet's formula with those coefficients, a polynomial in both, into pascals and degrees.
      </p>
      <p>
        <b>Changing the mode:</b> a measurement already running finishes under the old one, and read with the new mode's scale it came out 190 hPa wrong (833 hPa among 1020s). atiic now waits it out and clears it before starting again.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.goertek.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">Goertek</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
