<script setup>
// The SGP30 live on a bridge: CO2eq and TVOC worked out on the chip, its raw
// H2 and ethanol signals beside them; its self test and serial; its first 15
// s; how its baseline works; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import { canConnect } from '../lib/dongle.js';
import { useSgp30, SCL_HZ, READ_MS, INIT_S } from '../lib/useSgp30.js';

const WINDOW_MS = 600000; // ten minutes: a gas comes and goes over minutes
const CO2EQ_SPAN = 200; // ppm: the chart's least span
const TVOC_SPAN = 200; // ppb
const RAW_SPAN = 500; // ticks
const CO2EQ = [{ label: 'CO2eq', color: '--series-1' }];
const TVOC = [{ label: 'TVOC', color: '--series-2' }];
const RAW = [{ label: 'H2', color: '--series-1' }, { label: 'ethanol', color: '--series-3' }];
// its settings, from its datasheet (Version 1.0, May 2020), and the ones this page uses
const SPECS = [
  ['Outputs', 'CO2eq 400 to 60000 ppm and TVOC 0 to 60000 ppb, worked out on the chip; its raw H2 and ethanol signals', 'all four'],
  ['Pace', 'measure once a second after starting, for its baseline algorithm', `every ${READ_MS / 1000} s`],
  ['Start-up', `${INIT_S} s of fixed 400 ppm and 0 ppb, then its own readings`, '-'],
  ['Baseline', 'readable and settable: saved now and then, set back after a power-up', '-'],
  ['Compensation', 'absolute humidity (g/m³), from a humidity sensor beside it', 'off'],
  ['Address', '0x58, fixed', '0x58'],
  ['Interface', 'I2C up to 400 kHz', `I2C, ${SCL_HZ / 1000} kHz`],
  ['Supply', 'the chip 1.62 to 1.98 V, about 49 mA measuring; modules regulate it down', 'the module\'s VIN at 3.3 V'],
];

const p = reactive(useSgp30({ windowMs: WINDOW_MS }));
const r = computed(() => p.latest);
// its fixed first seconds left: counted from its iaq_init, refreshed with each reading
const initLeft = computed(() => (r.value && p.since !== null ? Math.max(0, INIT_S - (performance.now() - p.since) / 1000) : 0));
const fmt = (v) => (v === undefined || v === null ? '—' : String(v));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">SGP30</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Sensirion's air quality sensor: two heated metal-oxide signals, and a small processor beside them that turns them into a CO₂ equivalent and total VOCs, keeping its own idea of clean air. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <section :class="[card, 'text-sm leading-relaxed text-slate-500 dark:text-slate-400']">
      Four wires: VIN, GND, SCL to SCL, SDA to SDA. The chip itself runs on 1.8 V: its modules carry a regulator and shift the I²C lines, so VIN takes 3.3 V. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </section>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @connect="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x58 · {{ SCL_HZ / 1000 }} kHz<template v-if="p.featureSet !== null"> · feature set {{ p.featureSet.toString(16).padStart(4, '0') }}</template><template v-if="p.serial !== null"> · serial {{ p.serial.toString(16).padStart(12, '0') }}</template></span>
      <span v-if="p.selfTest" class="text-sm font-semibold" :class="p.selfTest.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">{{ p.selfTest.passed ? '✓ self test passed' : '✗ self test failed' }}</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <section :class="[card, 'flex flex-wrap gap-x-10 gap-y-3']">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">CO₂eq</p>
        <p class="font-mono text-3xl tabular-nums">{{ fmt(r?.co2eq) }} <span class="text-base">ppm</span></p>
      </div>
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">TVOC</p>
        <p class="font-mono text-3xl tabular-nums">{{ fmt(r?.tvoc) }} <span class="text-base">ppb</span></p>
      </div>
      <p v-if="initLeft > 0" class="self-center text-sm text-amber-700 dark:text-amber-400">Starting: {{ Math.ceil(initLeft) }} s of its fixed 400 ppm and 0 ppb left.</p>
    </section>

    <CollapsibleCard id="co2eq" title="CO₂ equivalent">
      <LiveChart title="CO₂ equivalent" unit="ppm" :series="CO2EQ" :values="r ? [r.co2eq] : []" :source="p.airSource" :window-ms="WINDOW_MS" :floor="CO2EQ_SPAN" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Breathe gently towards it from a short distance and watch it climb. Not a CO₂ measurement: a CO₂ equivalent, worked out from its hydrogen and ethanol signals, not from CO₂ itself.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="tvoc" title="TVOC">
      <LiveChart title="TVOC" unit="ppb" :series="TVOC" :values="r ? [r.tvoc] : []" :source="p.airSource" :window-ms="WINDOW_MS" :floor="TVOC_SPAN" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Bring an open bottle of hand sanitiser or a felt pen near it and watch it climb, then fall back once the air clears.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="raw-signals" title="Raw signals">
      <LiveChart title="Raw signals" unit="ticks" :series="RAW" :values="r ? [r.h2, r.ethanol] : []" :source="p.rawSource" :window-ms="WINDOW_MS" :floor="RAW_SPAN" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        What the two above come from: lower is more gas. Each climbs through its first minutes as the hotplate settles.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>Two signals.</b> A hotplate keeps a metal-oxide layer hot; gases that land on it lower its resistance (how: the <RouterLink to="/sgp40" :class="link">SGP40</RouterLink>, its successor). The SGP30 reads it two ways, one tuned to hydrogen (H₂), one to ethanol, each as the logarithm of a resistance: the raw signals, which fall as gas rises.
      </p>
      <p class="mb-2">
        <b>Worked out on the chip.</b> From those, the chip's own processor computes TVOC in ppb and a CO₂ equivalent in ppm. It needs a reading every second to do it, and for the first {{ INIT_S }} s after starting answers a fixed 400 ppm and 0 ppb.
      </p>
      <p class="mb-2">
        <b>Its baseline.</b> Its readings are measured against a baseline it keeps adjusting on its own (its datasheet: a dynamic baseline compensation). A product reads that baseline now and then, saves it, and gives it back after a power-up, so it needn't start over. This page starts fresh each time, so early readings are less settled.
      </p>
      <p>
        <b>Reading it:</b> 16-bit commands, each answer's words followed by a checksum atiic checks: the SGP40's and the SHTs'. On connecting the page reads its serial number and feature set (0x0022 on ours: product type 0, the SGP30, how atiic knows it) and runs its self test, which its datasheet allows only before starting. It has no command to stop: stopping the page leaves it measuring until it loses power.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://sensirion.com/products/catalog/SGP30" :class="['text-sm', link]">Sensirion</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
