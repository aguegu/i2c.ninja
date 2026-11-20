<script setup>
// Physics: the spectrum of light, from an AS7341 (lib/useAs7341.js): its
// eight visible bands and its near infrared as one live shape
// (components/SpectrumBars.vue), held shapes beside it to compare, named by
// the reader; what light is made of (wavelength, a photon's energy); lamps,
// each with its own spectrum (daylight, a hot filament and Wien's law, a
// white LED, a screen's three primaries); objects, coloured by what they
// reflect (its own LED as their light; a leaf's infrared; two whites); the
// infrared an eye can't see; things to try. Nothing needed but the sensor
// and what's around
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import SpectrumBars from '../../components/SpectrumBars.vue';
import TexMath from '../../components/TexMath.vue';
import { reactive, ref, computed } from 'vue';
import { canConnect } from '../../lib/dongle.js';
import { useAs7341, GAINS, BANDS, LED_MA } from '../../lib/useAs7341.js';

const HOLD_MAX = 4;
const PHOTON = String.raw`E = \frac{h\,c}{\lambda}`;
const WIEN = String.raw`\lambda_\text{peak} = \frac{2898\ \mu\text{m}\cdot\text{K}}{T}`;

const s = reactive(useAs7341({ windowMs: 10000 }));
const r = computed(() => s.latest);

// held spectra: { id, name, values, gain, led }, the newest last
const held = ref([]);
const name = ref('');
let nextId = 1;
function hold() {
  if (!r.value || held.value.length >= HOLD_MAX) return;
  const id = nextId++;
  held.value = [...held.value, { id, name: name.value.trim() || `Held ${id}`, values: { ...r.value }, gain: s.gain, led: s.led }];
  name.value = '';
}
const drop = (id) => { held.value = held.value.filter((h) => h.id !== id); };

// a photon's energy at each end of the bands, eV: h c / λ, hc = 1239.84 eV nm
const HC_EV_NM = 1239.84;
const ev = (nm) => (HC_EV_NM / nm).toFixed(2);

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
      <h1 class="text-2xl font-bold">The spectrum of light</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        White light is many colours, and every lamp mixes them its own way: the sun smoothly, a filament mostly in infrared, an LED as blue plus yellow, a screen as three narrow colours. Objects take their colour from the part they send back. See it all in eight bands and the infrared, and hold a spectrum to compare the next. Here with the <RouterLink to="/as7341" :class="link">AS7341</RouterLink>: its page shows the wiring.
      </p>
    </div>

    <p v-if="!canConnect" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB and no Web Bluetooth. Open this page in Chrome, Edge or another Chromium (a computer or Android), or a Web Bluetooth browser like Bluefy for a Dart.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="s.state !== 'running'" :busy="s.state === 'connecting'" @connect="s.connect">{{ s.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="s.disconnect" />
      <label :class="field">Gain
        <select :value="s.gain" :class="select" @change="s.setGain(Number($event.target.value))">
          <option v-for="g in GAINS" :key="g" :value="g">{{ g }}×</option>
        </select>
      </label>
      <label :class="field">LED
        <select :value="s.led" :class="select" @change="s.setLed(Number($event.target.value))">
          <option :value="0">off</option>
          <option v-for="mA in LED_MA" :key="mA" :value="mA">{{ mA }} mA</option>
        </select>
      </label>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="s.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ s.failure.title }}</p>
      <p v-if="s.failure.detail" class="mt-1">{{ s.failure.detail }}</p>
      <p v-if="s.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ s.failure.error }}</p>
    </div>

    <section :class="card">
      <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 class="text-lg font-semibold">Now</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">each band as a share of the strongest visible one, %</p>
      </div>
      <SpectrumBars :values="r" :nm="BANDS" label="The spectrum now" />
      <p v-if="r?.saturated" class="mt-1 text-sm text-amber-700 dark:text-amber-400">A channel is at its top, so the shape is wrong: a lower gain brings it back.</p>
      <p v-else-if="r && r.clear < 50" class="mt-1 text-sm text-slate-500 dark:text-slate-400">Little light: the shape is mostly noise. Bring the light closer, or a higher gain.</p>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <input v-model="name" type="text" maxlength="24" placeholder="what it is: a leaf, the sky" :class="[select, 'w-56']" @keydown.enter="hold">
        <button type="button" :class="button" :disabled="!r || held.length >= HOLD_MAX" @click="hold">Hold this spectrum</button>
        <span v-if="held.length >= HOLD_MAX" class="text-sm text-slate-500 dark:text-slate-400">{{ HOLD_MAX }} held: remove one to hold another</span>
      </div>
    </section>

    <section v-if="held.length" :class="card">
      <h2 class="mb-2 text-lg font-semibold">Held</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <figure v-for="h in held" :key="h.id">
          <figcaption class="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span class="font-semibold">{{ h.name }}</span>
            <span class="text-slate-500 dark:text-slate-400">{{ h.gain }}×{{ h.led ? `, LED ${h.led} mA` : '' }} <button type="button" class="ml-2 underline" :aria-label="`Remove ${h.name}`" @click="drop(h.id)">remove</button></span>
          </figcaption>
          <SpectrumBars :values="h.values" :nm="BANDS" :label="h.name" small />
        </figure>
      </div>
    </section>

    <CollapsibleCard id="what-light-is" title="What light is made of" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">What light is made of</h2>
      <p class="mb-2">
        Light is a wave, and its <b>wavelength</b> is what an eye sees as colour: about 400 nm (billionths of a metre) is violet, 700 nm deep red, the rainbow between. Shorter than violet is ultraviolet, longer than red <b>infrared</b>: the same light, invisible to us. A <b>spectrum</b> is how much of each wavelength a light holds.
      </p>
      <p class="mb-2">
        Light also comes in packets, photons, and the shorter the wavelength, the more energy each carries:
      </p>
      <TexMath class="mb-2 block" display :expr="PHOTON" />
      <p>
        A violet photon at {{ BANDS.f1 }} nm carries {{ ev(BANDS.f1) }} eV, a deep red one at {{ BANDS.f8 }} nm {{ ev(BANDS.f8) }} eV, the infrared at {{ BANDS.nir }} nm {{ ev(BANDS.nir) }} eV. The sensor has eight windows on the visible, each a filter about 30 nm wide over its own light sensor, and one on the infrared.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="lamps" title="Lamps: each its own spectrum" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Lamps: each its own spectrum</h2>
      <p class="mb-2">
        <b>Hot things glow.</b> The sun and an old filament bulb shine because they're hot, and a hot thing's light spreads smoothly over all wavelengths, peaking at one set by its temperature (Wien's law):
      </p>
      <TexMath class="mb-2 block" display :expr="WIEN" />
      <p class="mb-2">
        The sun's surface, about 5800 K, peaks near 500 nm, in the middle of what we see: daylight fills every band. A filament at 2700 K peaks near 1070 nm, in the infrared: its bars climb toward red, and its NIR towers over them. Most of its power is heat, not light.
      </p>
      <p class="mb-2">
        <b>A white LED</b> isn't hot. It's a blue LED, a sharp peak near 450 nm, under a yellow phosphor that turns part of the blue into a broad hump from green to red: a dip between them near 480 nm, and almost no infrared. Room lights and phone torches look like this.
      </p>
      <p>
        <b>A screen</b> makes every colour from three narrow ones, red, green and blue, and its white is the three added together: three peaks with gaps between, nothing like daylight's smooth spread, yet it looks just as white. An eye has only three kinds of colour sensor, so it can't tell (more in <RouterLink to="/physics/colour" :class="link">Colour and light</RouterLink>).
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="objects" title="Objects: the light they send back" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Objects: the light they send back</h2>
      <p class="mb-2">
        Most things make no light: they're the colour of what they reflect from the light falling on them. A red pen takes in green and blue and sends back red. Turn the LED on (above), and hold a thing a centimetre or two over the sensor, so the LED's light bounces off it into the sensor: the spectrum is the LED's light, shaped by the object.
      </p>
      <p class="mb-2">
        <b>A green leaf</b> sends back some green, takes in red and blue for its photosynthesis, then reflects infrared strongly: a jump past the red, its "red edge". Satellites use it to see how healthy plants are. A green plastic object has no such edge.
      </p>
      <p>
        <b>Two whites</b>: white paper and a white screen may look the same to you, but their spectra are nothing alike. Colours that look equal with different spectra are called metamers.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="infrared" title="Light you can't see" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Light you can't see</h2>
      <p>
        The NIR bar, grey at the right, is light no eye sees. A TV remote's LED shines at about 940 nm: point it at the sensor and press a button, and the NIR bar jumps while the eight stay still. Daylight and a filament bulb carry plenty of it; an LED lamp and a screen almost none. Your hand over it on a sunny day blocks the visible and the infrared alike; a dark cloth may block the visible and pass much of the infrared.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">Name each and hold it, then compare. If a channel tops out, a lower gain; if the bars are ragged, a higher one.</p>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Daylight vs. the room's light.</b> Point it at a window, hold; then up at the ceiling light, hold: smooth vs. blue peak and hump.</li>
        <li><b>A phone's torch,</b> another white LED: the same blue peak.</li>
        <li><b>A screen:</b> a full white page, then pure red, green and blue, held a few centimetres over it.</li>
        <li><b>A leaf and a piece of paper,</b> with the LED on: the leaf's red edge.</li>
        <li><b>Skin, a banana, a red and a blue pen,</b> with the LED on: each its own shape.</li>
        <li><b>A TV remote,</b> pressed at it with the LED off: only the NIR moves.</li>
      </ol>
    </CollapsibleCard>
  </main>
</template>
