<script setup>
// The QMC5883L live on a bridge: Earth's field on three axes, a compass from
// it (held level), the board's own field calibrated out (MagnetometerViews),
// its settings; its wiring drawn (ch32v00x scripts/wiring/ch341t-qmc5883l.py)
import LiveSettings from '../components/LiveSettings.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import { reactive } from 'vue';
import MagnetometerViews from '../components/MagnetometerViews.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { canConnect } from '../lib/dongle.js';
import { useQmc5883l, RATE_HZ } from '../lib/useQmc5883l.js';
import { useHardIron } from '../lib/useHardIron.js';

const WINDOW_MS = 30000;
// its settings, from its datasheet (QST-PD-B002-22 Rev. B), and the ones this page picks
const SPECS = [
  ['Range', '±2 gauss (12000 counts a gauss) or ±8 gauss (3000)', '±2 gauss: Earth\'s field is under 0.65'],
  ['Oversampling', '64, 128, 256 or 512: more is less noise, more current', '512'],
  ['Rate', '10, 50, 100 or 200 readings a second', `${RATE_HZ} a second`],
  ['Mode', 'continuous or standby', 'continuous; standby when stopped'],
  ['Address', '0x0D only', '0x0D'],
  ['Interface', 'I2C, up to 400 kHz', 'I2C, 400 kHz'],
  ['Extras', 'a temperature sensor (relative: its offset isn\'t calibrated); a data-ready pin', '—'],
];

const mag = reactive(useQmc5883l());
const cal = reactive(useHardIron(mag.onReading, { windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">QMC5883L</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        QST's 3-axis magnetometer: Earth's magnetic field, in microtesla, along three axes, so a compass. What most "GY-271 / HMC5883L" modules carry now. Live over a USB-to-I²C bridge, {{ RATE_HZ }} readings a second.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-qmc5883l.svg" alt="A CH341T bridge on 3.3 V wired to a blue QMC5883L module (GY-271, SY-152 on its back) seen from its back, turned half round, its pins DRDY, SDA, SCL, GND, VCC beside the bridge's: SDA to SDA, SCL to SCL, GND to GND, VCC to VCC, four straight wires; DRDY free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The blue GY-271 board, drawn from its back turned half round, so its printing reads upside down: four straight wires, VCC (3.3 V), GND, SCL, SDA; DRDY stays free. The X, Y, Z arrows printed on its front are the axes read below: X its nose, Y to the left, Z out of the board. Keep it away from steel, magnets and the laptop: they add their own fields. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="mag.state === 'idle' || mag.state === 'connecting'" :busy="mag.state === 'connecting'" @connect="mag.connect">{{ mag.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="mag.disconnect" />
      <span v-if="mag.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">0x0D · 400 kHz · ±2 gauss · {{ RATE_HZ }} Hz</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="mag.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ mag.failure.title }}</p>
      <p v-if="mag.failure.detail" class="mt-1">{{ mag.failure.detail }}</p>
      <p v-if="mag.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ mag.failure.error }}</p>
    </div>

    <MagnetometerViews :cal="cal" :running="mag.state === 'running'" :window-ms="WINDOW_MS" />

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">An HMC5883L, or not</h2>
      <p class="mb-2">
        Honeywell's <RouterLink to="/hmc5883l" :class="link">HMC5883L</RouterLink> was the compass on hobby boards for years; when it went out of production, QST's QMC5883L took its place on the same modules, often still printed "HMC5883L". It senses the same way, with magneto-resistive strips (<RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink>), but it is another chip: another address (0x0D, not 0x1E), other registers, 16-bit readings rather than 12, and no self test.
      </p>
      <p>
        <b>Which one is yours?</b> The address says: a chip at 0x0D is a QMC5883L, one at 0x1E an HMC5883L. And the QMC5883L has no real ID register: its only one, 0x0D, reads 0xFF, which an absent register often does too, so the address is what atiic goes by.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.qstcorp.com" :class="['text-sm', link]">QST</a>
      </div>
      <SpecTable :rows="SPECS" />
      <p class="mt-3 text-sm">
        <b>See also:</b> <RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink>, <RouterLink to="/algorithms/compass" :class="link">the tilt-compensated compass</RouterLink>
      </p>
    </section>
  </main>
</template>
