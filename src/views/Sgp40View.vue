<script setup>
// The SGP40 live on a bridge: its raw signal every second, falling as VOCs
// reach it; its self test and serial number; how a metal-oxide sensor works
// and what the VOC Index is; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive } from 'vue';
import { canConnect } from '../lib/dongle.js';
import { useSgp40, SCL_HZ, READ_MS } from '../lib/useSgp40.js';

const WINDOW_MS = 600000; // ten minutes: a gas comes and goes over minutes
const RAW_SPAN = 1000; // ticks: the chart's least span (a doubling of ethanol, about 870)
const RAW = [{ label: 'raw signal', color: '--series-1' }];
// its settings, from its datasheet (version 1.2, February 2022), and the ones this page uses
const SPECS = [
  ['Output', 'a raw signal, 0 to 65535 ticks (the logarithm of the sensing layer\'s resistance); the VOC Index, 1 to 500, from Sensirion\'s algorithm on the host', 'the raw signal'],
  ['Sensitivity', 'about −870 ticks for each doubling of ethanol (5 to 10 ppm)', '-'],
  ['Range', 'ethanol 0 to 1000 ppm; specified 0.3 to 30', '-'],
  ['Sampling', 'every 0.5 to 10 s; 1 s for the VOC Index', 'every 1 s'],
  ['Switch-on', 'VOC events seen within 60 s; its specifications met within an hour', '-'],
  ['Compensation', 'humidity and temperature, sent with each measurement, from a sensor beside it', 'off (the defaults)'],
  ['Address', '0x59, fixed', '0x59'],
  ['Interface', 'I2C up to 400 kHz', `I2C, ${SCL_HZ / 1000} kHz`],
  ['Supply', '1.7 to 3.6 V (the hotplate\'s too)', '3.3 V'],
];

const p = reactive(useSgp40({ windowMs: WINDOW_MS }));
const fmt = (v) => (v === undefined || v === null ? '—' : String(v));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">SGP40</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Sensirion's VOC sensor: a heated metal-oxide layer whose resistance falls as volatile organic compounds reach it (alcohol, solvents, cooking, people), read as a raw signal. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <section :class="[card, 'text-sm leading-relaxed text-slate-500 dark:text-slate-400']">
      Four wires: VCC (3.3 V), GND, SCL to SCL, SDA to SDA. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </section>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @connect="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x59 · {{ SCL_HZ / 1000 }} kHz<template v-if="p.serial !== null"> · serial {{ p.serial.toString(16).padStart(12, '0') }}</template></span>
      <span v-if="p.selfTest" class="text-sm font-semibold" :class="p.selfTest.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">{{ p.selfTest.passed ? '✓ self test passed' : '✗ self test failed' }}</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <section :class="card">
      <p class="text-sm text-slate-500 dark:text-slate-400">Raw signal</p>
      <p class="font-mono text-4xl tabular-nums">{{ fmt(p.latest) }} <span class="text-lg">ticks</span></p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Lower is more VOCs. Its first minute it climbs as the hotplate settles.</p>
    </section>

    <CollapsibleCard id="raw-signal" title="Raw signal">
      <LiveChart title="Raw signal" unit="ticks" :series="RAW" :values="p.latest !== null ? [p.latest] : []" :source="p.source" :window-ms="WINDOW_MS" :floor="RAW_SPAN" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Ten minutes of it, a reading every {{ READ_MS / 1000 }} s. Bring an open bottle of hand sanitiser or a felt pen near it: it drops within seconds (its datasheet: 63 % of a change in under 10 s), and climbs back once the air clears. Breathe gently towards it from a distance: your breath carries VOCs too.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>A hot metal oxide.</b> A tiny hotplate keeps a metal-oxide layer hot. In clean air, oxygen on its surface holds electrons, so little current flows; a VOC molecule that lands reacts with that oxygen and hands the electrons back, and its resistance falls. The SGP40 reports the logarithm of that resistance, in ticks: the same step for each doubling of the gas, about 870 ticks for ethanol. So it falls as VOCs rise, the opposite way to the <RouterLink to="/ags2602" :class="link">AGS2602</RouterLink>'s TVOC in ppb.
      </p>
      <p class="mb-2">
        <b>Reading it:</b> commands, as Sensirion's humidity sensors: send 0x26 0x0F with a humidity and a temperature (here the defaults, 50 % and 25 °C, which leave its humidity compensation off), wait 30 ms, read two bytes and a checksum. Each measurement keeps the hotplate on, so the page asks once a second, as its datasheet wants; stopping turns it off. On connecting it runs its self test (the hotplate and the layer, 320 ms) and reads its 48-bit serial number, which is also how atiic knows it's there: no ID register.
      </p>
      <p>
        <b>The VOC Index,</b> 1 to 500 with 100 as the average of the last 24 hours, is what a product shows: Sensirion's Gas Index Algorithm, run on the host, learns the room's normal from the raw signal over hours and scores each change against it. This page shows the raw signal itself.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://sensirion.com/products/catalog/SGP40" :class="['text-sm', link]">Sensirion</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
