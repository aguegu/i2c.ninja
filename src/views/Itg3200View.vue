<script setup>
// The ITG-3200 live on the CH341 dongle: its three rates, the turn they
// add up to, its bias zeroed out, and how a vibrating mass feels a turn
import { reactive, computed } from 'vue';
import GyroViews from '../components/GyroViews.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import SpecTable from '../components/SpecTable.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useItg3200 } from '../lib/useItg3200.js';
import { useTurned } from '../lib/useTurned.js';

const WINDOW_MS = 10000;
// its settings, from its product specification (rev 1.4's register map,
// rev 1.7's figures), and the ones this page picks (atiic's driver)
const SPECS = [
  ['Range', '±2000 °/s, its only full scale', '±2000 °/s, 14.375 counts a °/s'],
  ['Filter', 'a low-pass of 256, 188, 98, 42, 20, 10 or 5 Hz', '98 Hz'],
  ['Sample rate', '8 kHz (256 Hz filter) or 1 kHz, divided down as far as 3.9 a second', '1 kHz, read 100 times a second'],
  ['Clock', 'its own oscillator, a gyro\'s, or an external 32.768 kHz or 19.2 MHz', 'the X gyro\'s, as its maker recommends'],
  ['Address', '0x68, or 0x69 with AD0 high', '0x68 or 0x69, whichever answers'],
  ['Interface', 'I2C, up to 400 kHz', 'I2C, 400 kHz'],
  ['Extras', 'a temperature sensor; a data-ready interrupt', 'the temperature'],
];

const gyro = reactive(useItg3200({ windowMs: WINDOW_MS }));
const turned = reactive(useTurned(gyro.onReading));
const g = computed(() => gyro.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">ITG-3200</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        InvenSense's 3-axis gyroscope: how fast it's turning, in degrees a second, about three axes, and its own temperature. Live over the CH341 dongle, 100 readings a second.
        New to these numbers? <RouterLink to="/learn/motion" class="text-emerald-700 underline dark:text-emerald-400">Take the Motion course</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-itg3200.svg" alt="A CH341T dongle wired to a blue ITG-3200 module whose pins run SCL, SDA, CLK, INT, GND, VIO, VDD: VCC to VDD, GND to GND, SCL to SCL, SDA to SDA, a short jumper from VIO to VDD; INT and CLK free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC to VDD, GND, SCL and SDA. VIO sets the chip's I/O voltage and must be powered: tie it to VDD unless the board already does. INT and CLK stay free; AD0 as shipped picks 0x68. The axes printed on it are the ones read below. New to the dongle? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="gyro.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="gyro.state === 'connecting'" @click="gyro.connect">
        {{ gyro.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="gyro.disconnect">Stop</button>
      <span v-if="gyro.state === 'running'" class="font-mono text-sm tabular-nums">itself {{ gyro.temperature?.toFixed(1) ?? '—' }} °C</span>
      <span v-if="gyro.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(gyro.address) }} · 400 kHz · ±2000 °/s · 98 Hz filter</span>
    </section>
    <div v-if="gyro.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ gyro.failure.title }}</p>
      <p v-if="gyro.failure.detail" class="mt-1">{{ gyro.failure.detail }}</p>
      <p v-if="gyro.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ gyro.failure.error }}</p>
    </div>

    <GyroViews :g="g" :turned="turned" :source="gyro.source" :running="gyro.state === 'running'" :window-ms="WINDOW_MS" />

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://invensense.tdk.com" class="text-sm text-emerald-700 underline dark:text-emerald-400">InvenSense (TDK)</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/rotation" class="text-emerald-700 underline dark:text-emerald-400">Rotation and the gyroscope</RouterLink>
      </p>
    </section>
  </main>
</template>
