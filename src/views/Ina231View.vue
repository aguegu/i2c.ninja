<script setup>
// The INA231 live on the CH341 bridge: the voltage, current and power
// through its shunt, an energy meter, and how the chip measures
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useIna231 } from '../lib/useIna231.js';

const WINDOW_MS = 10000;
// the charts' least spans (fit: the range follows the data): a change smaller
// than these doesn't fill the chart
const CURRENT_SPAN_MA = 2;
const POWER_SPAN_MW = 10;
const BUS_SPAN_V = 0.05;
const SHUNTS = [{ ohms: 0.1, mark: 'R100' }, { ohms: 0.01, mark: 'R010' }, { ohms: 0.002, mark: 'R002' }];
const CURRENT = [{ label: 'current', color: '--series-1' }];
const POWER = [{ label: 'power', color: '--series-2' }];
const BUS = [{ label: 'bus', color: '--series-3' }];

// the INA231's limits (datasheet SBOS644D, 6.3 and 6.5): the shunt voltage
// +/-81.92 mV at 2.5 uV a count; IN+, IN- and Bus 0-28 V (the ADC's scale goes
// to 40.96 V: never apply more than 28); Vdd 2.7-5.5 V
const SHUNT_FULL_SCALE_V = 0.08192;
const SHUNT_V_PER_COUNT = 2.5e-6;
const COMMON_MODE_MAX_V = 28;
const REGISTER_MAX = 32767; // the Current register, signed 16 bits
const POWER_STEPS_PER_CURRENT_STEP = 25;

const ina = reactive(useIna231({ windowMs: WINDOW_MS }));
// the current it can measure with the shunt chosen: the shunt's voltage or
// the Current register's span, whichever is smaller
const range = computed(() => {
  const r = Number(ina.shunt);
  const lsb = ina.currentLsb ?? 0.0001; // the driver's default until connected
  const byShunt = SHUNT_FULL_SCALE_V / r, byRegister = REGISTER_MAX * lsb;
  const max = Math.min(byShunt, byRegister);
  return {
    max, limitedBy: byShunt <= byRegister ? 'shunt' : 'register', byShunt, byRegister,
    step: lsb, shuntStep: SHUNT_V_PER_COUNT / r, powerStep: POWER_STEPS_PER_CURRENT_STEP * lsb,
    powerMax: COMMON_MODE_MAX_V * max, heat: max * max * r,
  };
});
const amps = (a) => (a >= 1 ? `${a.toFixed(2)} A` : a >= 0.001 ? `${(a * 1000).toFixed(1)} mA` : `${(a * 1e6).toFixed(0)} µA`);
const watts = (w) => (w >= 1 ? `${w.toFixed(1)} W` : `${(w * 1000).toFixed(1)} mW`);
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
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A current and power monitor: put its shunt resistor in series with a load, and it measures the voltage across the shunt and the voltage on the load's side, and works out the current and power from them. Live over a USB-to-I²C bridge.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-ina231.svg" alt="A CH341T bridge wired SDA, SCL, GND and VCC to an INA231 module; the module's shunt in series between a supply and a load: supply plus to IN+, IN minus to the load, the load's minus back to the supply's, joined to Gnd; Bus to IN minus" class="mx-auto w-full" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The common blue INA231 board. Four wires to the bridge as for any I2C device; the current to measure through the shunt, between the supply's + and the load (high side), the supply's − joined to Gnd. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="ina.state !== 'running'" :busy="ina.state === 'connecting'" @click="ina.connect">{{ ina.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="ina.disconnect" />
      <label :class="field">Shunt
        <select :value="ina.shunt" :class="select" @change="ina.setShunt(Number($event.target.value))">
          <option v-for="s in SHUNTS" :key="s.ohms" :value="s.ohms">{{ s.mark }} ({{ s.ohms }} Ω)</option>
        </select>
      </label>
      <span v-if="ina.state === 'running'" class=" font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
        {{ hex(ina.address) }} · {{ ina.rate.toFixed(0) }} readings/s
      </span>
      <LiveSettings class="ml-auto" />
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

    <CollapsibleCard id="current" title="Current">
      <LiveChart title="Current" unit="mA" :series="CURRENT" :values="r ? [r.current * 1000] : []" :source="ina.currentSource" :window-ms="WINDOW_MS" :floor="CURRENT_SPAN_MA" :digits="1" fit />
    </CollapsibleCard>
    <CollapsibleCard id="bus-voltage" title="Bus voltage">
      <LiveChart title="Bus voltage" unit="V" :series="BUS" :values="r ? [r.bus] : []" :source="ina.busSource" :window-ms="WINDOW_MS" :floor="BUS_SPAN_V" :digits="3" fit />
    </CollapsibleCard>
    <CollapsibleCard id="power" title="Power">
      <LiveChart title="Power" unit="mW" :series="POWER" :values="r ? [r.power * 1000] : []" :source="ina.powerSource" :window-ms="WINDOW_MS" :floor="POWER_SPAN_MW" :digits="1" fit />
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">What it can measure, with the {{ SHUNTS.find((x) => x.ohms === Number(ina.shunt))?.mark }} shunt</h2>
      <table class="mb-3 w-full text-sm">
        <tbody class="[&_td]:py-1 [&_td]:pr-4 [&_td:first-child]:text-slate-500 dark:[&_td:first-child]:text-slate-400">
          <tr><td>Current</td><td class="font-mono">up to ±{{ amps(range.max) }}</td><td>limited by the {{ range.limitedBy === 'shunt' ? `shunt: ±81.92 mV / ${ina.shunt} Ω` : `Current register: ${REGISTER_MAX} steps of ${amps(range.step)}` }}{{ range.limitedBy === 'shunt' ? ` (the register would go to ±${amps(range.byRegister)})` : ` (the shunt would allow ±${amps(range.byShunt)})` }}</td></tr>
          <tr><td>Current step</td><td class="font-mono">{{ amps(range.step) }}</td><td>the Current register's (the shunt voltage itself resolves {{ amps(range.shuntStep) }})</td></tr>
          <tr><td>Voltage</td><td class="font-mono">0 to 28 V</td><td>on IN+, IN− and Bus alike, in 1.25 mV steps: never more (30 V breaks it), never below Gnd</td></tr>
          <tr><td>Power step</td><td class="font-mono">{{ watts(range.powerStep) }}</td><td>25 current steps a count: the chip's power moves in these jumps</td></tr>
          <tr><td>Power, at most</td><td class="font-mono">{{ watts(range.powerMax) }}</td><td>28 V at full current</td></tr>
          <tr><td>The shunt's heat</td><td class="font-mono">{{ watts(range.heat) }}</td><td>at full current (I² × R): what the resistor must take</td></tr>
        </tbody>
      </table>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        The chip itself runs from the bridge's 3.3 V (Vdd 2.7-5.5 V); what it measures has its own supply, up to 28 V, its − joined to Gnd. A bigger current wants a smaller shunt: a R010 reaches ±3.28 A here, limited then by the Current register's steps.
      </p>
    </section>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
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
    </CollapsibleCard>
  </main>
</template>
