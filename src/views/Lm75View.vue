<script setup>
// The LM75 live on a bridge: its temperature, its thermal watchdog's limits,
// and how a chip measures its own temperature; no wiring drawing yet
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { canConnect, hex } from '../lib/dongle.js';
import { useLm75 } from '../lib/useLm75.js';

const WINDOW_MS = 120000;
const SPAN_C = 2;
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));

const t = reactive(useLm75({ windowMs: WINDOW_MS }));
const series = [{ label: 'temperature', color: '--series-2' }];
const r = computed(() => t.latest);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">LM75</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The classic I²C temperature sensor, made by many since the 1990s: the temperature in half-degree steps, and a thermal watchdog, a pin that trips when it gets too hot, to switch on a fan or shut a system down. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <figcaption class="text-sm text-slate-500 dark:text-slate-400">
        Its module's pins: VCC to 3.3 V (it runs from 3 to 5.5 V, but at 5 V its inputs want 3.5 V for a high, more than a 3.3 V bridge gives), GND, SCL to SCL, SDA to SDA; A0, A1, A2 pick its address, 0x48 to 0x4F, and must be tied to GND or VCC, not left open; OS is the watchdog's output. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="t.state !== 'running'" :busy="t.state === 'connecting'" @connect="t.connect">{{ t.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="t.disconnect" />
      <span v-if="t.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(t.address) }} · a reading every 0.3 s</span>
      <span v-if="t.skipped" class="text-sm text-slate-400 dark:text-slate-500">· {{ t.skipped }} {{ t.skipped === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="t.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ t.failure.title }}</p>
      <p v-if="t.failure.detail" class="mt-1">{{ t.failure.detail }}</p>
      <p v-if="t.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ t.failure.error }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
        <p class="font-mono text-4xl tabular-nums">{{ fmt(r) }} <span class="text-lg">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Trips at (T<sub>OS</sub>)</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(t.limits?.overtemperature) }} <span class="text-base">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Clears below (T<sub>HYST</sub>)</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(t.limits?.hysteresis) }} <span class="text-base">°C</span></p>
      </section>
    </div>

    <CollapsibleCard id="temperature" title="Temperature">
      <LiveChart title="Temperature" unit="°C" :series="series" :values="r !== null && r !== undefined ? [r] : []" :source="t.source" :window-ms="WINDOW_MS" :floor="SPAN_C" :digits="1" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Hold the chip between two fingers: it climbs half a degree at a time, and falls back slowly when you let go.</p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>Its own temperature.</b> A silicon junction's voltage changes with temperature by a steady amount, about 2 mV a degree; the chip compares it with a voltage that doesn't (a band-gap reference) and converts the difference, every 100 ms or so, to 9 bits: half a degree a step, −55 to +125 °C, within ±2 °C. What it measures is its own silicon, so mostly the circuit board it sits on: the heat reaches it through its leads.
      </p>
      <p class="mb-2">
        <b>Two bytes, two's complement:</b> the temperature register holds the 9 bits at the top of 16. 0x1900 is +25 °C, 0xE700 is −25 °C (negative numbers count down from 0x10000). The last seven bits are "don't care". Many modules sold as LM75 carry an LM75A or a clone that fills them in, 0.125 °C a step; this page reads the original's 9.
      </p>
      <p class="mb-2">
        <b>The watchdog:</b> its OS pin goes active when the temperature rises over T<sub>OS</sub> (80 °C from power-up) and clears when it falls below T<sub>HYST</sub> (75 °C): the gap, hysteresis, keeps it from chattering around one value, as a thermostat does. It works without any host, so a board can switch its fan on by itself. Readings over the limit can be counted first (1, 2, 4 or 6 in a row) against noise.
      </p>
      <p>
        <b>No ID:</b> unlike most chips here, it has no register that says what it is. atiic checks what its datasheet guarantees (three bits always 0, every temperature in range), after looking for chips with an ID at the same addresses (the <RouterLink to="/cht8305" :class="link">CHT8305C</RouterLink> and the <RouterLink to="/ina231" :class="link">INA231</RouterLink>), and on connecting writes its power-up settings back, as it has no reset command.
      </p>
    </CollapsibleCard>
  </main>
</template>
