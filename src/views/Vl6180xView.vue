<script setup>
// The VL6180X live on a bridge: the distance to what's in front, 0 to 100
// mm, as a number and a gauge, "nothing in reach" plainly; its distance over
// time; its ambient light (ours reads 0); how it works and its settings; its
// wiring drawn (ch32v00x scripts/wiring/ch341t-vl6180x.py)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SpecTable from '../components/SpecTable.vue';
import HintNote from '../components/HintNote.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { canConnect } from '../lib/dongle.js';
import { useVl6180x } from '../lib/useVl6180x.js';

const WINDOW_MS = 15000;
const GAUGE_MM = 100; // its datasheet's specified range
const DISTANCE_SPAN_MM = 20;
const SERIES = [{ label: 'distance', color: '--series-1' }];
const TICKS = [0, 25, 50, 75, 100];
// its settings, from ST's datasheet (DocID026171 Rev 7) and AN4545, and the ones this page uses
const SPECS = [
  ['Ranging', '0 to 100 mm specified, by timing its 850 nm infrared light there and back', 'single-shot, back to back'],
  ['Ambient light', 'below 1 lux to 100 klux, 16 bits, eight gains; a 42° half-angle view', 'gain 1, 100 ms'],
  ['Start-up', 'ST\'s settings (AN4545) loaded after each power-up, which it flags', 'loaded when it says it\'s fresh'],
  ['Address', '0x29 at power-up; software can move it (not here)', '0x29'],
  ['Interface', 'I2C up to 400 kHz, 16-bit register addresses', 'I2C, 400 kHz'],
  ['Supply', 'the chip 2.6 to 3.0 V; its board makes 2.8 V from VIN', 'VIN at 3.3 V'],
  ['Extras', 'GPIO0 as shutdown (SHDN on the board), GPIO1 an interrupt, thresholds, cross-talk calibration', 'none'],
];

const tof = reactive(useVl6180x({ windowMs: WINDOW_MS }));
const r = computed(() => tof.latest);
const gauge = computed(() => (r.value?.near ? Math.min(1, r.value.mm / GAUGE_MM) : null));
const status = computed(() => {
  if (!r.value) return 'not connected';
  if (r.value.near) return r.value.mm > GAUGE_MM ? 'past its specified 100 mm' : 'in reach';
  return ['max convergence', 'no target'].includes(r.value.error) ? 'nothing in reach' : r.value.error;
});
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">VL6180X</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        ST's proximity sensor: like its bigger sibling the <RouterLink to="/vl53l1x" :class="link">VL53L1X</RouterLink>, it times its own infrared light to whatever is in front and back, but up close, to 100 mm, in millimetres. The kind a phone uses to turn its touchscreen off at your ear. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-vl6180x.svg" alt="A CH341T bridge on 3.3 V wired to a black VL6180X module seen from its back: SDA to SDA and SCL to SCL straight, GND to GND and VCC to VIN stepping down past its SHDN, GPIO and 2v8 pins, which stay free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The black VL6180X board, drawn from its back, turned so its pins face the bridge: SDA and SCL straight, GND and VIN stepping down past SHDN, GPIO and 2v8, which stay free (2v8 is its regulator's output: the chip runs on 2.8 V). The sensor is on the front. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <HintNote>
      Our board's light sensor reads 0 in every setting, even under a torch, though its distance works: its unmarked chip may be a VL6180, the ranging-only sibling. Yours may read light.
    </HintNote>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="tof.state !== 'running'" :busy="tof.state === 'connecting'" @connect="tof.connect">{{ tof.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="tof.disconnect" />
      <span v-if="tof.state === 'running'" class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">0x29 · {{ tof.rate.toFixed(1) }} readings/s</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="tof.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ tof.failure.title }}</p>
      <p v-if="tof.failure.detail" class="mt-1">{{ tof.failure.detail }}</p>
      <p v-if="tof.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ tof.failure.error }}</p>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="font-mono text-5xl tabular-nums">{{ r?.near ? r.mm : '—' }} <span class="text-xl">mm</span></p>
        <p class="text-sm" :class="r && !r.near ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'">{{ status }}</p>
      </div>
      <div class="relative mt-4 h-6 rounded-full bg-slate-100 dark:bg-slate-700">
        <div v-if="gauge !== null" class="absolute inset-y-0 left-0 rounded-full bg-emerald-600 transition-[width] duration-100" :style="{ width: `${gauge * 100}%` }" />
      </div>
      <div class="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
        <span v-for="t in TICKS" :key="t">{{ t }} mm</span>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Bring a finger down over it, or a card: the gauge follows, millimetre by millimetre. Beyond about 10 cm, or with nothing there, it says nothing is in reach. Light: <span class="font-mono tabular-nums">{{ r ? `${r.lux.toFixed(1)} lux` : '—' }}</span>.
      </p>
    </section>

    <CollapsibleCard id="distance" title="Distance">
      <LiveChart title="Distance" unit="mm" :series="SERIES" :values="r?.near ? [r.mm] : []" :source="tof.source" :window-ms="WINDOW_MS" :floor="DISTANCE_SPAN_MM" :digits="0" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">The readings with something in reach; a gap where nothing was.</p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-works" title="How it works" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it works</h2>
      <p class="mb-2">
        <b>Timing light, up close.</b> An infrared laser (a VCSEL, 850 nm) flashes, and a light sensor times how long the flash takes to come back: light covers a millimetre in about 3 picoseconds, so what it times is tiny. ST calls it FlightSense. It's tuned for short distances, so it reads in millimetres up to about 100 mm, where its bigger sibling reaches metres.
      </p>
      <p class="mb-2">
        <b>Nothing in reach</b> isn't a distance: when too little light comes back to settle on one (it says "max convergence", or "no target"), the page shows a dash and says so, rather than a number.
      </p>
      <p>
        <b>Reading it:</b> its registers sit at 16-bit addresses. After each power-up it says it's "fresh out of reset", and needs ST's settings loaded: thirty private registers and a few public ones, from ST's application note AN4545, which atiic writes before clearing that flag. Then each range is a start, a wait for its "new sample" flag, and one byte of millimetres.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.st.com/en/imaging-and-photonics-solutions/vl6180x.html" :class="['text-sm', link]">ST</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
