<script setup>
// The VL53L1X live on the dongle: the distance to what it faces, a gauge,
// each reading's status, its light back, the background and the SPADs
// used; its distance mode, timing budget and region of interest to pick;
// the module check; its settings (how light measures it: the physics page)
import LiveSettings from '../components/LiveSettings.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';
import ConnectButton from '../components/ConnectButton.vue';
import StopButton from '../components/StopButton.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb } from '../lib/dongle.js';
import SpecTable from '../components/SpecTable.vue';
import { useVl53l1x, STATUS, BUDGETS, ROI_SIDES } from '../lib/useVl53l1x.js';

const WINDOW_MS = 15000;
const GAUGE_MM = 4000; // long distance mode's reach, in the dark (ST's ULD)
const DISTANCE_SPAN_MM = 50;
const SERIES = [{ label: 'distance', color: '--series-1' }];
const SIGNAL_SERIES = [{ label: 'signal', color: '--series-2' }];
const AMBIENT_SERIES = [{ label: 'ambient', color: '--series-3' }];
const SIGNAL_SPAN_KCPS = 100;
const AMBIENT_SPAN_KCPS = 1; // a SPAD
const MODES = [['short', 'short (to 1.3 m)'], ['long', 'long (to 4 m)']];
// its settings, from ST's datasheet (DS12385 rev. 8), and the ones this
// page uses (what atiic's driver, after ST's Ultra Lite Driver, offers)
const SPECS = [
  ['Distance mode', 'short: up to 1.3 m, hardly shortened by sunlight; medium: 2.9 m; long: 3.6 m in the dark (4 m with a 140 ms budget), 73 cm in direct sun', 'long, or short picked above (medium isn\'t in ST\'s Ultra Lite Driver)'],
  ['Timing budget', '20 ms (short only) or 33 ms up to 1000 ms a reading: longer reaches farther and repeats better', '100 ms, or 20 to 500 ms picked above'],
  ['Region of interest', '4 x 4 up to all 16 x 16 SPADs, anywhere in the array: a 15° to 27° view', 'all 16 x 16, or a square in the middle picked above'],
  ['Address', '0x29 (0x52 written with its read/write bit); software can move it', '0x29'],
  ['Interface', 'I2C, up to 400 kHz', 'I2C, 400 kHz'],
  ['Extras', 'a data-ready pin (GPIO1), a shutdown pin (XSHUT), distance thresholds, offset and crosstalk calibration', 'none: data ready read over I2C'],
];
// the datasheet's ambient light levels (DS12385 7.1), kcps/SPAD
const AMBIENT_LEVELS = [[5, 'office light'], [50, 'a sunny window'], [200, 'direct sun through a window']];
const TICKS = [0, 1000, 2000, 3000, 4000];

const tof = reactive(useVl53l1x({ windowMs: WINDOW_MS }));
const r = computed(() => tof.latest);
const gauge = computed(() => (r.value?.valid ? Math.min(1, r.value.distance / GAUGE_MM) : null));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const busy = computed(() => tof.state === 'configuring' || tof.state === 'checking');
const live = computed(() => tof.state === 'running');
const kcps = (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} Mcps` : `${v.toFixed(0)} kcps`);
// the background per SPAD, the datasheet's measure of ambient light, and
// the nearest of its levels at or under it
const perSpad = computed(() => (r.value?.spads ? r.value.ambient / r.value.spads : null));
const ambientLevel = computed(() => {
  if (perSpad.value === null) return '';
  const under = AMBIENT_LEVELS.filter(([v]) => perSpad.value >= v).at(-1);
  return under ? `at least ${under[1]}` : `dimmer than ${AMBIENT_LEVELS[0][1]}`;
});
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">VL53L1X</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        ST's time-of-flight distance sensor: it times light to whatever it faces and back, and turns the time into millimetres, up to about 4 m. Live over the USB dongle.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-vl53l1x.svg" alt="A CH341T dongle wired to a purple VL53L1X module: VCC to VIN, GND to GND, SCL to SCL, SDA to SDA; GPIO1 and XSHUT free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The common purple board ("VL53L0/1XV2"): four wires from its VIN, GND, SCL, SDA; GPIO1 and XSHUT stay free. Its window faces away from the pins. New to the dongle? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <ConnectButton v-if="tof.state === 'idle' || tof.state === 'connecting'" :busy="tof.state === 'connecting'" @click="tof.connect">{{ tof.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="tof.disconnect" />
      <label :class="field">Mode
        <select :value="tof.settings.mode" :class="select" :disabled="busy" @change="tof.setup({ mode: $event.target.value })">
          <option v-for="[m, label] in MODES" :key="m" :value="m">{{ label }}</option>
        </select>
      </label>
      <label :class="field">Budget
        <select :value="tof.settings.budget" :class="select" :disabled="busy" @change="tof.setup({ budget: Number($event.target.value) })">
          <option v-for="b in BUDGETS[tof.settings.mode]" :key="b" :value="b">{{ b }} ms</option>
        </select>
      </label>
      <label :class="field">Region
        <select :value="tof.settings.roi" :class="select" :disabled="busy" @change="tof.setup({ roi: Number($event.target.value) })">
          <option v-for="side in ROI_SIDES" :key="side" :value="side">{{ side }} x {{ side }} SPADs</option>
        </select>
      </label>
      <span v-if="live" class=" font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">0x29 · {{ tof.rate.toFixed(1) }} readings/s</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="tof.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ tof.failure.title }}</p>
      <p v-if="tof.failure.detail" class="mt-1">{{ tof.failure.detail }}</p>
      <p v-if="tof.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ tof.failure.error }}</p>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="font-mono text-5xl tabular-nums">{{ r?.valid ? r.distance : '—' }} <span class="text-xl">mm</span></p>
        <p class="text-sm" :class="r && !r.valid ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'">
          {{ r ? (STATUS[r.status] ?? `status ${r.status}`) : 'not connected' }}
        </p>
      </div>
      <p v-if="r" class="mt-1 font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
        its light back {{ kcps(r.signal) }} · background {{ kcps(r.ambient) }}<template v-if="perSpad !== null">, {{ perSpad.toFixed(1) }} kcps a SPAD ({{ ambientLevel }})</template> · {{ r.spads }} SPADs
      </p>
      <div class="relative mt-4 h-6 rounded-full bg-slate-100 dark:bg-slate-700">
        <div v-if="gauge !== null" class="absolute inset-y-0 left-0 rounded-full bg-emerald-600 transition-[width] duration-100" :style="{ width: `${gauge * 100}%` }" />
      </div>
      <div class="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
        <span v-for="t in TICKS" :key="t">{{ t / 1000 }} m</span>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Wave a hand over it, or point it at a wall and walk back. {{ tof.span.min !== null ? `Seen so far: ${tof.span.min}-${tof.span.max} mm.` : '' }}
      </p>
    </section>

    <CollapsibleCard id="distance" title="Distance">
      <LiveChart title="Distance" unit="mm" :series="SERIES" :values="r?.valid ? [r.distance] : []" :source="tof.source" :window-ms="WINDOW_MS" :floor="DISTANCE_SPAN_MM" :digits="0" fit />
    </CollapsibleCard>

    <CollapsibleCard id="light" title="Light back and background">
      <div class="flex flex-col gap-4">
        <LiveChart title="Its light back" unit="kcps" :series="SIGNAL_SERIES" :values="r ? [r.signal] : []" :source="tof.signalSource" :window-ms="WINDOW_MS" :floor="SIGNAL_SPAN_KCPS" :digits="0" fit />
        <LiveChart title="Background, a SPAD" unit="kcps" :series="AMBIENT_SERIES" :values="perSpad !== null ? [perSpad] : []" :source="tof.ambientSource" :window-ms="WINDOW_MS" :floor="AMBIENT_SPAN_KCPS" :digits="2" fit />
      </div>
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        <b>Signal</b>: its own light coming back, in thousands of photon counts a second (kcps). Walk away from a wall and it falls with the square of the distance; a white card sends back more than a black one. <b>Ambient</b>: the background it sees between its pulses, from lamps and the sun. ST's datasheet measures it a SPAD: office light is about 5 kcps a SPAD, a sunny day behind a window 50, direct sun 200, where long mode reaches only 73 cm. When the signal gets too small next to the noise, the reading turns invalid.
      </p>
    </CollapsibleCard>

    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">Check the module</h2>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="!live" @click="tof.check">
          {{ tof.state === 'checking' ? 'Checking… hold still' : 'Run it (hold still)' }}
        </button>
        <span v-if="tof.checked" class="font-semibold" :class="tof.checked.pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">{{ tof.checked.pass ? '✓ looks right' : '✗ something is off' }}</span>
      </div>
      <p class="mt-2 leading-relaxed">
        Point it at a wall or a box about a metre away and keep it still. It takes ten readings with all 16 x 16 SPADs, then with the middle 8 x 8 and 4 x 4 (long mode, 100 ms each). A working module ranges every time with all of them, and a smaller region uses fewer SPADs and catches less light. A small region reaches less far: in the dark, ST's datasheet gives 4 x 4 143-170 cm on a white or grey target but 45 cm on a dark one, so its readings may turn invalid without a fault.
      </p>
      <table v-if="tof.checked" class="mt-3 w-full text-left font-mono text-sm tabular-nums">
        <thead class="text-slate-500 dark:text-slate-400">
          <tr><th class="py-1 font-normal">region</th><th class="font-normal">valid</th><th class="font-normal">distance</th><th class="font-normal">spread</th><th class="font-normal">light back</th><th class="font-normal">background</th><th class="font-normal">SPADs</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in tof.checked.rows" :key="row.roi" class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1">{{ row.roi }} x {{ row.roi }}</td>
            <td :title="row.status ? STATUS[row.status] : ''">{{ row.valid }} of {{ row.readings }}</td>
            <td>{{ row.distance !== null ? `${row.distance.toFixed(0)} mm` : '—' }}</td>
            <td>{{ row.sd !== null ? `± ${row.sd.toFixed(1)} mm` : '—' }}</td>
            <td>{{ kcps(row.signal) }}</td>
            <td>{{ kcps(row.ambient) }}</td>
            <td>{{ row.spads }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="tof.checked && !tof.checked.pass" class="mt-2 text-sm text-red-700 dark:text-red-400">
        {{ tof.checked.rows[0].valid < tof.checked.rows[0].readings ? 'Not every reading with all SPADs was valid: is something a metre in front of it, and its window clean (its protective film peeled off)?' : 'A smaller region didn\'t use fewer SPADs or catch less light.' }}
      </p>
    </section>

    <p class="text-sm">
      <b>How it measures:</b> <RouterLink to="/physics/distance" class="text-emerald-700 underline dark:text-emerald-400">Distance and time of flight</RouterLink>, with speed and acceleration from its readings.
    </p>

    <section :class="[card, 'leading-relaxed']">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Its settings</h2>
        <a href="https://www.st.com/en/imaging-and-photonics-solutions/vl53l1x.html" class="text-sm text-emerald-700 underline dark:text-emerald-400">ST</a>
      </div>
      <SpecTable :rows="SPECS" />
    </section>
  </main>
</template>
