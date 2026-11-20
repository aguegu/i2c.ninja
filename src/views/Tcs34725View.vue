<script setup>
// The TCS3472 (TCS34725, TCS34727) live on a bridge: clear, red, green and
// blue light as counts, a rough colour from them, its integration and gain
// to pick, how it's read, its settings; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import ColourStripe from '../components/ColourStripe.vue';
import SpecTable from '../components/SpecTable.vue';
import { reactive, computed } from 'vue';
import { canConnect } from '../lib/dongle.js';
import { useTcs34725, STEPS, GAINS } from '../lib/useTcs34725.js';

const WINDOW_MS = 60000;
const COUNTS_SPAN = 10; // the chart's least span: a dim room's few counts still drawn
const CHANNELS = [
  { key: 'red', label: 'red', color: '--channel-red' },
  { key: 'green', label: 'green', color: '--channel-green' },
  { key: 'blue', label: 'blue', color: '--channel-blue' },
  { key: 'clear', label: 'clear', color: '--channel-clear' },
];
// its settings, from its datasheet (DS000390), and the ones this page uses
const SPECS = [
  ['Integration', '2.4 ms to 614 ms, in 2.4 ms steps; up to 1024 counts a step, 65535 at most', '101 ms, or the one picked above'],
  ['Gain', '1x, 4x, 16x or 60x', '4x, or the one picked above'],
  ['Output', 'clear, red, green and blue, 16 bits each', 'all four, as counts'],
  ['Address', '0x29, fixed (a VL53L1X shares it)', '0x29'],
  ['Interface', 'I2C up to 400 kHz: the TCS34725 at VDD, the TCS34727 at 1.8 V', 'I2C, 400 kHz'],
  ['Supply', '2.7 to 3.6 V (the TCS34727 to 3.3 V)', '3.3 V'],
  ['Extras', 'an interrupt pin with clear-channel thresholds; a wait timer between readings', 'none'],
];

const c = reactive(useTcs34725({ windowMs: WINDOW_MS }));
const r = computed(() => c.latest);
const saturated = computed(() => r.value?.saturated);
// the red, green and blue counts as a screen colour, scaled to the brightest
// of the three: a rough look at the light's tint, not a colour measurement
// (the channels' spectral responses aren't the eye's, nor the screen's)
const swatch = computed(() => {
  if (!r.value) return null;
  const top = Math.max(r.value.red, r.value.green, r.value.blue);
  if (!top) return null;
  const v = (k) => Math.round((255 * r.value[k]) / top);
  return `rgb(${v('red')}, ${v('green')}, ${v('blue')})`;
});
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">TCS34725</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        ams's colour sensor, and its twin the TCS34727: four light sensors behind clear, red, green and blue filters, an infrared-blocking filter over them all, each counting how much light it gets. Point it at a lamp, a window, a coloured card, and watch the balance shift. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <section :class="[card, 'text-sm leading-relaxed text-slate-500 dark:text-slate-400']">
      Four wires: VIN (3.3 V), GND, SCL to SCL, SDA to SDA; the rest stay free. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </section>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="c.state !== 'running'" :busy="c.state === 'connecting'" @connect="c.connect">{{ c.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="c.disconnect" />
      <label :class="field">Integration
        <select :value="c.settings.steps" :class="select" @change="c.configure({ steps: Number($event.target.value) })">
          <option v-for="n in STEPS" :key="n" :value="n">{{ +(n * c.stepMs).toFixed(1) }} ms</option>
        </select>
      </label>
      <label :class="field">Gain
        <select :value="c.settings.gain" :class="select" @change="c.configure({ gain: Number($event.target.value) })">
          <option v-for="g in GAINS" :key="g" :value="g">{{ g }}×</option>
        </select>
      </label>
      <span v-if="c.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x29 · {{ c.part }} · 400 kHz</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="c.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ c.failure.title }}</p>
      <p v-if="c.failure.detail" class="mt-1">{{ c.failure.detail }}</p>
      <p v-if="c.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ c.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <section v-for="ch in CHANNELS" :key="ch.key" :class="card">
        <p class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><span class="inline-block size-3 rounded-full" :style="{ background: `var(${ch.color})` }" />{{ ch.label }}</p>
        <p class="font-mono text-2xl tabular-nums">{{ r ? r[ch.key] : '—' }}</p>
      </section>
      <section :class="[card, 'col-span-2 sm:col-span-1']">
        <p class="text-sm text-slate-500 dark:text-slate-400">Its tint, roughly</p>
        <div class="mt-1 h-8 rounded-md border border-slate-200 dark:border-slate-700" :style="{ background: swatch ?? 'transparent' }" />
      </section>
    </div>
    <p v-if="saturated" class="text-sm text-slate-500 dark:text-slate-400">
      Clear is at its top: more light than it can count at this setting. A shorter integration or a lower gain brings it back.
    </p>

    <CollapsibleCard id="tint-over-time" title="Its tint over time">
      <h2 class="mb-2 text-lg font-semibold">Its tint over time</h2>
      <ColourStripe :source="c.source" :window-ms="WINDOW_MS" />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Each reading's tint, as the swatch above, scrolling left: wave a coloured card over it, or carry it from a lamp to a window, and see the light change colour. A reading that saw no light leaves a gap.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="the-four-channels" title="The four channels">
      <LiveChart title="The four channels" unit="counts" :series="CHANNELS" :values="r ? CHANNELS.map((ch) => r[ch.key]) : []" :source="c.source" :window-ms="WINDOW_MS" :floor="COUNTS_SPAN" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The counts depend on the setting: 60× gain gives fifteen times 4×'s counts (measured on our bench: 15.3), and a longer integration more in proportion. Compare readings at one setting.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        A grid of photodiodes behind clear, red, green and blue filters, with an infrared-blocking filter over them, made on the chip: the eye doesn't see infrared, and without that filter it would tint every reading. All four integrate the light together for the set time, multiplied by the gain, into 16-bit counts.
      </p>
      <p class="mb-2">
        Every access begins with a command byte (bit 7 set; bits 6-5 01 to read on through several registers), then the register. atiic knows it by its ID at 12h: 44h a TCS34725, 4Dh a TCS34727, the same chip with its I²C at 1.8 V. It powers it on, waits 2.4 ms as the datasheet asks, sets the time (01h) and gain (0Fh), starts it, and reads 8 bytes from 14h: clear, red, green and blue, low byte first.
      </p>
      <p class="mb-2">
        <b>Counts, not lux.</b> Its datasheet names colour temperature among its uses but gives no formula for it, nor for lux, and the glass in front of a sensor changes both. So this page shows what the sensor gives, counts.
      </p>
      <p class="mb-2">
        <b>How colour and light mix</b>, the sensor against the eye, and the screen as a light to measure: <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink>.
      </p>
      <p>
        <b>The tint</b> above is only the red, green and blue counts shown as a screen colour, scaled to the brightest: a rough look. The filters aren't the eye's colour response, nor the screen's, so a true colour needs a calibration this page doesn't have.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://ams-osram.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">ams OSRAM</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
