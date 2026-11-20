<script setup>
// Physics: electricity, current, voltage and power. Charge, current, voltage
// and resistance; Ohm's law, live (R = V / I from the readings) and on a V-I
// graph of points the reader adds (a line through the origin fitted: its
// slope R); how a current is measured, across a shunt; power and energy,
// summed; things to try with resistors, an LED and a fan. From an INA226 or
// INA231 (lib/useIna231.js), its high-side shunt between a supply and a load
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import LiveChart from '../../components/LiveChart.vue';
import TexMath from '../../components/TexMath.vue';
import { reactive, ref, computed } from 'vue';
import { canConnect, hex } from '../../lib/dongle.js';
import { useIna231 } from '../../lib/useIna231.js';

const WINDOW_MS = 30000;
const CURRENT_SPAN_MA = 2;
const CURRENT = [{ label: 'current', color: '--series-1' }];
const SHUNTS = [{ ohms: 0.1, mark: 'R100' }, { ohms: 0.01, mark: 'R010' }, { ohms: 0.002, mark: 'R002' }];
const SHUNT_FULL_SCALE_V = 0.08192; // ±81.92 mV, both chips
const MIN_CURRENT_A = 0.0005; // below this, V / I is mostly noise: no R shown
const OHM = String.raw`V = I\,R \qquad I = \frac{V}{R}`;
const SHUNT = String.raw`I = \frac{V_\text{shunt}}{R_\text{shunt}}`;
const POWER = String.raw`P = V\,I = I^2 R = \frac{V^2}{R}`;
const ENERGY = String.raw`E = P\,t \qquad 1\ \text{Wh} = 3600\ \text{J}`;
const FIT = String.raw`R = \frac{\sum V_i I_i}{\sum I_i^2}`;

const ina = reactive(useIna231({ windowMs: WINDOW_MS }));
const r = computed(() => ina.latest);
// the load's resistance, Ohm's law from the readings: the voltage on its side over the current
const loadR = computed(() => (r.value && Math.abs(r.value.current) >= MIN_CURRENT_A ? r.value.bus / r.value.current : null));
const fullScale = computed(() => SHUNT_FULL_SCALE_V / Number(ina.shunt));

// the V-I graph: points the reader adds, and a line through the origin fitted to them
const points = ref([]); // { i A, v V }
function addPoint() {
  if (r.value) points.value = [...points.value, { i: r.value.current, v: r.value.bus }];
}
const clearPoints = () => { points.value = []; };
const fitted = computed(() => {
  const ii = points.value.reduce((s, p) => s + p.i * p.i, 0);
  return points.value.length && ii > 0 ? points.value.reduce((s, p) => s + p.v * p.i, 0) / ii : null;
});
// the graph: its viewBox, a margin for the labels, its scales from the points (or 50 mA, 5 V)
const GW = 520, GH = 300, ML = 48, MB = 36, MT = 12, MR = 16;
const maxI = computed(() => Math.max(0.05, ...points.value.map((p) => p.i)) * 1.15);
const maxV = computed(() => Math.max(5, ...points.value.map((p) => p.v)) * 1.15);
const gx = (i) => ML + ((GW - ML - MR) * i) / maxI.value;
const gy = (v) => GH - MB - ((GH - MB - MT) * v) / maxV.value;
const ticks = (max, n) => Array.from({ length: n + 1 }, (_, k) => (max * k) / n);

const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));
const ohms = (x) => (x === null ? '—' : x >= 1000 ? `${(x / 1000).toFixed(2)} kΩ` : `${x.toFixed(x < 10 ? 2 : 1)} Ω`);
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Electricity: current, voltage and power</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A current is charge on the move, a voltage what pushes it, a resistance what holds it back: Ohm's law ties the three together. Watch them live through a load you wire up, see power and energy add up, and find a resistor's value from its own current. Here with the <RouterLink to="/ina226" :class="link">INA226</RouterLink> (or the <RouterLink to="/ina231" :class="link">INA231</RouterLink>), its shunt between a supply and a load: its page shows the wiring.
      </p>
    </div>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="ina.state !== 'running'" :busy="ina.state === 'connecting'" @connect="ina.connect">{{ ina.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="ina.disconnect" />
      <label :class="field">Shunt
        <select :value="ina.shunt" :class="select" @change="ina.setShunt(Number($event.target.value))">
          <option v-for="s in SHUNTS" :key="s.ohms" :value="s.ohms">{{ s.mark }} ({{ s.ohms }} Ω)</option>
        </select>
      </label>
      <span v-if="ina.state === 'running'" class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">{{ ina.part }} at {{ hex(ina.address) }} · {{ ina.rate.toFixed(0) }} readings/s</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="ina.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ ina.failure.title }}</p>
      <p v-if="ina.failure.detail" class="mt-1">{{ ina.failure.detail }}</p>
      <p v-if="ina.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ ina.failure.error }}</p>
    </div>

    <section :class="[card, 'grid grid-cols-2 gap-4 font-mono tabular-nums sm:grid-cols-4']">
      <div>
        <p class="font-sans text-sm text-slate-500 dark:text-slate-400">voltage V</p>
        <p class="text-3xl">{{ fmt(r?.bus, 3) }} <span class="text-base">V</span></p>
      </div>
      <div>
        <p class="font-sans text-sm text-slate-500 dark:text-slate-400">current I</p>
        <p class="text-3xl">{{ fmt(r && r.current * 1000, 1) }} <span class="text-base">mA</span></p>
      </div>
      <div>
        <p class="font-sans text-sm text-slate-500 dark:text-slate-400">power P</p>
        <p class="text-3xl">{{ fmt(r && r.power * 1000, 1) }} <span class="text-base">mW</span></p>
      </div>
      <div>
        <p class="font-sans text-sm text-slate-500 dark:text-slate-400">the load, R = V / I</p>
        <p class="text-3xl">{{ ohms(loadR) }}</p>
      </div>
    </section>

    <CollapsibleCard id="current" title="Current">
      <LiveChart title="Current" unit="mA" :series="CURRENT" :values="r ? [r.current * 1000] : []" :source="ina.currentSource" :window-ms="WINDOW_MS" :floor="CURRENT_SPAN_MA" :digits="1" fit />
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Half a minute of it, 20 readings a second. A resistor draws a flat line; a motor wobbles; a fan held still jumps.</p>
    </CollapsibleCard>

    <CollapsibleCard id="charge-current-voltage" title="Charge, current, voltage, resistance" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Charge, current, voltage, resistance</h2>
      <p class="mb-2">
        <b>Charge</b> is carried by electrons, each a tiny negative charge; a coulomb is about 6.24 × 10¹⁸ of them. <b>Current</b> is how much charge passes a point each second: one ampere is one coulomb a second. Electrons drift from − to +, but by a convention older than the electron, current is drawn from + to −.
      </p>
      <p class="mb-2">
        <b>Voltage</b> is the push: the energy each coulomb gains in the supply and gives up in the load. One volt is one joule a coulomb. A USB supply gives 5 V; a fresh AA cell 1.5 V.
      </p>
      <p>
        <b>Resistance</b> is how hard it is to push a current through something: a long thin wire more than a short thick one, a resistor by design. One ohm passes one ampere at one volt.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="ohms-law" title="Ohm's law" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Ohm's law</h2>
      <p class="mb-2">
        In a resistor the current is proportional to the voltage across it: double the push, double the flow. The constant is its resistance.
      </p>
      <TexMath class="mb-2 block" display :expr="OHM" />
      <p class="mb-3">
        Right now: <span class="font-mono">{{ fmt(r?.bus, 3) }} V / {{ fmt(r && r.current * 1000, 1) }} mA = {{ ohms(loadR) }}</span>. With a 100 Ω resistor as the load it reads about 100 Ω, give or take its tolerance (often ±1 % or ±5 %, the last colour band).
      </p>
      <h3 class="mb-1 font-semibold">Your own V–I graph</h3>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">
        Add a point for each supply or load you try: a resistor's points fall on a straight line through the origin, and its slope is the resistance. Change the voltage (another supply, a battery), or the resistor, and add again.
      </p>
      <div class="mb-2 flex flex-wrap items-center gap-3">
        <button type="button" :class="button" :disabled="!r" @click="addPoint">Add this point</button>
        <button type="button" :class="button" :disabled="!points.length" @click="clearPoints">Clear</button>
        <span class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">{{ points.length }} {{ points.length === 1 ? 'point' : 'points' }}<template v-if="fitted !== null"> · the line's slope {{ ohms(fitted) }}</template></span>
      </div>
      <svg :viewBox="`0 0 ${GW} ${GH}`" class="w-full max-w-2xl" role="img" :aria-label="points.length ? `A V-I graph of ${points.length} points; the fitted line's slope ${ohms(fitted)}` : 'A V-I graph, no points yet'">
        <g class="text-slate-400 dark:text-slate-500" font-size="11" fill="currentColor">
          <g v-for="v in ticks(maxV, 5)" :key="`v${v}`">
            <line :x1="ML" :x2="GW - MR" :y1="gy(v)" :y2="gy(v)" stroke="currentColor" stroke-opacity="0.25" />
            <text :x="ML - 6" :y="gy(v) + 4" text-anchor="end">{{ v.toFixed(1) }}</text>
          </g>
          <g v-for="i in ticks(maxI, 5)" :key="`i${i}`">
            <text :x="gx(i)" :y="GH - MB + 16" text-anchor="middle">{{ (i * 1000).toFixed(0) }}</text>
          </g>
          <text :x="ML" :y="MT - 2" font-size="12">V (volts)</text>
          <text :x="GW - MR" :y="GH - 4" text-anchor="end" font-size="12">I (mA)</text>
        </g>
        <line v-if="fitted !== null" :x1="gx(0)" :y1="gy(0)" :x2="gx(Math.min(maxI, maxV / fitted))" :y2="gy(Math.min(maxV, fitted * maxI))" stroke="var(--series-2)" stroke-width="2" />
        <circle v-for="(p, k) in points" :key="k" :cx="gx(p.i)" :cy="gy(p.v)" r="5" fill="var(--series-1)" stroke="white" stroke-width="2" />
        <circle v-if="r" :cx="gx(Math.max(0, Math.min(maxI, r.current)))" :cy="gy(Math.max(0, Math.min(maxV, r.bus)))" r="6" fill="none" stroke="var(--series-1)" stroke-width="2" stroke-dasharray="3 2" />
      </svg>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">The dashed ring is now; the dots are what you added. The line is fitted through the origin, least squares in V:</p>
      <TexMath class="mt-1 block" display :expr="FIT" />
      <p class="mt-2 text-sm">
        Not everything obeys Ohm's law: an LED passes almost nothing until about 2 V across it, then more and more for a little more voltage, a curve rather than a line. Ohm's law is a property of resistors, not a law of nature.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="the-shunt" title="How the current is measured" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How the current is measured</h2>
      <p class="mb-2">
        You can't see a current, but you can measure the voltage it makes across a known resistance. The chip's shunt is a tiny, precise resistor in the current's way, and it reads the voltage across it, Ohm's law backwards:
      </p>
      <TexMath class="mb-2 block" display :expr="SHUNT" />
      <p class="mb-2">
        Right now: <span class="font-mono">{{ fmt(r && r.shunt * 1000, 3) }} mV / {{ ina.shunt }} Ω = {{ fmt(r && (r.shunt / ina.shunt) * 1000, 1) }} mA</span>. It resolves 2.5 µV, and reads up to ±81.92 mV: {{ (fullScale * 1000).toFixed(0) }} mA with this shunt.
      </p>
      <p>
        <b>Why so small a resistor?</b> Whatever voltage it takes, the load loses: 0.1 Ω at 50 mA costs only 5 mV. A smaller shunt costs less and carries more current, but gives a smaller voltage to measure. Its voltage on the load's side, read on its own pin, is the V above; the supply's − joined to the chip's ground gives it a reference.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="power-energy" title="Power and energy" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Power and energy</h2>
      <p class="mb-2">
        <b>Power</b> is how fast energy is delivered: each coulomb brings V joules, I coulombs pass each second, so P = V I watts. With Ohm's law it can be put three ways:
      </p>
      <TexMath class="mb-2 block" display :expr="POWER" />
      <p class="mb-2">
        Right now: <span class="font-mono">{{ fmt(r?.bus, 3) }} V × {{ fmt(r && r.current * 1000, 1) }} mA = {{ fmt(r && r.bus * r.current * 1000, 1) }} mW</span>. In a resistor it all turns to heat: a 100 Ω resistor at 5 V takes 0.25 W, so a ¼ W resistor runs at its limit, warm to the touch; a ½ W one is comfortable.
      </p>
      <p class="mb-2"><b>Energy</b> is power added up over time:</p>
      <TexMath class="mb-2 block" display :expr="ENERGY" />
      <div class="mb-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono tabular-nums">
        <span class="text-2xl">{{ (ina.energy.wh * 1000).toFixed(3) }} <span class="text-base">mWh</span></span>
        <span class="text-2xl">{{ (ina.energy.ah * 1000).toFixed(3) }} <span class="text-base">mAh</span></span>
        <button v-if="ina.state === 'running'" type="button" class="font-sans text-xs underline" @click="ina.resetEnergy">reset</button>
      </div>
      <p>
        Since {{ ina.energy.since ? ina.energy.since.toLocaleTimeString() : 'connecting' }}, summed reading by reading. Batteries are labelled in mAh, charge rather than energy: a 10,000 mAh power bank's cells hold 10 Ah at about 3.7 V, some 37 Wh, and at 5 V out it gives roughly 6,000 mAh, after its converter's losses.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">A 5 V USB supply and a few resistors (½ W). Keep under {{ (fullScale * 1000).toFixed(0) }} mA with this shunt, and under 36 V (28 V for an INA231).</p>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>One resistor.</b> 100 Ω as the load: about 50 mA and 250 mW, and R reads about 100 Ω. Add the point.</li>
        <li><b>Two in series,</b> end to end: 200 Ω, half the current. The same push through twice the resistance.</li>
        <li><b>Two in parallel,</b> side by side: 50 Ω, twice the current. Two paths share the flow.</li>
        <li><b>Another voltage.</b> The same resistor on a 3.3 V supply or a battery: a second point on the same line through the origin.</li>
        <li><b>An LED,</b> with a 220 Ω resistor in series: R reads far more than 220 Ω, as the LED takes about 2 V of the 5 for itself.</li>
        <li><b>A small USB fan.</b> Watch the current settle as it speeds up, then hold the blades gently: the current jumps. A spinning motor pushes back against its supply; held still, it can't.</li>
      </ol>
    </CollapsibleCard>
  </main>
</template>
