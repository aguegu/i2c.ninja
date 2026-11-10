<script setup>
// Physics: air pressure and height. Pressure as the weight of the air above,
// how it thins with height (the hydrostatic balance, the gas law, the
// hypsometric equation), height from pressure relative to a "zero here" and
// in the standard atmosphere (lib/pressure.js); weather's highs and lows
// moving the zero, the sensor's limits; from an SPL06 (lib/useSpl06.js), the
// curve drawn with the reading on it, and things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import LiveChart from '../../components/LiveChart.vue';
import TexMath from '../../components/TexMath.vue';
import PressureCurve from '../../components/PressureCurve.vue';
import { ref, reactive, computed } from 'vue';
import { hasWebUsb, hex } from '../../lib/dongle.js';
import { useSpl06, MODES } from '../../lib/useSpl06.js';
import { makeSeries } from '../../lib/series.js';
import { G, P0_PA, heightAbove, isaHeight, pascalsPerMetre } from '../../lib/pressure.js';

const WINDOW_MS = 300000; // five minutes: up and down the stairs, a lift
const FIRST_MODE = 'sports'; // its finest: 0.5 Pa, about 4 cm
const HEIGHT = [{ label: 'height', color: '--series-1' }];
const PRESSURE = [{ label: 'pressure', color: '--series-2' }];
const HEIGHT_SPAN_M = 0.5;
const PRESSURE_SPAN_HPA = 0.1;
const HPA_STEP = 0.1; // the sea-level pressure's input step
const QNH_MIN_HPA = 870; // the lowest sea-level pressure on record (WMO)
const QNH_MAX_HPA = 1085; // the highest (WMO: 1084.8)

const HYDROSTATIC = String.raw`\Delta p = -\rho\, g\, \Delta h`;
const GAS = String.raw`\rho = \frac{p\, M}{R\, T}`;
const HYPSOMETRIC = String.raw`h - h_0 = \frac{R\, T}{M\, g}\, \ln\frac{p_0}{p}`;
const ISA = String.raw`h = \frac{T_0}{L}\left(1 - \left(\frac{p}{p_0}\right)^{\frac{R L}{g M}}\right)`;

// height from the zero: the hypsometric equation at the sensor's temperature
const zero = ref(null); // Pa
const heights = makeSeries(1, WINDOW_MS);
const height = ref(null);
function onReading(t, r) {
  if (zero.value === null) zero.value = r.pressure;
  height.value = heightAbove(r.pressure, zero.value, r.temperature);
  heights.push(t, [height.value]);
}
const p = reactive(useSpl06({ windowMs: WINDOW_MS, mode: FIRST_MODE, onReading }));
const r = computed(() => p.latest);
function zeroHere() {
  if (!r.value) return;
  zero.value = r.value.pressure;
  heights.clear();
  height.value = 0;
}

// the day's sea-level pressure (a weather service's), hPa: height above the sea
const qnh = ref(P0_PA / 100);
const above = computed(() => (r.value ? isaHeight(r.value.pressure, qnh.value * 100) : null));
const perMetre = computed(() => (r.value ? pascalsPerMetre(r.value.pressure, r.value.temperature) : null));
const column = computed(() => (r.value ? r.value.pressure / G / 1000 : null)); // tonnes on a square metre

const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Physics</p>
      <h1 class="text-2xl font-bold">Air pressure and height</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        We live at the bottom of an ocean of air, and its weight presses on everything. Climb, and there's less air above you: the pressure falls, by about 12 Pa for every metre near the ground. A good barometer feels that from a desk to above your head. Here from an <RouterLink to="/spl06" :class="link">SPL06</RouterLink>.
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="p.state !== 'running'" :busy="p.state === 'connecting'" @click="p.connect">{{ p.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="p.disconnect" />
      <button type="button" class="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="!r" @click="zeroHere">Zero here</button>
      <label :class="field">Mode
        <select :value="p.mode" :class="select" @change="p.setMode($event.target.value)">
          <option v-for="[m, label] in MODES" :key="m" :value="m">{{ label }}</option>
        </select>
      </label>
      <span v-if="p.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">SPL06 at {{ hex(p.address) }}</span>
      <span v-if="p.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${p.failed.count} of ${p.failed.of} readings didn't come through and were skipped; the last: ${p.failed.last}`">· {{ p.failed.count }} {{ p.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="p.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ p.failure.title }}</p>
      <p v-if="p.failure.detail" class="mt-1">{{ p.failure.detail }}</p>
      <p v-if="p.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ p.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Air pressure <span class="text-xs">measured</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r ? r.pressure / 100 : null, 2) }} <span class="text-base">hPa</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature <span class="text-xs">measured</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.temperature, 1) }} <span class="text-base">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Height from the zero <span class="text-xs">worked out</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(height, 2) }} <span class="text-base">m</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">A metre of air here <span class="text-xs">worked out</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(perMetre, 1) }} <span class="text-base">Pa</span></p>
      </section>
    </div>

    <CollapsibleCard id="height-from-the-zero" title="Height from the zero" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Height from the zero</h2>
      <div class="flex flex-col gap-4">
        <LiveChart title="Height from the zero" unit="m" :series="HEIGHT" :values="height === null ? [] : [height]" :source="heights.source" :window-ms="WINDOW_MS" :floor="HEIGHT_SPAN_M" :digits="2" fit />
        <LiveChart title="Air pressure" unit="hPa" :series="PRESSURE" :values="r ? [r.pressure / 100] : []" :source="p.pressureSource" :window-ms="WINDOW_MS" :floor="PRESSURE_SPAN_HPA" :digits="2" fit />
      </div>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The zero is the first reading; <b>Zero here</b> sets it again. The two charts are the same line upside down: up is less pressure.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="the-weight-of-the-air" title="The weight of the air" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">The weight of the air</h2>
      <p class="mb-2">
        Air is light, about 1.2 kg in a cubic metre at room temperature, but there are kilometres of it above us. Air pressure is that weight spread over the ground: at sea level about 1013 hPa, 101 325 Pa, the weight of {{ fmt(P0_PA / G / 1000, 1) }} tonnes on every square metre. Here and now it's <b>{{ fmt(column, 2) }} tonnes</b> on a square metre. We don't feel it because it pushes from every side, inside us too.
      </p>
      <p class="mb-2">
        Rise by a small height Δh and you leave a layer of air below you: the pressure falls by that layer's weight, its density ρ times gravity g times its thickness. This is the hydrostatic balance:
      </p>
      <TexMath class="mb-2 block" display :expr="HYDROSTATIC" />
      <p class="mb-2">
        Near sea level that's 1.2 kg/m³ × 9.81 m/s² ≈ 12 Pa a metre: a desk's height is 9 Pa, a storey of a house 35 Pa. The tile above works it out for your air, now.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="thinner-with-height" title="Thinner with height" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Thinner with height</h2>
      <p class="mb-2">
        Unlike water, air squeezes. The gas law gives its density from its pressure p and temperature T (M = 0.02896 kg/mol for dry air, R = 8.314 J/(mol·K), T in kelvin):
      </p>
      <TexMath class="mb-2 block" display :expr="GAS" />
      <p class="mb-2">
        So higher up, with less pressure, the air is thinner, and each metre weighs less. Put the two together and the pressure falls by the same fraction for each step up, not the same amount: an exponential. Turned round, the height between two pressures, at the air's temperature T, is the <b>hypsometric equation</b>:
      </p>
      <TexMath class="mb-2 block" display :expr="HYPSOMETRIC" />
      <p class="mb-3">
        The height from the zero above is this, with p<sub>0</sub> the pressure at the zero and T the sensor's temperature. RT/(Mg), about 8.6 km at 20 °C, is the <b>scale height</b>: climb that far and the pressure falls to 37 %. Half of all the air is below 5.6 km.
      </p>
      <figure>
        <PressureCurve :pressure="r?.pressure ?? null" />
        <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Pressure against height in the standard atmosphere: 1013 hPa at sea level, a third of that at the top of Everest, where a breath holds a third of the air it holds at sea level. The orange dot is your reading, at the height the standard atmosphere would give it.
        </figcaption>
      </figure>
    </CollapsibleCard>

    <CollapsibleCard id="how-high-am-i" title="How high am I?" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How high am I?</h2>
      <p class="mb-2">
        Pressure alone can't say how high you are above the sea, because the weather moves it too. Aircraft altimeters use the <b>standard atmosphere</b> (ICAO): 1013.25 hPa and 15 °C at sea level, the air cooling by 6.5 °C for every kilometre up (L), and this formula from it:
      </p>
      <TexMath class="mb-2 block" display :expr="ISA" />
      <p class="mb-2">
        With p<sub>0</sub> the standard 1013.25 hPa your reading is {{ r ? `${fmt(isaHeight(r.pressure), 0)} m` : '—' }}, which can be well off. Before landing, a pilot sets p<sub>0</sub> to the airport's <b>sea-level pressure</b> of the moment, as weather services give it. Do the same with today's from your local weather service:
      </p>
      <div class="mb-2 flex flex-wrap items-center gap-x-6 gap-y-2">
        <label :class="field">Sea-level pressure today
          <input v-model.number="qnh" type="number" :step="HPA_STEP" :min="QNH_MIN_HPA" :max="QNH_MAX_HPA" :class="[select, 'w-28 font-mono']">
          hPa
        </label>
        <p class="text-sm">Your height above the sea: <b class="font-mono tabular-nums">{{ fmt(above, 0) }} m</b></p>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Within about 10 m when the weather service's station is near, and the SPL06's own absolute accuracy, ±1 hPa, is another 8 m.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="weather" title="Highs and lows" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Highs and lows</h2>
      <p class="mb-2">
        The air above isn't still: it's warmed and cooled, piled up and drawn away by winds. Weather maps show sea-level pressure (each station's reading brought down to sea level), mostly between 980 and 1040 hPa: <b>highs</b> of sinking air, often clear and calm, and <b>lows</b> of rising air, with clouds and wind. The records are 1084.8 hPa in a Mongolian winter and 870 hPa in the eye of Typhoon Tip (WMO).
      </p>
      <p>
        To a barometer, weather is height: 1 hPa is about 8.5 m. A low coming in drops the pressure by a few hPa in a day, and your zero seems to rise by tens of metres while you sit still. That's why a barometer measures height changes over minutes well and over days poorly, and why altimeter watches and drones mix it with GPS.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="how-a-chip-measures-it" title="How a chip measures it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How a chip measures it</h2>
      <p class="mb-2">
        <b>A membrane.</b> The SPL06 has a tiny MEMS membrane, air on one side: the pressure bends it, and the bending changes a capacitance the chip measures (its datasheet). A temperature sensor sits in the same element, and the chip's factory calibration, nine numbers, turns both into pascals and degrees.
      </p>
      <p class="mb-2">
        <b>Noise and averaging.</b> Each reading jitters. Measuring many times and averaging (oversampling) calms it: in the weather mode 5 Pa, about 40 cm; in the indoor mode 1.2 Pa, 10 cm; in the sports mode 0.5 Pa, about 4 cm (its datasheet). The sports mode is the one for this page.
      </p>
      <p class="mb-2">
        <b>Relative beats absolute.</b> Between two readings the SPL06 is good to ±6 Pa (half a metre) from 950 to 1050 hPa, but its absolute reading only to ±1 hPa (8 m): fine for height changes, not for height above the sea without a reference.
      </p>
      <p>
        <b>Warmth.</b> The calibration takes the chip's temperature into account, but not perfectly: its datasheet gives 0.2 Pa for each degree, 1.7 cm. A warm hand on it, or sunlight, moves the zero a few centimetres. Draughts and doors move the air's pressure itself, a little and quickly.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Desk to above your head.</b> Zero it on the desk, then lift the board up slowly, hold it there for a few seconds, and bring it back. About a metre: some 12 Pa. Does it come back to zero?</li>
        <li><b>The stairs.</b> On a laptop, carry the board up a flight of stairs and wait a few seconds at the top. A storey is about 3 m, 35 Pa. Measure the stairs' height with a tape and compare.</li>
        <li><b>A lift.</b> Ride a lift a few floors. The height chart draws the trip: speeding up, a steady climb, slowing down. How fast does the lift go, in metres a second?</li>
        <li><b>A day of weather.</b> Set the weather mode and leave it on the desk, never moving. Over an hour or a day, the "height" drifts by metres: that's the weather, and today's sea-level pressure from a weather service shows the same change.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>The sensor:</b> the <RouterLink to="/spl06" :class="link">SPL06</RouterLink>, how it's read and its wiring.
    </p>
  </main>
</template>
