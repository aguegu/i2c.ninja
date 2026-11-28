<script setup>
// The BMP280 live on the bridge: air pressure and temperature, its
// datasheet's five oversampling settings to pick, how it's read, its
// settings; the purple GY-BMP280 board's wiring (from the user's photo)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import { canConnect, hex } from '../lib/dongle.js';
import { useBmp280, SETTINGS } from '../lib/useBmp280.js';

const WINDOW_MS = 120000;
const PRESSURE_SPAN_HPA = 0.1; // the chart's least span: 10 Pa, about a metre of height
const TEMPERATURE_SPAN_C = 0.5;
const PRESSURE = [{ label: 'pressure', color: '--series-1' }];
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }];
// its settings, from Bosch's datasheet (BST-BMP280-DS001, revision 1.26), and the ones this page uses
const SPECS = [
  ['Range', '300 to 1100 hPa (from about 9 km up to 500 m below sea level), -40 to 85 °C', 'all of it'],
  ['Accuracy', 'absolute ±1 hPa (0 to 65 °C); relative ±0.12 hPa between 700 and 900 hPa (±1 m); temperature ±0.5 °C at 25 °C', 'as it comes'],
  ['Precision', 'steps of 2.62 Pa down to 0.16 Pa by oversampling (1 to 16 times); noise 3.3 down to 1.3 Pa RMS, 0.2 Pa with its filter', 'its five settings, picked above; no filter'],
  ['Measuring', '5.5 to 37.5 ms a measurement (about 180 to 27 a second); one at a time (forced) or by itself at a set pace (normal)', 'one at a time, 4 a second'],
  ['Address', '0x76 with SDO to GND, 0x77 with SDO to VDDIO', '0x76 or 0x77, whichever answers'],
  ['Interface', 'I2C up to 3.4 MHz, or SPI up to 10 MHz', 'I2C, 400 kHz'],
  ['Supply', '1.71 to 3.6 V', '3.3 V'],
  ['Extras', 'an IIR filter (2 to 16 times) for slow changes', 'none'],
];

const p = reactive(useBmp280({ windowMs: WINDOW_MS }));
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
      <h1 class="text-2xl font-bold">BMP280</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Bosch's barometric pressure sensor: the weight of the air above it, fine enough to notice the board lifted by a few tens of centimetres, and the temperature. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-bmp280.svg" alt="A CH341T bridge wired to a purple BMP280 module, turned round so four wires go straight across: SDA to SDA, SCL to SCL, GND to GND, VCC (3.3 V) to VCC; CSB and SDO free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The purple GY-BMP280 board, turned round so its pins meet the bridge's in order: four wires straight across, SDA, SCL, GND and VCC; CSB and SDO stay free (SDO left free: 0x76). <b>3.3 V only</b>: the board has no regulator and the chip takes 3.6 V at most. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @connect="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <label :class="field">Oversampling
        <select :value="p.setting" :class="select" @change="p.setSetting($event.target.value)">
          <option v-for="[s, label] in SETTINGS" :key="s" :value="s">{{ label }}</option>
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
        Lift the board from the desk to above your head, and back: near sea level the air pressure falls by about 12 Pa (0.12 hPa) for every metre up. At ultra high resolution the noise is about 1.3 Pa, so a metre stands out clearly. Why, and height from it: <RouterLink to="/physics/pressure" :class="link">Air pressure and height</RouterLink>.
      </p>
    </CollapsibleCard>
    <CollapsibleCard id="temperature" title="Temperature">
      <LiveChart title="Temperature" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature] : []" :source="p.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="2" fit />
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        Inside is a silicon membrane (Bosch's porous-silicon process, APSM) that the air outside bends, and resistors in it that change with the strain (its datasheet: a piezo-resistive sensing element), with a temperature sensor beside it. atiic knows the chip by its ID (0x58 in register D0h), resets it and reads its 24 bytes of factory calibration: twelve numbers, three for temperature and nine for pressure.
      </p>
      <p class="mb-2">
        Then it asks for one measurement at a time (the datasheet's forced mode) and waits until the chip says it's done, four times a second here. Oversampling is how many times the chip measures and averages for one result: each step takes longer (5.5 ms once, 37.5 ms at 16 times) and adds a bit, from 16 bits (2.62 Pa steps) to 20 bits (0.16 Pa). The noise falls more slowly than the steps shrink, from 3.3 to 1.3 Pa.
      </p>
      <p>
        <b>From counts to pascals:</b> each result, 20 bits for pressure and for temperature, goes through Bosch's formula with those twelve numbers, in whole numbers only: the temperature first, then the pressure, corrected by that temperature.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.bosch-sensortec.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">Bosch Sensortec</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
