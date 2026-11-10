<script setup>
// Physics: colour and light. Light as a spectrum, three kinds of cone,
// adding light (screens) against taking it away (cards, filters), how a
// colour sensor imitates the eye (the BH1745NUC: red, green, blue and clear
// photodiodes behind filters, its datasheet) and where it differs; live:
// what it sees as a tint and as shares of red, green and blue, a point in
// Maxwell's colour triangle, a white balance ("call this white"), a mixer of
// your own, and the screen itself as a light to measure
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import ColourStripe from '../../components/ColourStripe.vue';
import SvgDrawing from '../../components/SvgDrawing.vue';
import { reactive, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { hasWebUsb, hex } from '../../lib/dongle.js';
import { useBh1745, GAINS } from '../../lib/useBh1745.js';

const WINDOW_MS = 60000;
const c = reactive(useBh1745({ windowMs: WINDOW_MS }));
const r = computed(() => c.latest);

// the white balance: the counts under the light taken as white; each
// channel divided by its own, so that light lands at the triangle's centre
const white = ref(null);
const callWhite = () => { if (r.value) white.value = { red: r.value.red, green: r.value.green, blue: r.value.blue }; };
const forgetWhite = () => { white.value = null; };
// the red, green and blue shares of what it sees (balanced if called), or null
const shares = computed(() => {
  if (!r.value) return null;
  const w = white.value;
  const v = ['red', 'green', 'blue'].map((k) => r.value[k] / (w?.[k] || 1));
  const sum = v[0] + v[1] + v[2];
  return sum > 0 ? v.map((x) => x / sum) : null;
});
// shares as a screen colour, the strongest at full
const asColour = (s) => {
  if (!s) return 'transparent';
  const top = Math.max(...s);
  return `rgb(${s.map((x) => Math.round((255 * x) / top)).join(', ')})`;
};

// your own mix: three lights, 0-255 each
const mix = reactive({ red: 255, green: 160, blue: 0 });
const mixColour = computed(() => `rgb(${mix.red}, ${mix.green}, ${mix.blue})`);
const mixShares = computed(() => {
  const sum = mix.red + mix.green + mix.blue;
  return sum ? [mix.red / sum, mix.green / sum, mix.blue / sum] : null;
});

// Maxwell's triangle: red, green and blue at the corners, a mix at the point
// weighted by its shares (the centre: equal parts)
const CORNERS = { red: [24, 236], green: [150, 18], blue: [276, 236] };
const at = (s) => (s ? [0, 1].map((i) => s[0] * CORNERS.red[i] + s[1] * CORNERS.green[i] + s[2] * CORNERS.blue[i]) : null);
const CENTRE = at([1 / 3, 1 / 3, 1 / 3]);
const seen = computed(() => at(shares.value));
const mixed = computed(() => at(mixShares.value));
const pct = (x) => `${Math.round(x * 100)} %`;

// the screen as a light: one colour full screen (the Fullscreen API where the
// browser has it, else a panel over the page), a reading in its corner;
// a click or Esc leaves
const LIGHTS = [
  ['red', '#ff0000'], ['green', '#00ff00'], ['blue', '#0000ff'],
  ['yellow', '#ffff00'], ['cyan', '#00ffff'], ['magenta', '#ff00ff'], ['white', '#ffffff'],
];
const panel = ref(null);
const light = ref(null); // [name, css colour] while shown
async function showLight(l) {
  light.value = l;
  await nextTick(); // shown before it's asked full screen
  try {
    await panel.value?.requestFullscreen?.();
  } catch {
    // no full screen: the panel covers the page
  }
}
function hideLight() {
  light.value = null;
  if (document.fullscreenElement) document.exitFullscreen();
}
const onFull = () => { if (!document.fullscreenElement) light.value = null; };
// while a colour is shown: left and right step through LIGHTS (round), Esc leaves
function step(by) {
  const i = LIGHTS.findIndex((l) => l[0] === light.value?.[0]);
  light.value = LIGHTS[(i + by + LIGHTS.length) % LIGHTS.length];
}
const onKey = (e) => {
  if (!light.value) return;
  if (e.key === 'Escape') hideLight();
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
};
onMounted(() => { document.addEventListener('fullscreenchange', onFull); document.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { document.removeEventListener('fullscreenchange', onFull); document.removeEventListener('keydown', onKey); });

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Physics</p>
      <h1 class="text-2xl font-bold">Colour and light</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        White light is many colours at once, and the eye judges colour with just three kinds of sensor. A colour sensor does the same: three filtered light sensors, red, green and blue. See what it sees as a mix of the three, make mixes of your own, and turn the screen itself into a light to measure. Here with the <RouterLink to="/bh1745" :class="link">BH1745NUC</RouterLink>.
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="c.state !== 'running'" :busy="c.state === 'connecting'" @click="c.connect">{{ c.state === 'connecting' ? 'Connecting…' : 'Connect' }}</ConnectButton>
      <StopButton v-else @click="c.disconnect" />
      <label :class="field">Gain
        <select :value="c.settings.gain" :class="select" @change="c.configure({ gain: Number($event.target.value) })">
          <option v-for="g in GAINS" :key="g" :value="g">{{ g }}×</option>
        </select>
      </label>
      <span v-if="c.state === 'running'" class="font-mono text-sm text-slate-500 dark:text-slate-400">BH1745NUC at {{ hex(c.address) }} · a reading every {{ c.settings.timeMs / 1000 }} s</span>
      <span v-if="c.failed.count" class="text-sm text-slate-400 dark:text-slate-500" :title="`${c.failed.count} of ${c.failed.of} readings didn't come through and were skipped; the last: ${c.failed.last}`">· {{ c.failed.count }} {{ c.failed.count === 1 ? 'reading' : 'readings' }} skipped</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="c.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ c.failure.title }}</p>
      <p v-if="c.failure.detail" class="mt-1">{{ c.failure.detail }}</p>
      <p v-if="c.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ c.failure.error }}</p>
    </div>

    <CollapsibleCard id="what-it-sees" title="What it sees, as a mix" class="leading-relaxed">
      <h2 class="mb-3 text-lg font-semibold">What it sees, as a mix</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <div class="h-20 rounded-lg border border-slate-200 dark:border-slate-700" :style="{ background: asColour(shares) }" />
          <div class="mt-3 flex flex-col gap-2">
            <div v-for="(k, i) in ['red', 'green', 'blue']" :key="k" class="flex items-center gap-2 text-sm">
              <span class="w-12 text-slate-500 dark:text-slate-400">{{ k }}</span>
              <div class="h-3 flex-1 rounded-full bg-slate-100 dark:bg-slate-700">
                <div class="h-3 rounded-full" :style="{ width: shares ? `${shares[i] * 100}%` : '0', background: `var(--channel-${k})` }" />
              </div>
              <span class="w-12 text-right font-mono tabular-nums">{{ shares ? pct(shares[i]) : '—' }}</span>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" :class="button" :disabled="!r" @click="callWhite">Call this light white</button>
            <button v-if="white" type="button" :class="button" @click="forgetWhite">Forget it</button>
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ white ? 'balanced to the light called white' : 'raw: the sensor\'s own channels' }}</span>
          </div>
        </div>
        <figure>
          <svg viewBox="0 0 300 270" class="mx-auto w-full max-w-sm" role="img" :aria-label="shares ? `Maxwell's colour triangle: it sees ${pct(shares[0])} red, ${pct(shares[1])} green, ${pct(shares[2])} blue` : 'Maxwell\'s colour triangle: red, green and blue at the corners'">
            <polygon :points="[CORNERS.red, CORNERS.green, CORNERS.blue].map((p) => p.join(',')).join(' ')" fill="none" style="stroke: var(--chart-text)" stroke-width="1.5" />
            <circle v-for="(p, k) in CORNERS" :key="k" :cx="p[0]" :cy="p[1]" r="9" :style="{ fill: `var(--channel-${k})` }" />
            <text :x="CORNERS.red[0]" :y="CORNERS.red[1] + 26" text-anchor="middle" font-size="12" style="fill: var(--chart-text)">red</text>
            <text :x="CORNERS.green[0] + 16" :y="CORNERS.green[1] + 4" font-size="12" style="fill: var(--chart-text)">green</text>
            <text :x="CORNERS.blue[0]" :y="CORNERS.blue[1] + 26" text-anchor="middle" font-size="12" style="fill: var(--chart-text)">blue</text>
            <g style="stroke: var(--chart-text)" stroke-width="1"><line :x1="CENTRE[0] - 5" :x2="CENTRE[0] + 5" :y1="CENTRE[1]" :y2="CENTRE[1]" /><line :x1="CENTRE[0]" :x2="CENTRE[0]" :y1="CENTRE[1] - 5" :y2="CENTRE[1] + 5" /></g>
            <circle v-if="mixed" :cx="mixed[0]" :cy="mixed[1]" r="7" fill="none" style="stroke: var(--chart-text)" stroke-width="2" stroke-dasharray="3 2" />
            <circle v-if="seen" :cx="seen[0]" :cy="seen[1]" r="8" :style="{ fill: asColour(shares), stroke: 'var(--chart-text)' }" stroke-width="2" />
          </svg>
          <figcaption class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Maxwell's colour triangle: pure red, green and blue at the corners, any mix of them a point inside, pulled towards each corner by its share; the cross at the centre is equal parts. The filled dot is what the sensor sees; the dashed ring, your own mix below.
          </figcaption>
        </figure>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        <b>Raw, white isn't at the centre.</b> The sensor's three channels aren't equally sensitive (its datasheet's table, each under its own coloured LED of the same strength: red 4000 counts, green 3350, blue 2370), so even white light lands off-centre. Point it at the light you want as white and press "Call this light white": each channel is then divided by what it saw there, and that light sits at the centre. A camera does the same, its white balance.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="over-time" title="Its tint over time">
      <h2 class="mb-2 text-lg font-semibold">Its tint over time</h2>
      <ColourStripe :source="c.source" :window-ms="WINDOW_MS" />
    </CollapsibleCard>

    <CollapsibleCard id="mix-your-own" title="Mix your own" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Mix your own</h2>
      <p class="mb-3">
        Three lights, red, green and blue, each from off to full: the swatch is them added together, as on a screen. Red and green make yellow; all three, white; none, black. Its dashed ring sits on the triangle above.
      </p>
      <div class="grid gap-4 md:grid-cols-[1fr_8rem]">
        <div class="flex flex-col gap-3">
          <label v-for="k in ['red', 'green', 'blue']" :key="k" class="flex items-center gap-3 text-sm">
            <span class="w-12 text-slate-500 dark:text-slate-400">{{ k }}</span>
            <input v-model.number="mix[k]" type="range" min="0" max="255" class="flex-1" :style="{ accentColor: `var(--channel-${k})` }">
            <span class="w-10 text-right font-mono tabular-nums">{{ mix[k] }}</span>
          </label>
        </div>
        <div class="h-24 rounded-lg border border-slate-200 md:h-auto dark:border-slate-700" :style="{ background: mixColour }" />
      </div>
    </CollapsibleCard>

    <CollapsibleCard id="the-screen-as-a-light" title="The screen as a light" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">The screen as a light</h2>
      <p class="mb-3">
        Every pixel on this screen is three tiny lights, red, green and blue. Fill the screen with one colour, hold the sensor's window flat against it, and see what it measures: in the corner, the colour it sees beside the screen's own, and its counts. Yellow should come back as red and green with little blue, white as all three. The left and right arrow keys step through the colours; click or press Esc to come back.
      </p>
      <SvgDrawing src="/colour-screen-test.svg" alt="How to hold the sensor to the screen: from the side, the chip's window facing the coloured screen, touching or a few millimetres away, a hand or a card round it to keep the room's light out; from the front, in the middle of the colour, away from the edges. Steps: fill the screen with a colour at full brightness; hold the window flat to the middle, shaded, and wait for two readings; raise the gain if the counts are in single digits, lower it if a channel reads 65535." class="mx-auto mb-3 w-full max-w-2xl" />
      <div class="flex flex-wrap gap-2">
        <button v-for="l in LIGHTS" :key="l[0]" type="button" :class="[button, 'flex items-center gap-2']" @click="showLight(l)">
          <span class="inline-block size-4 rounded border border-slate-300" :style="{ background: l[1] }" />{{ l[0] }}
        </button>
      </div>
    </CollapsibleCard>

    <CollapsibleCard id="light-and-colour" title="Light, the eye and the sensor" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Light, the eye and the sensor</h2>
      <p class="mb-2">
        <b>Light is a spectrum.</b> What we see is light with wavelengths from about 400 nm (violet) to about 700 nm (red). Sunlight and a white LED carry all of them at once; a prism or a rainbow spreads them apart.
      </p>
      <p class="mb-2">
        <b>The eye has three kinds of colour sensor,</b> cones most sensitive to long, middle and short wavelengths. Every colour we see is just how strongly light excites the three. That's why three lights, red, green and blue, can fool the eye into seeing almost any colour: a screen's yellow has no yellow wavelength in it at all, only red and green light, and the eye can't tell.
      </p>
      <p class="mb-2">
        <b>Adding light and taking it away.</b> A screen adds lights together: more light, brighter, towards white. A card, a paint or a filter works the other way: under white light it absorbs some wavelengths and sends back the rest. A red card returns red and swallows green and blue; under pure blue light it has nothing to return and looks almost black.
      </p>
      <p class="mb-2">
        <b>The sensor imitates the eye</b> with four light sensors, photodiodes, behind filters: red, green and blue pass their part of the spectrum, and an infrared-cut filter keeps out infrared, which the eye doesn't see but a bare photodiode would. Its filters aren't the eye's cones, though: two lights that look the same to you can read differently to it, and a true colour measurement needs a calibration this page doesn't have.
      </p>
      <p>
        <b>Clear</b> is its fourth sensor, without a colour filter: a wide band across the whole visible spectrum, for how bright the light is whatever its colour. In this chip it's far less sensitive than the others (the datasheet's table: about 160 counts where green gives 3350), so its numbers only compare with themselves.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>The screen's colours.</b> Fill the screen with red, then green, then blue: the dot runs to each corner. Then yellow and cyan: halfway along an edge, two lights added. White: all three.</li>
        <li><b>Balance it.</b> On white, press "Call this light white": the dot jumps to the centre. Now try the room's lamp: is it warmer (towards red) or cooler (towards blue) than the screen's white?</li>
        <li><b>Coloured cards.</b> Light cards with a phone's torch and hold the sensor close above each. A red card's dot leans to red; then try it under the screen's blue: little comes back.</li>
        <li><b>Daylight and lamplight.</b> Call daylight from a window white, then carry the sensor under a lamp, and watch the strip shift.</li>
        <li><b>Match it.</b> Move the sliders until your dashed ring sits on the sensor's dot: your mix is then the same share of red, green and blue as the light it sees.</li>
      </ol>
    </CollapsibleCard>

    <!-- the screen as a light: full screen, or a panel over the page -->
    <div ref="panel" v-show="light" class="fixed inset-0 z-50 flex items-end justify-end p-4" :style="{ background: light?.[1] ?? 'transparent' }" @click="hideLight">
      <div class="flex items-stretch gap-3 rounded-lg bg-black/60 p-2 text-white">
        <div class="flex flex-col items-center gap-1">
          <div class="size-20 rounded-md border-2 border-white/80" :style="{ background: asColour(shares) }" />
          <span class="text-xs">what it sees{{ white ? ', balanced' : '' }}</span>
        </div>
        <p class="self-end font-mono text-sm tabular-nums">
          {{ light?.[0] }} on the screen<br>
          {{ r ? `R ${r.red}  G ${r.green}  B ${r.blue}  C ${r.clear}` : 'not connected' }}<br>
          {{ shares ? `${pct(shares[0])} red, ${pct(shares[1])} green, ${pct(shares[2])} blue` : '' }}<br>
          <span class="text-xs opacity-75">← → another colour · click or Esc to leave</span>
        </p>
      </div>
    </div>
  </main>
</template>
