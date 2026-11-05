<script setup>
// The MAX30102 live on the CH341 dongle: a fingertip's light, its heartbeat
// worked out, and how a pulse oximeter starts from two colours of light
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb } from '../lib/dongle.js';
import { useMax30102 } from '../lib/useMax30102.js';

const WINDOW_MS = 8000;
const BEAT_SPAN = 100; // counts: the ripple's least span, so noise isn't a pulse
const RAW_SPAN = 1000;
const BEAT = [{ label: 'heartbeat (IR ripple)', color: '--series-2' }];
const RAW = [{ label: 'red', color: '--series-2' }, { label: 'IR', color: '--series-1' }];

const m = reactive(useMax30102({ windowMs: WINDOW_MS }));
const r = computed(() => m.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">MAX30102</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        A pulse oximeter and heart-rate sensor, the kind in a smartwatch or a fingertip clip: a red and an infrared LED shine into the skin, a photodiode reads the light that comes back, and each heartbeat shows in it. Live over the CH341 dongle.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <img src="/setup-max30102.svg" alt="A CH341T dongle wired to a black MAX30102 module: GND to GND, SCL to SCL, SDA to SDA, VCC (3.3 V) to VIN; INT, IRD, RD free" class="mx-auto w-full rounded-lg bg-white lg:w-3/5 dark:bg-transparent">
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The common black MAX30102 board: four wires from its row of GND, SCL, SDA, VIN (3.3 or 5 V: the board makes the chip's 1.8 V and the LEDs' 3.3 V itself); INT, IRD, RD (the LEDs' own) and the other GND stay free.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="m.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="m.state === 'connecting'" @click="m.connect">
        {{ m.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="m.disconnect">Stop</button>
      <span v-if="m.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">0x57 · 100 samples/s</span>
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

    <section :class="card">
      <LiveChart title="The heartbeat" unit="counts" :series="BEAT" :values="[]" :source="m.beatSource" :window-ms="WINDOW_MS" :floor="BEAT_SPAN" :digits="0" fit />
    </section>
    <section :class="card">
      <LiveChart title="The light it reads" unit="counts" :series="RAW" :values="r ? [r.red, r.ir] : []" :source="m.rawSource" :window-ms="WINDOW_MS" :floor="RAW_SPAN" :digits="0" fit />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What it sees</h2>
      <img src="/ppg-sensing.svg" alt="A fingertip over the sensor: the red and infrared LEDs shine into the skin, light scatters through tissue and blood, and what isn't absorbed comes back to the photodiode" class="mx-auto mb-3 w-full max-w-xl rounded-lg bg-white dark:bg-transparent">
      <p class="mb-2">
        <b>Light through a fingertip.</b> The LEDs, red at 660 nm and infrared at 880 nm (its datasheet), pulse 100 times a second; the photodiode counts the light that scatters back (18 bits, up to 262,143). Bare, it sees little (a few thousand counts); a fingertip sends most of it back: the second chart jumps.
        Most of that is steady: skin, bone, the blood that stays. On top of it rides a small ripple: each heartbeat pushes a little more blood into the fingertip, which absorbs a little more light.
      </p>
      <img src="/ppg-beat.svg" alt="An artery widening as each beat passes, and below it in time the heartbeat signal: a fast rise as the beat arrives, a small notch as the heart's valve closes, a slow fall to the next beat" class="mx-auto mb-3 w-full max-w-xl rounded-lg bg-white dark:bg-transparent">
      <p class="mb-2">
        <b>The heartbeat</b> is that ripple alone: the slow level taken off (a moving average over 1.5 s) and turned upside down, so more blood is a peak up: each beat a fast rise, often a small notch as the heart's valve closes, then a slow fall. The rate is the spacing of the last few peaks. Breathe slowly and the level drifts with your breath too.
      </p>
      <p>
        <b>Two colours for oxygen.</b> Blood full of oxygen absorbs less red light and a little more infrared than blood without. A pulse oximeter compares the ripple in the two colours, each over its own level: <span class="font-mono">R = (AC<sub>red</sub> / DC<sub>red</sub>) / (AC<sub>IR</sub> / DC<sub>IR</sub>)</span>. R falls as saturation rises; turning it into a percentage takes a curve calibrated against people's blood, which this page doesn't have, so it shows R and no percentage. Not a medical device.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        More on the module and the principle: Last Minute Engineers' <a href="https://lastminuteengineers.com/max30102-pulse-oximeter-heart-rate-sensor-arduino-tutorial/" class="underline">MAX30102 tutorial</a>.
      </p>
    </section>
  </main>
</template>
