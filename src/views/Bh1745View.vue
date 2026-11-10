<script setup>
// The BH1745NUC live on the dongle: red, green, blue and clear light as
// counts, a rough colour from them, its measurement time and gain to pick,
// how it's read, its settings; the purple board's wiring (from the user's
// photo)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import ColourStripe from '../components/ColourStripe.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useBh1745, TIMES_MS, GAINS, COUNT_MAX } from '../lib/useBh1745.js';

const WINDOW_MS = 60000;
const COUNTS_SPAN = 10; // the chart's least span: a dim room's few counts still drawn
const CHANNELS = [
  { key: 'red', label: 'red', color: '--channel-red' },
  { key: 'green', label: 'green', color: '--channel-green' },
  { key: 'blue', label: 'blue', color: '--channel-blue' },
  { key: 'clear', label: 'clear', color: '--channel-clear' },
];
// its settings, from ROHM's datasheet (Rev.002, 2016), and the ones this page uses
const SPECS = [
  ['Measurement time', '160, 320, 640, 1280, 2560 or 5120 ms', '160 ms, or the one picked above'],
  ['Gain', '1x, 2x or 16x', '1x, or the one picked above'],
  ['Output', 'red, green, blue and clear, 16 bits each', 'all four, as counts'],
  ['Address', '0x38, or 0x39 with its ADDR pin high', '0x38 or 0x39, whichever answers'],
  ['Interface', 'I2C, up to 400 kHz; 1.8 V logic and up', 'I2C, 400 kHz'],
  ['Supply', '2.3 to 3.6 V', '3.3 V'],
  ['Extras', 'an interrupt pin (INT) with thresholds on one channel; rejects 50/60 Hz flicker', 'none'],
];

const c = reactive(useBh1745({ windowMs: WINDOW_MS }));
const r = computed(() => c.latest);
const saturated = computed(() => r.value && CHANNELS.some((ch) => r.value[ch.key] >= COUNT_MAX));
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
      <h1 class="text-2xl font-bold">BH1745NUC</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        ROHM's colour sensor: four light sensors behind red, green, blue and clear filters, each counting how much light it gets. Point it at a lamp, a window, a coloured card, and watch the balance shift. Live over the USB dongle.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-bh1745.svg" alt="A CH341T dongle wired to a purple BH1745NUC module: VCC to VCC, GND to GND, SCL to SCL, SDA to SDA; INT and ADD free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The purple BH1745 board: four wires from its VCC, GND, SCL and SDA; INT and ADD stay free (ADD free, it answers at 0x38; tied high, 0x39). Keep the window on top of the chip clean and uncovered. New to the dongle? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="c.state !== 'running'" :busy="c.state === 'connecting'" @click="c.connect">{{ c.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="c.disconnect" />
      <label :class="field">Time
        <select :value="c.settings.timeMs" :class="select" @change="c.configure({ timeMs: Number($event.target.value) })">
          <option v-for="t in TIMES_MS" :key="t" :value="t">{{ t }} ms</option>
        </select>
      </label>
      <label :class="field">Gain
        <select :value="c.settings.gain" :class="select" @change="c.configure({ gain: Number($event.target.value) })">
          <option v-for="g in GAINS" :key="g" :value="g">{{ g }}×</option>
        </select>
      </label>
      <span v-if="c.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(c.address) }} · a reading every {{ c.settings.timeMs / 1000 }} s</span>
      <span v-if="c.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${c.failed.count} of ${c.failed.of} readings didn't come through and were skipped; the last: ${c.failed.last}`">· {{ c.failed.count }} {{ c.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
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
      A channel is at its top, {{ COUNT_MAX }}: more light than it can count at this setting. A shorter time or a lower gain brings it back.
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
        The counts depend on the setting: 16× gain gives sixteen times the counts, four times the time four times the counts (measured on our bench: 15.8 to 16.2, and 4.0 to 4.1). Compare readings at one setting.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        Four photodiodes, each behind its own filter: red, green and blue pass their part of the spectrum, clear a wide band (for how bright the light is, whatever its colour; far less sensitive than the other three in this chip, so its counts compare only with themselves). An infrared-cut filter keeps infrared light out, which the eye doesn't see. Each converts its light into a count over the measurement time, multiplied by the gain.
      </p>
      <p class="mb-2">
        atiic knows it by its part ID (0x0B in register 40h) and ROHM's maker ID (0xE0 in 92h). It resets it, sets the time (register 41h) and turns measuring on with the gain (42h; the datasheet asks 44h be written 02h too), then waits for each measurement's VALID bit and reads 8 bytes from 50h: red, green, blue and clear, low byte first.
      </p>
      <p class="mb-2">
        <b>Counts, not lux.</b> The datasheet plots the illuminance (lux) and the colour temperature worked out from the four channels, but gives no formula for them (ROHM gives one separately, not read here). So this page shows what the sensor gives, counts.
      </p>
      <p class="mb-2">
        <b>How colour and light mix</b>, the sensor against the eye, and the screen as a light to measure: <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink>.
      </p>
      <p>
        <b>The tint</b> above is only the red, green and blue counts shown as a screen colour, scaled to the brightest: a rough look. The channels' filters aren't the eye's colour response, nor the screen's, so a true colour needs a calibration this page doesn't have.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.rohm.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">ROHM</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
