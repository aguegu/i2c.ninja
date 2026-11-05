<script setup>
// The INA231 live on the CH341 dongle: the voltage, current and power
// through its shunt, an energy meter, and how the chip measures
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useIna231 } from '../lib/useIna231.js';

const WINDOW_MS = 10000;
const SHUNTS = [{ ohms: 0.1, mark: 'R100' }, { ohms: 0.01, mark: 'R010' }, { ohms: 0.002, mark: 'R002' }];
const CURRENT = [{ label: 'current', color: '--series-1' }];
const POWER = [{ label: 'power', color: '--series-2' }];
const BUS = [{ label: 'bus', color: '--series-3' }];

const ina = reactive(useIna231({ windowMs: WINDOW_MS }));
const r = computed(() => ina.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const tile = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">INA231</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        A current and power monitor: put its shunt resistor in series with a load, and it measures the voltage across the shunt and the voltage on the load's side, and works out the current and power from them. Live over the CH341 dongle.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="ina.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="ina.state === 'connecting'" @click="ina.connect">
        {{ ina.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="ina.disconnect">Stop</button>
      <label :class="field">Shunt
        <select :value="ina.shunt" :class="select" @change="ina.setShunt(Number($event.target.value))">
          <option v-for="s in SHUNTS" :key="s.ohms" :value="s.ohms">{{ s.mark }} ({{ s.ohms }} Ω)</option>
        </select>
      </label>
      <span v-if="ina.state === 'running'" class="ml-auto font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
        {{ hex(ina.address) }} · {{ ina.rate.toFixed(0) }} readings/s
      </span>
    </section>
    <div v-if="ina.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ ina.failure.title }}</p>
      <p v-if="ina.failure.detail" class="mt-1">{{ ina.failure.detail }}</p>
      <p v-if="ina.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ ina.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Bus voltage</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.bus, 3) }} <span class="text-base">V</span></p>
      </section>
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Current</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r && r.current * 1000, 1) }} <span class="text-base">mA</span></p>
      </section>
      <section :class="tile">
        <p class="text-sm text-slate-500 dark:text-slate-400">Power</p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r && r.power * 1000, 1) }} <span class="text-base">mW</span></p>
      </section>
      <section :class="tile">
        <p class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          Used since {{ ina.energy.since ? ina.energy.since.toLocaleTimeString() : '—' }}
          <button v-if="ina.state === 'running'" class="text-xs underline" @click="ina.resetEnergy">reset</button>
        </p>
        <p class="font-mono text-lg tabular-nums">{{ (ina.energy.wh * 1000).toFixed(3) }} mWh</p>
        <p class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">{{ (ina.energy.ah * 1000).toFixed(3) }} mAh</p>
      </section>
    </div>

    <section :class="card">
      <LiveChart title="Current" unit="mA" :series="CURRENT" :values="r ? [r.current * 1000] : []" :source="ina.currentSource" :window-ms="WINDOW_MS" :floor="20" :digits="1" />
    </section>
    <section :class="card">
      <LiveChart title="Power" unit="mW" :series="POWER" :values="r ? [r.power * 1000] : []" :source="ina.powerSource" :window-ms="WINDOW_MS" :floor="100" :digits="1" />
    </section>
    <section :class="card">
      <LiveChart title="Bus voltage" unit="V" :series="BUS" :values="r ? [r.bus] : []" :source="ina.busSource" :window-ms="WINDOW_MS" :floor="6" :digits="3" />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>Ohm's law across the shunt.</b> The current flows through a small, precise resistor, the shunt. The chip measures the tiny voltage across it, and current is that voltage over the resistance:
        <span class="font-mono">I = V<sub>shunt</sub> / R<sub>shunt</sub></span>.
        Right now: <span class="font-mono">{{ fmt(r && r.shunt * 1000, 4) }} mV / {{ ina.shunt }} Ω = {{ fmt(r && (r.shunt / ina.shunt) * 1000, 1) }} mA</span>.
        A small shunt wastes little power, but gives a small voltage to measure: the chip resolves 2.5 µV a count, up to ±81.9 mV.
      </p>
      <p class="mb-2">
        <b>The bus voltage</b> is measured on its own pin, 1.25 mV a count, up to 28 V (the INA226, its larger sibling, to 36 V). Power is bus voltage times current:
        <span class="font-mono">{{ fmt(r?.bus, 3) }} V × {{ fmt(r && r.current * 1000, 1) }} mA = {{ fmt(r && r.bus * r.current * 1000, 1) }} mW</span>.
      </p>
      <p class="mb-2">
        <b>The chip does the arithmetic too,</b> once told the shunt through its Calibration register: <span class="font-mono">CAL = 0.00512 / (Current_LSB × R<sub>shunt</sub>)</span> (its datasheet's Equation 1).
        Here the current is counted in steps of <span class="font-mono">{{ ina.currentLsb ? (ina.currentLsb * 1000).toFixed(1) : '—' }} mA</span>,
        so <span class="font-mono">CAL = {{ ina.calibration ?? '—' }}</span>, and each power count is 25 current steps.
        The tiles show the chip's own current and power; the lines above check them by hand.
      </p>
      <p>
        <b>The energy meter</b> adds up power × time between readings: what a battery would have given to the load since you connected (or reset). mAh is the same for charge, the figure on battery labels.
      </p>
    </section>
  </main>
</template>
