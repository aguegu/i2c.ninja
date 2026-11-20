<script setup>
// The OPT3001 live on a bridge: light as the eye sees it, in lux, its
// automatic range, its conversion time, how its result is a floating-point
// number; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { canConnect, hex } from '../lib/dongle.js';
import { useOpt3001, CONVERSIONS_MS } from '../lib/useOpt3001.js';

const WINDOW_MS = 60000;
const FLOOR_LUX = 5;
// a few everyday light levels, lux (rough: they span a range each)
const LEVELS = [
  [0.1, 'a full moon'],
  [1, 'a candle at a metre'],
  [50, 'a dim living room'],
  [300, 'an office desk'],
  [1000, 'an overcast day outdoors'],
  [10000, 'daylight, not in the sun'],
  [83865.6, 'direct sun and more: its top'],
];
// its settings, from its datasheet (SBOS681C), and the ones this page picks
const SPECS = [
  ['Range', '12 full scales, 40.95 to 83865.6 lux, or automatic', 'automatic'],
  ['Resolution', '0.01 lux on its lowest scale, 12 bits on each', '—'],
  ['Conversion', '100 or 800 ms (800: its specified resolution)', 'either; 800 by default'],
  ['Mode', 'continuous, single-shot, or shut down', 'continuous; shut down when stopped'],
  ['Address', '0x44, 0x45, 0x46 or 0x47 by its ADDR pin (GND, VDD, SDA, SCL)', 'the first that reads its IDs'],
  ['Interface', 'I2C, up to 2.6 MHz', 'I2C, 400 kHz'],
  ['Extras', 'limits that trip its INT pin; TI\'s ID and its own', '—'],
];
const CONVERSION_LABELS = { 800: '800 ms (full resolution)', 100: '100 ms (quicker)' };
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';

const o = reactive(useOpt3001({ windowMs: WINDOW_MS }));
const series = [{ label: 'light', color: '--series-2' }];
const lux = computed(() => o.latest?.lux ?? null);
const digits = (v) => (v === null ? 0 : v < 10 ? 2 : v < 1000 ? 1 : 0);
const fmt = (v) => (v === null ? '—' : v.toFixed(digits(v)));
// the everyday level nearest below it
const like = computed(() => (lux.value === null ? null : [...LEVELS].reverse().find(([l]) => lux.value >= l)?.[1] ?? 'darker than a full moon'));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">OPT3001</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Texas Instruments' ambient light sensor: how bright it is, as the human eye sees it, in lux, from moonlight to direct sun without a range to pick. What a phone dims its screen by. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <section :class="[card, 'text-sm leading-relaxed text-slate-500 dark:text-slate-400']">
      Four wires: VCC to VCC (3.3 V), GND, SCL to SCL, SDA to SDA; INT stays free. Its ADDR pin picks the address: tied to GND, 0x44 (as most modules do). No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </section>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="o.state !== 'running'" :busy="o.state === 'connecting'" @connect="o.connect">{{ o.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="o.disconnect" />
      <label :class="field">Conversion
        <select :value="o.conversionMs" :class="select" @change="o.setConversion(Number($event.target.value))">
          <option v-for="ms in CONVERSIONS_MS" :key="ms" :value="ms">{{ CONVERSION_LABELS[ms] }}</option>
        </select>
      </label>
      <span v-if="o.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(o.address) }} · 400 kHz · automatic range</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="o.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ o.failure.title }}</p>
      <p v-if="o.failure.detail" class="mt-1">{{ o.failure.detail }}</p>
      <p v-if="o.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ o.failure.error }}</p>
    </div>

    <section :class="card">
      <p class="text-sm text-slate-500 dark:text-slate-400">Light</p>
      <p class="font-mono text-4xl tabular-nums">{{ fmt(lux) }} <span class="text-lg">lux</span></p>
      <p v-if="like" class="mt-1 text-sm text-slate-500 dark:text-slate-400">about {{ like }}<span v-if="o.latest?.overflow">: past its top</span></p>
    </section>

    <CollapsibleCard id="light" title="Light">
      <LiveChart title="Light" unit="lux" :series="series" :values="lux !== null ? [lux] : []" :source="o.source" :window-ms="WINDOW_MS" :floor="FLOOR_LUX" :digits="digits(lux)" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Cup a hand over it, then point it at a window or a lamp: it follows from a few lux to thousands, with no range to pick. A phone's torch close up reads thousands.</p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>As the eye sees.</b> A photodiode turns light into a current, but bare silicon sees deep into the infrared, which the eye doesn't. The OPT3001's filters shape its response to the eye's (the photopic curve, peaking in green at 555 nm) and reject more than 99 % of infrared, so a warm lamp and daylight of the same brightness read the same. Lux is that eye-weighted light falling on each square metre. For light split into its colours, see the <RouterLink to="/bh1745" :class="link">BH1745NUC</RouterLink> and <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink>.
      </p>
      <p class="mb-2">
        <b>A floating-point number.</b> Light spans more than a million to one, from moonlight to the sun. Its result register holds a 4-bit exponent E and a 12-bit mantissa R: <span class="font-mono">lux = 0.01 × 2<sup>E</sup> × R</span>. E is the range, each one doubling the last: 0.01 lux a step at E = 0, up to 83865.6 lux at E = 11. With the automatic range on, it picks E itself, measuring 10 ms first to see which fits.
      </p>
      <p>
        <b>800 or 100 ms.</b> Each conversion counts the light for its whole time, which also averages out a lamp's flicker. 800 ms is what its accuracy is specified for; 100 ms follows quicker, a little noisier in dim light.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.ti.com/product/OPT3001" :class="['text-sm', link]">Texas Instruments</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink>
      </p>
    </section>
  </main>
</template>
