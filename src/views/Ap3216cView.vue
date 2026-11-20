<script setup>
// The AP3216C live on a bridge: ambient light as a level, the IR it sees,
// and proximity by its own IR LED; its four ranges; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { canConnect } from '../lib/dongle.js';
import { useAp3216c, RANGES, READ_MS } from '../lib/useAp3216c.js';

const WINDOW_MS = 60000;
const FLOOR_LUX = 5;
const FLOOR_PS = 50; // counts: the proximity chart's least span
const PROXIMITY_MAX = 1023; // 10 bits
// its settings, from its datasheet (Rev0.86; Rev0.80), and the ones this page uses
const SPECS = [
  ['Ambient light', '16 bits, four ranges: 23360, 5840, 1460 or 365 lux full scale (a later revision says 20661 to 323)', 'pick one; the widest by default'],
  ['Proximity', '10 bits, by its own IR LED\'s pulses; an "object near" flag with thresholds', 'its defaults'],
  ['IR', '10 bits, the room\'s infrared; too much and proximity is flagged invalid', '-'],
  ['Conversion', 'ALS 100 ms, PS and IR 12.5 ms; both alternately, 112.5 ms', `both, read every ${READ_MS} ms`],
  ['Address', '0x1E, fixed', '0x1E'],
  ['Interface', 'I2C up to 400 kHz', 'I2C, 400 kHz'],
  ['Supply', '2.4 to 3.6 V; the IR LED its own (VLED)', '3.3 V'],
];
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';

const a = reactive(useAp3216c({ windowMs: WINDOW_MS }));
const r = computed(() => a.latest);
const LUX = [{ label: 'light', color: '--series-2' }];
const PS = [{ label: 'proximity', color: '--series-1' }];
const step = computed(() => RANGES[a.range] / 65535);
const luxDigits = computed(() => (step.value < 0.01 ? 3 : step.value < 0.1 ? 2 : 1));
const fmt = (v, d) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">AP3216C</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Lite-On's three-in-one, the kind beside a phone's earpiece: how bright the room is, how much infrared is about, and whether something is close, by bouncing its own infrared off it. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <section :class="[card, 'text-sm leading-relaxed text-slate-500 dark:text-slate-400']">
      Its CJMCU-3216 board: VCC to 3.3 V (its chip takes 2.4 to 3.6 V), GND, SCL to SCL, SDA to SDA, and VLED to 3.3 V too: VLED feeds its IR LED, so without it proximity stays at 0. INT stays free. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </section>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="a.state !== 'running'" :busy="a.state === 'connecting'" @connect="a.connect">{{ a.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="a.disconnect" />
      <label :class="field">Range
        <select :value="a.range" :class="select" @change="a.setRange(Number($event.target.value))">
          <option v-for="(lux, i) in RANGES" :key="lux" :value="i">up to {{ lux }} lux</option>
        </select>
      </label>
      <span v-if="a.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x1E · 400 kHz</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="a.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ a.failure.title }}</p>
      <p v-if="a.failure.detail" class="mt-1">{{ a.failure.detail }}</p>
      <p v-if="a.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ a.failure.error }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Light</p>
        <p class="font-mono text-3xl tabular-nums">{{ fmt(r?.lux, luxDigits) }} <span class="text-base">lux</span></p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ r ? `${r.als} counts` : '' }}</p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Proximity</p>
        <p class="font-mono text-3xl tabular-nums">{{ r ? r.proximity : '—' }}</p>
        <p class="mt-1 text-xs" :class="r?.near ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'">{{ r ? (r.irOverflow ? 'too much IR: not valid' : r.near ? 'something near' : 'nothing near') : '' }}</p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Infrared</p>
        <p class="font-mono text-3xl tabular-nums">{{ r ? r.ir : '—' }}</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">of 1023</p>
      </section>
    </div>

    <CollapsibleCard id="light" title="Light">
      <LiveChart title="Light" unit="lux" :series="LUX" :values="r ? [r.lux] : []" :source="a.luxSource" :window-ms="WINDOW_MS" :floor="FLOOR_LUX" :digits="luxDigits" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Cup a hand over it, then hold it to a lamp. A level that follows the light rather than an exact lux: compare with the <RouterLink to="/opt3001" :class="link">OPT3001</RouterLink> for that. A dim room may read only a few counts on the widest range: pick a narrower one.</p>
    </CollapsibleCard>

    <CollapsibleCard id="proximity" title="Proximity">
      <LiveChart title="Proximity" unit="counts" :series="PS" :values="r ? [r.proximity] : []" :source="a.proximitySource" :window-ms="WINDOW_MS" :floor="FLOOR_PS" :digits="0" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Bring a finger slowly down over it: the count rises as more of its infrared comes back, up to {{ PROXIMITY_MAX }}. It reads closeness, not distance: a white card gives more back than a dark sleeve at the same height.</p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>Three readings, one package.</b> A photodiode for visible light counts the room's light over 100 ms (16 bits); a second, for infrared, counts the room's IR; and its own IR LED pulses while that second photodiode counts what comes back off anything above it: proximity. A phone uses this to turn its screen off at your ear, and its light reading to dim the screen.
      </p>
      <p class="mb-2">
        <b>Proximity against the room:</b> sunlight and lamps carry infrared too. When there's too much, the chip flags its proximity reading as invalid and says nothing is near, rather than mistake the room's IR for a finger.
      </p>
      <p>
        <b>A level, not an exact lux:</b> its datasheet gives two different scales in two places (0.36 or about 0.32 lux a count on the widest range); atiic takes the one both revisions share. It has no ID register either: atiic knows it by the bits its datasheet says always read 0.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://optoelectronics.liteon.com" :class="['text-sm', link]">Lite-On</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
