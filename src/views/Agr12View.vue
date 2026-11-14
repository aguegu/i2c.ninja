<script setup>
// The AGR12 / AGN12 / AGP12 (I2C version) live on the bridge: gauge pressure,
// the pressure in its port over the room's; not identifiable (the page is its
// name), the bus at 20 kHz; how it's read, its settings from Aosong's manual
// (AGR12\AGN12\AGP12 series, 2026-05)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import LiveChart from '../components/LiveChart.vue';
import SpecTable from '../components/SpecTable.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useAgr12 } from '../lib/useAgr12.js';

const WINDOW_MS = 120000;
const PRESSURE_SPAN_KPA = 1; // the chart's least span: 10 of its 0.1 kPa steps
const PRESSURE = [{ label: 'pressure', color: '--series-1' }];
// its settings, from Aosong's manual (2026-05; Tables 1, 3, 4, 6 and section 7), and the ones this page uses
const SPECS = [
  ['Range', 'by part: AGR12 0-40 to 0-1000 kPa; AGN12 -40 or -100 to 0 kPa; AGP12 ±40 or ±100 kPa (gauge: over the room\'s air)', 'all of it'],
  ['Accuracy', '±1.5 % of the span (linearity, repeatability and hysteresis together); ±1 % of the span a year', 'as it comes'],
  ['Resolution', '16 bits inside; 0.1 kPa out', '0.1 kPa'],
  ['Overload', '5 times the full scale (up to 40 kPa), 2 times (100 kPa and over)', '-'],
  ['Medium', 'non-corrosive gas, humid gas, liquids (the 2024 edition: dry air only); keep light off the sensor chip', 'air'],
  ['Temperature', 'compensated 20 to 40 °C; works -20 to 85 °C', '-'],
  ['Address', '0x50, fixed', '0x50'],
  ['Interface', 'I2C up to 30 kHz (the 2024 edition: 100 kHz; at 100 kHz ours read wrong), 4.7 kΩ pull-ups on the board; or the analog version, 0.5 to 4.5 V', 'I2C, 20 kHz'],
  ['Supply', 'I2C version 3 to 5.25 V (3.3 or 5 V typical), about 4.2 mA; the analog version 4.75 to 5.25 V', '3.3 V'],
];

const p = reactive(useAgr12({ windowMs: WINDOW_MS }));
const r = computed(() => p.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">AGR12 / AGN12 / AGP12</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Aosong's gauge pressure sensors: the pressure in a tube over the room's air, positive (AGR12), vacuum (AGN12) or both (AGP12). Blow into it, suck on it, squeeze a bulb. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-agr12.svg" alt="A CH341T bridge wired to an AGR12 seen from its six pins, the port on the other side: VCC to pin 1 beside the dot, GND to pin 2, SCL to pin 3, SDA to pin 4; pins 5 and 6 free" class="mx-auto w-full lg:w-4/5" />
      <figcaption class="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">The I2C version, its part code ending in C (AGP12-040C, AGR12-100C …): pin 1 VCC, 2 GND, 3 SCL, 4 SDA; 5 and 6 free (its manual, Table 4). VCC to the bridge's 3.3 V: the I2C version takes 3 to 5.25 V, and its own 4.7 kΩ pull-ups hold SCL and SDA at its supply, so 3.3 V keeps the bridge's pins at theirs. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.</figcaption>
      <p class="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        <b>Nothing else at 0x50.</b> An AT24C EEPROM answers there too, and nothing read tells the two apart, so this page doesn't look: it takes what answers at 0x50 for the sensor and sends its measurement command, which a small EEPROM would take as a byte to store. It stops if 0x51-0x53 answer (a bigger EEPROM), but an AT24C01 or 02 sits at 0x50 alone. <b>Not on WCH's CH347F EVT board</b>: its own 24C02 is at 0x50, on the bridge itself. Ours took the command into its byte 0xAC from the first reading.
      </p>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @click="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(p.address) }}, 20 kHz</span>
      <span v-if="p.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${p.failed.count} of ${p.failed.of} readings didn't come through and were skipped; the last: ${p.failed.last}`">· {{ p.failed.count }} {{ p.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <section :class="card">
      <p class="text-sm text-slate-500 dark:text-slate-400">Gauge pressure</p>
      <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.pressure, 1) }} <span class="text-base">kPa</span></p>
    </section>

    <CollapsibleCard id="pressure" title="Gauge pressure">
      <LiveChart title="Gauge pressure" unit="kPa" :series="PRESSURE" :values="r ? [r.pressure] : []" :source="p.pressureSource" :window-ms="WINDOW_MS" :floor="PRESSURE_SPAN_KPA" :digits="1" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Open to the room it reads 0 (give or take 0.1 kPa): gauge pressure is the difference from the air around it, not the air's own weight (that's an absolute sensor's, the <RouterLink to="/spl06" :class="link">SPL06</RouterLink>'s, about 101 kPa). A breath into a tube on its port pushes a few kPa; sucking on it pulls below 0, which only an AGN12 or AGP12 shows.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="reading-it" title="Reading it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Reading it</h2>
      <p class="mb-2">
        Two chips on a small board: a pressure sensor and one that corrects its offset, sensitivity, temperature drift and curve. Over I2C it takes one command, two bytes (0xAC 0x12): its manual asks 80 ms before the answer, three bytes: the pressure in tenths of a kPa, high byte first and signed, then the two XORed as a check. A result reads once: read again and it answers 0xFF 0xFF 0xFF, which the check refuses. So atiic sends the command, waits the 80 ms, reads: about 11 readings a second.
      </p>
      <p>
        <b>Slow:</b> its manual (2026) allows the bus 30 kHz at most, where most sensors take 100 or 400 kHz (its 2024 edition said 100 kHz), so this page runs the bridge at 20 kHz, the CH341's and CH347's slowest. Faster, it doesn't just fail: on our bench, on a CH347T at 3.3 V, open to the room, at 100 kHz it read 25.5 kPa in 6 of 50 tries, wrong, and the check passed (0x00 0xFF 0xFF); 33 more failed the check. At 400 kHz none of 50 read. At 20 kHz 48 of 50 read 0 or −0.1 kPa, and the 2 the check refused are skipped. <b>No ID:</b> read without a command it answers 0xFF, as a blank EEPROM does; hence the warning above.
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
