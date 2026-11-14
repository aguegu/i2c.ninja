<script setup>
// The AGS2602 live on the bridge: TVOC (ppb) and its sensing film's
// resistance, every 2 s; found by its version's CRC at 0x1A, the bus at 100
// kHz; how it's read, its settings from Aosong's manual (AGS2602, 2026-05)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useAgs2602, SCL_HZ, READ_MS, WARMUP_S } from '../lib/useAgs2602.js';

const WINDOW_MS = 600000; // ten minutes: a gas comes and goes over minutes
const TVOC_SPAN_PPB = 500; // the chart's least span
const KOHM_SPAN = 50; // the chart's least span
const TVOC = [{ label: 'TVOC', color: '--series-1' }];
const KOHM = [{ label: 'resistance', color: '--series-2' }];
// its settings, from Aosong's manual (2026-05; Table 1, sections 4 and 6), and the ones this page uses
const SPECS = [
  ['Range', '0 to 30000 ppb (TVOC; the reading is ethanol\'s, in ppb)', 'all of it'],
  ['Accuracy', '±(1000 ppb + 40 % of the reading), at 25 °C and 50 %RH', 'as it comes'],
  ['Sampling', 'a new reading every 2 s or more', 'every 2 s'],
  ['Warm-up', '120 s at least; after a week unpowered 30 minutes, longer than that 60', '-'],
  ['Response', 'within 30 s, at 30000 ppb', '-'],
  ['Address', '0x1A, fixed', '0x1A'],
  ['Interface', 'I2C up to 100 kHz, 1 to 10 kΩ pull-ups to VCC', `I2C, ${SCL_HZ / 1000} kHz`],
  ['Supply', '4.75 to 5.25 V, 24 ± 4 mA; over 5.5 V damages it', '5 V'],
  ['Conditions', '-25 to 60 °C, 20 to 95 %RH without condensation', '-'],
];

const p = reactive(useAgs2602({ windowMs: WINDOW_MS }));
const r = computed(() => p.latest);
// the warm-up left, s: counted from connecting (the bridge may have powered it
// longer), refreshed with each reading
const warmLeft = computed(() => (r.value && p.since !== null ? Math.max(0, WARMUP_S - (performance.now() - p.since) / 1000) : 0));
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">AGS2602</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Aosong's TVOC sensor: a heated metal-oxide film whose resistance falls as volatile organic compounds reach it (alcohol, solvents, smoke, cooking), turned into parts per billion. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-ags2602.svg" alt="A CH341T bridge, its jumpers on I2C and 5V, wired to an AGS2602 seen from its pins: VCC to pin 1, SDA to pin 2, GND to pin 3, SCL to pin 4" class="mx-auto w-full lg:w-4/5" />
      <figcaption class="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">Pin 1 VCC, 2 SDA, 3 GND, 4 SCL (its manual, Table 2). <b class="text-slate-700 dark:text-slate-200">It needs 5 V</b> (4.75 to 5.25), and its manual asks its SDA and SCL pulled up to it: the CH341T with its jumper on 5V runs its lines at 5 V too. The CH347's lines are 3.3 V. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.</figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @click="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(p.address) }}, {{ SCL_HZ / 1000 }} kHz<template v-if="p.version">, version {{ p.version.map((b) => b.toString(16).padStart(2, '0')).join(' ') }}</template></span>
      <span v-if="p.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${p.failed.count} of ${p.failed.of} readings didn't come through and were skipped; the last: ${p.failed.last}`">· {{ p.failed.count }} {{ p.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <section :class="[card, 'flex flex-wrap gap-x-10 gap-y-3']">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">TVOC</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.tvoc, 0) }} <span class="text-base">ppb</span></p>
      </div>
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Film resistance</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.kohm, 1) }} <span class="text-base">kΩ</span></p>
      </div>
      <p v-if="warmLeft > 0" class="self-center text-sm text-amber-700 dark:text-amber-400">Warming up: {{ mmss(warmLeft) }} left of its {{ WARMUP_S / 60 }} minutes (since you connected). After days unpowered give it 30 to 60. Its first readings run high and settle.</p>
      <p v-else-if="r && !r.ready" class="self-center text-sm text-slate-500 dark:text-slate-400">Warming up: it says its reading isn't updated yet (its RDY bit).</p>
    </section>

    <CollapsibleCard id="tvoc" title="TVOC">
      <LiveChart title="TVOC" unit="ppb" :series="TVOC" :values="r ? [r.tvoc] : []" :source="p.tvocSource" :window-ms="WINDOW_MS" :floor="TVOC_SPAN_PPB" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Ten minutes of it, a reading every {{ READ_MS / 1000 }} s. Bring an open bottle of hand sanitiser near it, or a felt pen, and watch it climb within seconds and fall back over minutes. Don't blow on it or hold a lighter's gas to it: its manual warns that strong gases and a direct draught both upset it.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="resistance" title="Film resistance">
      <LiveChart title="Film resistance" unit="kΩ" :series="KOHM" :values="r ? [r.kohm] : []" :source="p.kohmSource" :window-ms="WINDOW_MS" :floor="KOHM_SPAN" :digits="1" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        What it really measures. In clean air, oxygen sits on the hot metal oxide's surface and holds electrons there, so little current flows: hundreds of kΩ. A VOC molecule that lands reacts with that oxygen and hands the electrons back; the more of them, the lower its resistance (its manual: the more gas, the higher the film's conductivity). The TVOC above is that fall, read through Aosong's calibration, so the two charts mirror each other.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        A MEMS hotplate on a silicon chip keeps a film of metal-oxide semiconductor hot; a small chip beside it reads the film's resistance and works out the concentration. Over I2C it has registers: write the register's number, then read five bytes back, four of data and a CRC checksum, which atiic checks. 0x00 holds the TVOC in parts per billion (three bytes) and a ready bit; 0x20 the film's resistance (in tens of ohms); 0x11 its version. This page reads the first two every {{ READ_MS / 1000 }} s, the most often its manual allows.
      </p>
      <p>
        <b>Give it time:</b> it needs two minutes to warm up, half an hour after a few days unpowered, an hour after more than a week. <b>Read it as a trend:</b> its accuracy is ±1000 ppb plus 40 % of the reading, so a hundred ppb or two in clean air is about zero, and a rise to a few thousand is something in the air. It's found by its answer: its version read with a good checksum at 0x1A.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.aosong.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">Aosong</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
