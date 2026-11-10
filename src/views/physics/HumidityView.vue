<script setup>
// Physics: humidity and dew point. How much water vapour air can hold (the
// saturation vapour pressure, the Magnus formula), relative against
// absolute humidity, the dew point; from an SHT20 or an AHT21B (whichever
// answers: lib/humidity.js), the saturation curve drawn with the air's
// state on it, and things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import LiveChart from '../../components/LiveChart.vue';
import TexMath from '../../components/TexMath.vue';
import SaturationCurve from '../../components/SaturationCurve.vue';
import { reactive, computed } from 'vue';
import { Sht3x, Sht20, Aht21 } from 'atiic';
import { hasWebUsb, hex } from '../../lib/dongle.js';
import { useHumidity } from '../../lib/humidity.js';

const WINDOW_MS = 300000; // five minutes: a breath, a warm hand, a cold glass
const SHT20_RESOLUTION = '11/11'; // ~4 readings a second (its device page's default)
const TEMPERATURE = [{ label: 'temperature', color: '--series-2' }, { label: 'dew point', color: '--series-1' }];
const HUMIDITY = [{ label: 'relative humidity', color: '--series-3' }];
const ABSOLUTE = [{ label: 'absolute humidity', color: '--series-1' }];
const TEMPERATURE_SPAN_C = 1;
const HUMIDITY_SPAN = 4;
const ABSOLUTE_SPAN = 0.5; // g/m3

const MAGNUS = String.raw`e_s(T) = 6.112\,\text{hPa} \cdot \exp\!\left(\frac{17.62\,T}{243.12\,^\circ\text{C} + T}\right)`;
const RELATIVE = String.raw`\text{RH} = \frac{e}{e_s(T)} \times 100\,\%`;
const DEW = String.raw`e_s(T_d) = e \quad\Rightarrow\quad T_d = \frac{243.12\,\gamma}{17.62 - \gamma}, \qquad \gamma = \ln\frac{\text{RH}}{100\,\%} + \frac{17.62\,T}{243.12 + T}`;
const ABSOLUTE_LAW = String.raw`\rho_v = \frac{e \, M_w}{R \, (T + 273.15)}`;

// the most accurate first: the SHT3x (typically +/-2 %RH), the SHT20 and the
// AHT21B (+/-3)
const h = reactive(useHumidity([Sht3x, Sht20, Aht21], { windowMs: WINDOW_MS, resolution: SHT20_RESOLUTION }));
const r = computed(() => h.latest);
const fmt = (v, digits) => (v === undefined || v === null ? '—' : v.toFixed(digits));

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Humidity and dew point</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Air carries water as an invisible gas, water vapour, and warm air can carry far more than cold. A humidity sensor measures two things, the temperature and the relative humidity; from those two come how much water is really there and the dew point, the temperature where it would turn back into droplets. Here from an <RouterLink to="/sht20" :class="link">SHT20</RouterLink>, an <RouterLink to="/sht3x" :class="link">SHT3x</RouterLink> or an <RouterLink to="/aht21" :class="link">AHT21B or AHT30</RouterLink>, whichever is plugged in (with more than one, pick which: the same air, two answers).
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="h.state !== 'running'" :busy="h.state === 'connecting'" @click="h.connect">{{ h.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="h.disconnect" />
      <div v-if="h.state === 'running' && h.found.length > 1" class="flex rounded-lg border border-slate-300 text-sm dark:border-slate-600" role="group" aria-label="The sensor read">
        <button v-for="n in h.found" :key="n" type="button" class="px-3 py-1 first:rounded-l-lg last:rounded-r-lg" :class="n === h.name ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'" :aria-pressed="n === h.name" @click="h.choose(n)">{{ n }}</button>
      </div>
      <span v-if="h.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ h.name }} at {{ hex(h.address) }} · a reading every {{ h.readMs / 1000 }} s</span>
      <span v-if="h.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${h.failed.count} of ${h.failed.of} readings didn't come through and were skipped; the last: ${h.failed.last}`">· {{ h.failed.count }} {{ h.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="h.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ h.failure.title }}</p>
      <p v-if="h.failure.detail" class="mt-1">{{ h.failure.detail }}</p>
      <p v-if="h.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ h.failure.error }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Temperature <span class="text-xs">measured</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.temperature, 1) }} <span class="text-base">°C</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Relative humidity <span class="text-xs">measured</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.humidity, 1) }} <span class="text-base">%</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Water in the air <span class="text-xs">worked out</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.absolute, 2) }} <span class="text-base">g/m³</span></p>
      </section>
      <section :class="card">
        <p class="text-sm text-slate-500 dark:text-slate-400">Dew point <span class="text-xs">worked out</span></p>
        <p class="font-mono text-2xl tabular-nums">{{ fmt(r?.dewPoint, 1) }} <span class="text-base">°C</span></p>
      </section>
    </div>

    <CollapsibleCard id="the-curve" title="How much water air can hold" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How much water air can hold</h2>
      <figure>
        <SaturationCurve :temperature="r?.temperature ?? null" :humidity="r?.humidity ?? null" />
        <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The blue curve is the most water vapour air can hold at each temperature. The orange dot is the air now; the dashed line up from it reaches what it could hold, and relative humidity is how far up it is. The dashed line across meets the curve at the dew point: cool the air to there, with the same water in it, and it's full.
        </figcaption>
      </figure>
      <p class="mt-3 mb-2">
        Water molecules leave a water surface all the time, and come back. Above a puddle in a closed box the two balance at a pressure of water vapour that depends only on the temperature: the <b>saturation vapour pressure</b> e<sub>s</sub>. Warmer molecules escape more easily, so it climbs steeply, roughly doubling every 10 °C: 6.1 hPa at 0 °C, 12.3 at 10, 23.4 at 20, 42.5 at 30 (the steam tables). The Magnus formula follows it closely:
      </p>
      <TexMath class="mb-2 block" display :expr="MAGNUS" />
      <p class="text-sm text-slate-500 dark:text-slate-400">
        The constants are Sensirion's (the SHT20's datasheet) and the World Meteorological Organization's (its Guide to Instruments, WMO-No. 8); within 0.3 % of the steam tables from 0 to 40 °C.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="relative-is-relative" title="Relative is relative" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Relative is relative</h2>
      <p class="mb-2">
        <b>Relative humidity</b> compares the water vapour there is, its pressure e, with the most there could be at this temperature:
      </p>
      <TexMath class="mb-2 block" display :expr="RELATIVE" />
      <p class="mb-2">
        So it changes with the temperature even when not a drop of water comes or goes. Warm the same air and e<sub>s</sub> grows: relative humidity falls. That's why heated rooms feel dry in winter: the outdoor air had plenty of water for its cold, and warmed it's far from full.
      </p>
      <p class="mb-2">
        <b>Absolute humidity</b> is the water itself, grams in a cubic metre of air, from the vapour pressure by the ideal gas law (M<sub>w</sub> = 18.015 g/mol, R = 8.314 J/(mol·K)):
      </p>
      <TexMath class="mb-3 block" display :expr="ABSOLUTE_LAW" />
      <div class="flex flex-col gap-4">
        <LiveChart title="Relative humidity" unit="%" :series="HUMIDITY" :values="r ? [r.humidity] : []" :source="h.humiditySource" :window-ms="WINDOW_MS" :floor="HUMIDITY_SPAN" :digits="1" fit />
        <LiveChart title="Water in the air" unit="g/m³" :series="ABSOLUTE" :values="r ? [r.absolute] : []" :source="h.absoluteSource" :window-ms="WINDOW_MS" :floor="ABSOLUTE_SPAN" :digits="2" fit />
      </div>
    </CollapsibleCard>

    <CollapsibleCard id="dew-point" title="The dew point" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">The dew point</h2>
      <p class="mb-2">
        Cool air without taking water out and e stays put while e<sub>s</sub> falls. At some temperature they meet: the air is full, and any colder, water condenses, as dew on grass, mist on a mirror, drops on a cold glass. That temperature is the <b>dew point</b> T<sub>d</sub>: the Magnus formula turned round.
      </p>
      <TexMath class="mb-2 block" display :expr="DEW" />
      <p class="mb-3">
        Like absolute humidity, the dew point tells how much water is there: warm the air and it doesn't move, while relative humidity falls. Weather forecasts give it for that reason.
      </p>
      <LiveChart title="Temperature and dew point" unit="°C" :series="TEMPERATURE" :values="r ? [r.temperature, r.dewPoint] : []" :source="h.temperatureSource" :window-ms="WINDOW_MS" :floor="TEMPERATURE_SPAN_C" :digits="1" fit />
    </CollapsibleCard>

    <CollapsibleCard id="how-a-chip-measures-it" title="How a chip measures it" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How a chip measures it</h2>
      <p class="mb-2">
        <b>Humidity by a capacitor.</b> The SHT20's and the AHT21B's datasheets describe a tiny capacitor whose dielectric, a thin layer between its plates (a polymer, in the AHT21B's words), takes up water vapour from the air around it until it balances with it. Water has a far higher permittivity than the dry layer, so the more there is, the larger the capacitance; the chip measures it and turns it into relative humidity with its factory calibration. It's relative humidity it senses directly, because the layer takes up water by how full the air is, not by how much there is.
      </p>
      <p class="mb-2">
        <b>Temperature beside it,</b> on the same silicon: a band-gap sensor in the SHT20, whose voltage changes with temperature in a way the chip knows exactly. The two are measured together, so the relative humidity is for the temperature that's read with it.
      </p>
      <p class="mb-2">
        <b>Slow to follow.</b> Water has to soak into the layer and out again, so a step in humidity shows 63 % of its size after about 8 s (all three datasheets), and the chip's own temperature follows the air in 5 to 30 s, by how well its board conducts heat. Reading it four times a second draws the same slow curve with more points. Anything round it that holds water, a case, foam, glue, slows it further.
      </p>
      <p class="mb-2">
        <b>Measuring warms it.</b> The chip's own circuit makes heat while it measures. The SHT20's and AHT21B's datasheets ask it be busy no more than 10 % of the time to keep that under 0.1 °C; the SHT3x's warns that at its fastest, ten measurements a second, it may warm itself. A warmer sensor reads a lower relative humidity than the air has, the curve above again. That, not the bus, sets how often each can be read: on their device pages.
      </p>
      <p>
        <b>Fine steps are not accuracy.</b> The chips report steps of 0.04 %RH or finer, but each is typically within a few percent and a few tenths of a degree (±3 %RH and ±0.3 °C for the SHT20, ±2 %RH and ±0.2 °C for the SHT30 and SHT31, ±1.5 %RH and ±0.1 °C for the SHT35, ±3 %RH and ±0.5 °C for the AHT21B and the AHT30): two sensors side by side may read a few percent apart, and both be right.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>A warm hand, no breath.</b> Hold your fingers close round the sensor without touching it and without breathing on it. The temperature climbs, relative humidity falls, and the water in the air and the dew point hardly move: the same water, warmer air. (Your skin gives off some water too, so they may creep up a little.)</li>
        <li><b>A breath.</b> Breathe gently towards it from a hand away. Everything jumps: your breath is warm and nearly saturated, so the water and the dew point rise with it. Watch it come back down over tens of seconds as the room's air mixes back in.</li>
        <li><b>A cold glass.</b> Take a glass from the fridge. Is it colder than the dew point shown? Then it sweats: the air touching it cools below the dew point. Try a glass that's only a little cooler than the room: no drops.</li>
        <li><b>Outside and in.</b> Read the dew point outdoors and indoors. In winter, the heated room and the cold street often have nearly the same dew point, and very different relative humidity.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>The sensors:</b> <RouterLink to="/sht20" :class="link">SHT20</RouterLink>, <RouterLink to="/sht3x" :class="link">SHT3x</RouterLink> and <RouterLink to="/aht21" :class="link">AHT21B / AHT30</RouterLink>, how each is read and its wiring.
    </p>
  </main>
</template>
