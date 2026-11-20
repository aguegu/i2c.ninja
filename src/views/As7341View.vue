<script setup>
// The AS7341 live on a bridge: the light's spectrum as eight bands, Clear
// and NIR beside them, its gain to pick, a phone screen's red, green and
// blue to try (which also checks atiic's SMUX tables), how it's read, its
// settings; its wiring drawn (ch32v00x scripts/wiring/ch341t-as7341.py)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import { canConnect } from '../lib/dongle.js';
import { useAs7341, GAINS, BANDS } from '../lib/useAs7341.js';

// the eight bands, each the colour its light looks (roughly, for display)
const SPECTRUM = [
  { key: 'f1', color: '#7a00e6' },
  { key: 'f2', color: '#2a3bff' },
  { key: 'f3', color: '#00b4ff' },
  { key: 'f4', color: '#21d14a' },
  { key: 'f5', color: '#9ad400' },
  { key: 'f6', color: '#ffc400' },
  { key: 'f7', color: '#ff5a00' },
  { key: 'f8', color: '#d80000' },
];
// the chart: its viewBox, the bars' room, a label row below
const VW = 640, VH = 260, BAR_TOP = 26, BAR_BOTTOM = 220, GAP = 14;
const BAR_W = (VW - GAP * (SPECTRUM.length + 1)) / SPECTRUM.length;
// its settings, from its datasheet (DS000504 v3-00), and the ones this page uses
const SPECS = [
  ['Channels', 'eight visible bands, 415 to 680 nm; Clear; NIR at 910 nm; a flicker channel', 'the eight, Clear and NIR'],
  ['ADCs', 'six, 16 bits: ten channels take two measurements, its SMUX routing the light to them', 'two a reading, about 130 ms'],
  ['Gain', '0.5x to 512x', '64x, or the one picked above'],
  ['Integration', '(ATIME + 1) x (ASTEP + 1) x 2.78 µs, up to 46 s', '50 ms (ams\'s typical: 29 and 599)'],
  ['Address', '0x39, fixed', '0x39'],
  ['Interface', 'I2C up to 400 kHz', 'I2C, 400 kHz'],
  ['Supply', 'the chip 1.7 to 2.0 V; modules regulate it down', 'the module\'s VIN at 3.3 V'],
  ['Extras', 'an LED driver, a GPIO, flicker detection at 100 and 120 Hz, a FIFO', 'none'],
];
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';

const s = reactive(useAs7341());
const r = computed(() => s.latest);
const top = computed(() => (r.value ? Math.max(1, ...SPECTRUM.map((b) => r.value[b.key])) : 1));
const bars = computed(() => SPECTRUM.map((b, i) => {
  const v = r.value ? r.value[b.key] : 0;
  const h = ((BAR_BOTTOM - BAR_TOP) * v) / top.value;
  return { ...b, nm: BANDS[b.key], v, x: GAP + i * (BAR_W + GAP), y: BAR_BOTTOM - h, h };
}));
const strongest = computed(() => (r.value ? bars.value.reduce((a, b) => (b.v > a.v ? b : a)) : null));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">AS7341</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        ams's spectral sensor: eight light sensors, each behind a filter for its own narrow band of colour, from violet to deep red, and two more for all the light and the near infrared. Not three colours but a spectrum: lamps that look alike come apart in it. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-as7341.svg" alt="A CH341T bridge on 3.3 V wired to a black AS7341 module (AS734x, a mounting ear at each end) seen from its back: SDA to SDA, SCL to SCL, GND to GND, VCC to VIN, four straight wires; GPIO and INT free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The black "AS734x" board, drawn from its back, turned so its pins face the bridge: four straight wires, VIN, GND, SCL, SDA; GPIO and INT stay free. The chip itself runs on 1.8 V: the board carries a regulator, so VIN takes 3.3 V. Its white LED and the sensor are on the front. The LED is the chip's own to drive (its LDR pin): off unless a register turns it on, 4 to 258 mA (tried on ours at 4 mA), so it stays dark here and adds nothing to the screen test. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="s.state !== 'running'" :busy="s.state === 'connecting'" @connect="s.connect">{{ s.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="s.disconnect" />
      <label :class="field">Gain
        <select :value="s.gain" :class="select" @change="s.setGain(Number($event.target.value))">
          <option v-for="g in GAINS" :key="g" :value="g">{{ g }}×</option>
        </select>
      </label>
      <span v-if="s.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x39 · 400 kHz · 50 ms a measurement, two a reading</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="s.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ s.failure.title }}</p>
      <p v-if="s.failure.detail" class="mt-1">{{ s.failure.detail }}</p>
      <p v-if="s.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ s.failure.error }}</p>
    </div>

    <section :class="card">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">The spectrum</h2>
        <p v-if="strongest && strongest.v" class="text-sm text-slate-500 dark:text-slate-400">strongest: {{ strongest.key.toUpperCase() }}, {{ strongest.nm }} nm</p>
      </div>
      <svg :viewBox="`0 0 ${VW} ${VH}`" class="w-full" role="img" :aria-label="r ? `Eight bands: ${bars.map((b) => `${b.nm} nm ${b.v}`).join(', ')}` : 'The spectrum, once connected'">
        <line :x1="GAP / 2" :x2="VW - GAP / 2" :y1="BAR_BOTTOM" :y2="BAR_BOTTOM" stroke="currentColor" stroke-opacity="0.25" />
        <g v-for="b in bars" :key="b.key">
          <rect :x="b.x" :y="b.y" :width="BAR_W" :height="Math.max(b.h, 0)" rx="4" :fill="b.color" />
          <text :x="b.x + BAR_W / 2" :y="b.y - 6" text-anchor="middle" font-size="14" fill="currentColor" class="font-mono">{{ r ? b.v : '' }}</text>
          <text :x="b.x + BAR_W / 2" :y="BAR_BOTTOM + 18" text-anchor="middle" font-size="13" fill="currentColor">{{ b.key.toUpperCase() }}</text>
          <text :x="b.x + BAR_W / 2" :y="BAR_BOTTOM + 34" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">{{ b.nm }} nm</text>
        </g>
      </svg>
      <div class="mt-3 flex flex-wrap gap-x-10 gap-y-2 text-sm">
        <p><span class="text-slate-500 dark:text-slate-400">Clear</span> <span class="font-mono tabular-nums">{{ r ? r.clear : '—' }}</span></p>
        <p><span class="text-slate-500 dark:text-slate-400">NIR, 910 nm</span> <span class="font-mono tabular-nums">{{ r ? r.nir : '—' }}</span></p>
        <p v-if="r?.saturated" class="text-amber-700 dark:text-amber-400">A channel is at its top: a lower gain brings it back.</p>
      </div>
    </section>

    <CollapsibleCard id="try-it" title="Try it: a screen's red, green and blue" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try it: a screen's red, green and blue</h2>
      <p class="mb-2">
        Fill a phone's screen with pure red and hold it a few centimetres over the sensor: F7 and F8 (630, 680 nm) should stand tall. Then green: F4 and F5 (515, 555 nm). Then blue: F2 and F3 (445, 480 nm). A screen's red, green and blue are each a narrow band of light, which this sensor separates where an eye only sees a colour.
      </p>
      <p>
        It also checks the sensor's routing: its eight bands share six converters, and the table that connects them (its SMUX) isn't in its datasheet; atiic takes it from Adafruit's AS7341 library. Colours landing in the right bands is that table working.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        Eleven photodiodes, each behind an interference filter made on the chip that passes a band 26 to 52 nm wide (at half its peak), but only six analogue-to-digital converters. A switch matrix, its SMUX, connects photodiodes to converters: one measurement reads F1 to F4 with Clear and NIR, the next F5 to F8 with them again. Each takes 50 ms here, set by two registers, and the gain multiplies the counts.
      </p>
      <p class="mb-2">
        atiic knows it by its ID at 92h (bits 7-2 001001). For each half it writes the SMUX's 20 bytes, starts the switch over (SMUXEN, cleared when done), starts a measurement, waits for AVALID, and reads the six converters from 95h, low byte first.
      </p>
      <p>
        <b>Counts, not a calibrated spectrum.</b> Each band's filter passes a different share of light, so equal counts don't mean equal light; a lamp's true spectrum takes a calibration against a known source. Compare readings with each other at one gain: <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink> has more on how colours mix.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://ams-osram.com" :class="['text-sm', link]">ams OSRAM</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
