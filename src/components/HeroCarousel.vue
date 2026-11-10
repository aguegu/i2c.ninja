<script setup>
// The home page's hero visual: the site's own views in turn, each driven by a
// gentle made-up motion (no sensor), with its page a click away: the glass
// box, the gyro's rings, the compass, the saturation curve, Maxwell's colour
// triangle, a dropped ball's x, v and a. On to the next every ADVANCE_S, paused while the
// pointer or focus is on it; arrows, dots and a swipe change it. Only the
// slide shown is drawn and animated. Reduced motion: still pictures, no
// advancing.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ProjectionBox from './ProjectionBox.vue';
import GyroBall from './GyroBall.vue';
import CompassRose from './CompassRose.vue';
import SaturationCurve from './SaturationCurve.vue';
import ColourTriangle from './ColourTriangle.vue';
import MotionTraces from './MotionTraces.vue';
import { fromAxisAngle } from '../lib/quaternion.js';
import { PHYSICS } from '../lib/physics.js';
import { ALGORITHMS } from '../lib/algorithms.js';

const ADVANCE_S = 7; // a slide's time, unless its own `seconds` says longer
const SWIPE_PX = 40;
const STILL_S = 1.5; // the moment drawn when motion is reduced

// the board's sway (the glass box and the gyro): about the vertical, with a
// little roll and pitch
const SWAY_DEG = 35;
const SWAY_S = 9;
const ROLL_DEG = 18;
const PITCH_DEG = 12;
const PITCH_S = 6;
const TAU = 2 * Math.PI;
const mul = ([a, b, c, d], [e, f, g, h]) => [a * e - b * f - c * g - d * h, a * f + b * e + c * h - d * g, a * g - b * h + c * e + d * f, a * h + b * g - c * f + d * e];
const pose = (s) => {
  const yaw = fromAxisAngle([0, 0, 1], SWAY_DEG * Math.sin((TAU * s) / SWAY_S));
  const pitch = fromAxisAngle([0, -1, 0], PITCH_DEG * Math.sin((TAU * s) / PITCH_S));
  const roll = fromAxisAngle([1, 0, 0], ROLL_DEG);
  return mul(yaw, mul(pitch, roll));
};
// the sway's angles and rates, deg and deg/s, about x, y, z
const swayPhases = (s) => [ROLL_DEG, PITCH_DEG * Math.sin((TAU * s) / PITCH_S), SWAY_DEG * Math.sin((TAU * s) / SWAY_S)];
const swayRates = (s) => [0, ((PITCH_DEG * TAU) / PITCH_S) * Math.cos((TAU * s) / PITCH_S), ((SWAY_DEG * TAU) / SWAY_S) * Math.cos((TAU * s) / SWAY_S)];
// the compass: a slow turn
const COMPASS_DEG_S = 12;
// the air: a room at 22 C, 45 %, a breath now and then
const ROOM_C = 22;
const ROOM_RH = 45;
const BREATH_RH = 30;
const BREATH_S = 10;
// the dropped ball in slow motion (its charts have no time axis: their shapes
// stay true), its slide long enough for a whole run (4.5 s real, 7.5 slowed)
const MOTION_PACE = 0.6;
const MOTION_SLIDE_S = 9;
const SATURATION_HEIGHT = 428; // its drawing 600 x 428: 448 x 320, the stage's full height
const breath = (s) => Math.max(0, Math.sin((TAU * s) / BREATH_S)) ** 3;
// the colour: round the hues, red to green to blue and back
const HUE_DEG_S = 24;
// (a hue's shares softened towards white, so the dot runs inside the
// triangle, not along its edges)
const HUE_SATURATION = 0.6;
const hueShares = (deg) => {
  const k = (n) => (n + deg / 60) % 6;
  const c = [5, 3, 1].map((n) => 1 - Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  const sum = c[0] + c[1] + c[2];
  return c.map((x) => HUE_SATURATION * (x / sum) + (1 - HUE_SATURATION) / 3);
};

// each slide's topic, its title and page from the topic lists
const topic = (list, base, slug) => {
  const t = list.find((x) => x.slug === slug);
  return { to: `/${base}/${slug}`, page: t.title };
};
const SLIDES = [
  { key: 'attitude', ...topic(ALGORITHMS, 'algorithms', 'attitude') },
  { key: 'rotation', ...topic(PHYSICS, 'physics', 'rotation') },
  { key: 'magnetism', ...topic(PHYSICS, 'physics', 'magnetism') },
  { key: 'humidity', ...topic(PHYSICS, 'physics', 'humidity') },
  { key: 'colour', ...topic(PHYSICS, 'physics', 'colour') },
  { key: 'distance', ...topic(PHYSICS, 'physics', 'distance'), seconds: MOTION_SLIDE_S },
];

const index = ref(0);
const slide = computed(() => SLIDES[index.value]);
const s = ref(STILL_S); // the motion's clock, seconds
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const paused = ref(false);
let frame = 0;
let shownAt = 0;

function go(i) {
  index.value = (i + SLIDES.length) % SLIDES.length;
  shownAt = performance.now();
}

onMounted(() => {
  if (reduced) return;
  const t0 = performance.now();
  shownAt = t0;
  const tick = (t) => {
    s.value = STILL_S + (t - t0) / 1000;
    if (paused.value) shownAt = t; // the slide's time counts from the pause's end
    else if (t - shownAt > (slide.value.seconds ?? ADVANCE_S) * 1000) go(index.value + 1);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));

let downX = null;
const onDown = (e) => { downX = e.clientX; };
const onUp = (e) => {
  if (downX === null) return;
  const dx = e.clientX - downX;
  downX = null;
  if (Math.abs(dx) > SWIPE_PX) go(index.value + (dx < 0 ? 1 : -1));
};

const humidity = computed(() => ROOM_RH + BREATH_RH * breath(s.value));
const button = 'rounded-full p-2 text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-100';
</script>

<template>
  <section class="w-full max-w-md" role="region" aria-roledescription="carousel" aria-label="What the site shows" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <!-- the views' own full-screen buttons hidden here (some have one, some
         don't; full screen is on each view's page) -->
    <div class="relative flex h-80 touch-pan-y items-center justify-center select-none [&_button]:hidden" :aria-live="paused || reduced ? 'polite' : 'off'" role="group" aria-roledescription="slide" :aria-label="`${index + 1} of ${SLIDES.length}: ${slide.page}`" @pointerdown="onDown" @pointerup="onUp">
      <ProjectionBox v-if="slide.key === 'attitude'" class="w-full" :q="pose(s)" />
      <GyroBall v-else-if="slide.key === 'rotation'" class="h-full" :rates="swayRates(s)" :phases="swayPhases(s)" />
      <CompassRose v-else-if="slide.key === 'magnetism'" size="h-72 w-72" :heading="(s * COMPASS_DEG_S) % 360" />
      <SaturationCurve v-else-if="slide.key === 'humidity'" :height="SATURATION_HEIGHT" :temperature="ROOM_C" :humidity="humidity" />
      <ColourTriangle v-else-if="slide.key === 'colour'" class="h-full" :shares="hueShares((s * HUE_DEG_S) % 360)" />
      <MotionTraces v-else :s="s * MOTION_PACE" />
    </div>
    <p class="mt-1 text-sm">
      <RouterLink :to="slide.to" class="font-medium text-emerald-700 underline dark:text-emerald-400">{{ slide.page }}</RouterLink>
    </p>
    <div class="mt-2 flex items-center justify-center gap-2">
      <button type="button" :class="button" aria-label="The one before" @click="go(index - 1)">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5l-5 5 5 5" /></svg>
      </button>
      <button v-for="(sl, i) in SLIDES" :key="sl.key" type="button" class="size-2.5 rounded-full transition" :class="i === index ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'" :aria-label="`${sl.page}${i === index ? ', shown' : ''}`" :aria-current="i === index" @click="go(i)" />
      <button type="button" :class="button" aria-label="The next one" @click="go(index + 1)">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>
      </button>
    </div>
  </section>
</template>
