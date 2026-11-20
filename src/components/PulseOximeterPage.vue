<script setup>
// A pulse oximeter's page (the MAX30102, the MAX30100): a fingertip's light,
// its heartbeat worked out, and how a pulse oximeter starts from two colours
// of light; the chip's own intro (slot intro), its board (slot board: the
// drawing and its caption) and what its LEDs and ADC are (slot light)
import LiveSettings from './LiveSettings.vue';
import CollapsibleCard from './CollapsibleCard.vue';
import ConnectButton from './ConnectButton.vue';
import StopButton from './StopButton.vue';
import SvgDrawing from './SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from './LiveChart.vue';
import { canConnect } from '../lib/dongle.js';
import { usePulseOximeter, PULSE_CHIPS } from '../lib/usePulseOximeter.js';

const props = defineProps({
  name: { type: String, required: true }, // a PULSE_CHIPS name
});

const WINDOW_MS = 8000;
const RAW_SPAN = 1000;
const BEAT = [{ label: 'heartbeat (IR ripple)', color: '--series-2' }];
const RAW = [{ label: 'red', color: '--series-2' }, { label: 'IR', color: '--series-1' }];

const m = reactive(usePulseOximeter(props.name, { windowMs: WINDOW_MS }));
const r = computed(() => m.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ name }}</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        <slot name="intro" />
      </p>
    </div>

    <figure :class="card">
      <slot name="board" />
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="m.state !== 'running'" :busy="m.state === 'connecting'" @connect="m.connect">{{ m.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="m.disconnect" />
      <span v-if="m.state === 'running'" class=" font-mono text-sm text-slate-500 dark:text-slate-400">0x57 · 100 samples/s</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="m.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ m.failure.title }}</p>
      <p v-if="m.failure.detail" class="mt-1">{{ m.failure.detail }}</p>
      <p v-if="m.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ m.failure.error }}</p>
    </div>

    <p v-if="m.state === 'running' && r && !r.finger" class="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100">
      Rest a fingertip on the sensor, the small window between the LEDs, and keep still: pressing hard squeezes the blood out, too lightly lets the room's light in.
    </p>

    <div class="grid grid-cols-3 gap-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Heart rate</p>
        <p class="font-mono text-2xl tabular-nums">{{ r?.bpm ? Math.round(r.bpm) : '—' }} <span class="text-base">bpm</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Red/IR ratio R</p>
        <p class="font-mono text-2xl tabular-nums">{{ r?.ratio ? r.ratio.toFixed(2) : '—' }}</p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Its die</p>
        <p class="font-mono text-2xl tabular-nums">{{ r?.temperature != null ? r.temperature.toFixed(1) : '—' }} <span class="text-base">°C</span></p>
      </section>
    </div>

    <CollapsibleCard id="the-heartbeat" title="The heartbeat">
      <LiveChart title="The heartbeat" unit="counts" :series="BEAT" :values="[]" :source="m.beatSource" :window-ms="WINDOW_MS" :floor="PULSE_CHIPS[name].beatSpan" :digits="0" fit />
    </CollapsibleCard>
    <CollapsibleCard id="the-light-it-reads" title="The light it reads">
      <LiveChart title="The light it reads" unit="counts" :series="RAW" :values="r ? [r.red, r.ir] : []" :source="m.rawSource" :window-ms="WINDOW_MS" :floor="RAW_SPAN" :digits="0" fit />
    </CollapsibleCard>

    <CollapsibleCard id="what-it-sees" title="What it sees" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">What it sees</h2>
      <SvgDrawing src="/ppg-sensing.svg" alt="A fingertip over the sensor: the red and infrared LEDs shine into the skin, light scatters through tissue and blood, and what isn't absorbed comes back to the photodiode" class="mx-auto mb-3 w-full max-w-xl" />
      <p class="mb-2">
        <b>Light through a fingertip.</b> <slot name="light" /> A fingertip sends most of the light back: the second chart jumps.
        Most of that is steady: skin, bone, the blood that stays. On top of it rides a small ripple: each heartbeat pushes a little more blood into the fingertip, which absorbs a little more light.
      </p>
      <SvgDrawing src="/ppg-beat.svg" alt="An artery widening as each beat passes, and below it in time the heartbeat signal: a fast rise as the beat arrives, a small notch as the heart's valve closes, a slow fall to the next beat" class="mx-auto mb-3 w-full max-w-xl" />
      <p class="mb-2">
        <b>The heartbeat</b> is that ripple alone: the slow level taken off (a moving average over 1.5 s) and turned upside down, so more blood is a peak up: each beat a fast rise, often a small notch as the heart's valve closes, then a slow fall. The rate is the spacing of the last few peaks. Breathe slowly and the level drifts with your breath too.
      </p>
      <p>
        <b>Two colours for oxygen.</b> Blood full of oxygen absorbs less red light and a little more infrared than blood without. A pulse oximeter compares the ripple in the two colours, each over its own level: <span class="font-mono">R = (AC<sub>red</sub> / DC<sub>red</sub>) / (AC<sub>IR</sub> / DC<sub>IR</sub>)</span>. R falls as saturation rises; turning it into a percentage takes a curve calibrated against people's blood, which this page doesn't have, so it shows R and no percentage. Not a medical device.
      </p>
      <slot name="more" />
    </CollapsibleCard>
  </main>
</template>
