<script setup>
// The home page, a simple landing page: the hero (what it is, the glass box
// with the board swaying in it, still for reduced motion, and the way in),
// what's inside as six cards, the hardware it asks for (no board of ours:
// the common WCH bridges, lib/dongles.js), and three quotes on measuring
// and understanding.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ProjectionBox from '../components/ProjectionBox.vue';
import { DEVICES } from '../lib/devices.js';
import { PHYSICS } from '../lib/physics.js';
import { ALGORITHMS } from '../lib/algorithms.js';
import { fromAxisAngle } from '../lib/quaternion.js';
import { DONGLES } from '../lib/dongles.js';

const hasWebUsb = 'usb' in navigator;

// the hero's board: a slow sway about the vertical, a little roll and pitch
const SWAY_DEG = 35;
const SWAY_S = 9; // a sway there and back
const ROLL_DEG = 18;
const PITCH_DEG = 12;
const PITCH_S = 6;
const mul = ([a, b, c, d], [e, f, g, h]) => [a * e - b * f - c * g - d * h, a * f + b * e + c * h - d * g, a * g - b * h + c * e + d * f, a * h + b * g - c * f + d * e];
const pose = (s) => {
  const yaw = fromAxisAngle([0, 0, 1], SWAY_DEG * Math.sin((2 * Math.PI * s) / SWAY_S));
  const pitch = fromAxisAngle([0, -1, 0], PITCH_DEG * Math.sin((2 * Math.PI * s) / PITCH_S));
  const roll = fromAxisAngle([1, 0, 0], ROLL_DEG);
  return mul(yaw, mul(pitch, roll));
};
const q = ref(pose(1.5));
let frame = 0;
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const t0 = performance.now();
  const tick = (t) => { q.value = pose(1.5 + (t - t0) / 1000); frame = requestAnimationFrame(tick); };
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));

// what's inside: a card each, its icon (a 24-unit SVG path), where it goes
const FEATURES = [
  { icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 3v18M3 12h18', title: 'Physics', to: `/physics/${PHYSICS[0].slug}`, text: `What each sensor measures, drawn and explained: ${PHYSICS.filter((p) => p.component).map((p) => p.title.toLowerCase()).join(', ')}.` },
  { icon: 'M7 3v3M12 3v3M17 3v3M7 18v3M12 18v3M17 18v3M3 8h18v8H3z', title: 'Devices', to: '/devices', text: `${DEVICES.length} I²C sensors, every one field-tested on a real module, their readings live in your browser with their wiring and settings: motion, magnetism, humidity, heat, distance, pulse, power.` },
  { icon: 'M4 18l5-6 4 3 7-9M4 6h4M16 18h4', title: 'Algorithms', to: `/algorithms/${ALGORITHMS[0].slug}`, text: 'The maths that turns readings into understanding, worked out step by step, every formula with its live numbers: attitude from an accelerometer and a gyro.' },
  { icon: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7 15h10', title: 'Smoke-test a module', to: '/devices', text: 'Got a module? Plug it in and see it answer: found by its ID, its self test run where it has one, its readings sane. Before it goes into a project, or back to the seller.' },
  { icon: 'M4 5h16v11H4zM9 20h6M12 16v4', title: 'Nothing to install', to: '/get-started', text: 'Wire the sensor to a USB dongle (a CH347, or a CH341), four wires, and open a Chromium browser: WebUSB reads it, the page charts it live, full screen for the class. Works offline once visited.' },
  { icon: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4M4 4h7', title: 'Open learning, built in public', to: '/blog', text: 'Every step told as it happens: the sensors, the ideas and the questions along the way. The stories behind the scenes, in the blog.' },
];

// on measuring and understanding, with their sources
const QUOTES = [
  { text: 'When you can measure what you are speaking about, and express it in numbers, you know something about it.', by: 'Lord Kelvin', where: 'Electrical Units of Measurement, 1883' },
  { text: 'Nothing is too wonderful to be true, if it be consistent with the laws of nature.', by: 'Michael Faraday', where: 'his diary, 1849' },
  { text: 'The first principle is that you must not fool yourself — and you are the easiest person to fool.', by: 'Richard Feynman', where: 'Cargo Cult Science, 1974' },
];
</script>

<template>
  <main class="flex flex-col">
    <!-- hero -->
    <section class="hero flex flex-col items-center px-4 pt-14 pb-8 text-center">
      <p class="text-xs tracking-[0.3em] text-slate-500 uppercase dark:text-slate-400">a hands-on book of sensors</p>
      <h1 class="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">i2c.ninja</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">named after <b class="font-semibold text-slate-700 dark:text-slate-200">I²C</b>, "I-squared-C": the two-wire bus, SDA and SCL, that most small sensors speak</p>
      <p class="mt-4 max-w-xl text-slate-600 dark:text-slate-300">For STEM lessons, digital experiments and the electronics bench.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <RouterLink to="/devices" class="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700">Explore sensors</RouterLink>
        <RouterLink to="/get-started" class="rounded-lg bg-emerald-600/10 px-5 py-2.5 font-medium text-emerald-800 hover:bg-emerald-600/20 dark:text-emerald-300">Get started</RouterLink>
      </div>
      <p v-if="!hasWebUsb" class="mt-4 max-w-xl text-xs text-amber-700 dark:text-amber-400">This browser has no WebUSB: the live pages need Chrome, Edge or another Chromium (Chrome on Android too, with an OTG cable).</p>
      <div class="mt-4 w-full max-w-md"><ProjectionBox :q="q" /></div>
    </section>

    <!-- what's inside -->
    <section class="mx-auto grid w-full max-w-5xl gap-4 px-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="f in FEATURES" :key="f.title" :to="f.to" class="flex flex-col rounded-xl bg-emerald-600/5 p-5 ring-emerald-600 transition hover:bg-emerald-600/10 hover:ring-1 dark:bg-emerald-400/5 dark:hover:bg-emerald-400/10">
        <svg viewBox="0 0 24 24" class="mb-2 h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="f.icon" /></svg>
        <span class="font-semibold">{{ f.title }}</span>
        <span class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ f.text }}</span>
      </RouterLink>
    </section>

    <!-- the hardware: no board of ours, the common WCH bridges -->
    <section class="mx-auto w-full max-w-5xl px-4 pb-12">
      <RouterLink to="/dongles" class="flex flex-col gap-4 rounded-xl bg-emerald-600/5 p-5 ring-emerald-600 transition hover:bg-emerald-600/10 hover:ring-1 sm:flex-row sm:items-center dark:bg-emerald-400/5 dark:hover:bg-emerald-400/10">
        <svg viewBox="0 0 24 24" class="h-10 w-10 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2v4M15 2v4M7 6h10v5a5 5 0 0 1-10 0zM12 16v6" /></svg>
        <span class="flex flex-col">
          <span class="font-semibold">Common hardware, no lock-in</span>
          <span class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            No board of ours to buy, and no vendor driver: the page talks to the chip itself over WebUSB, through open drivers (atiic, MIT).
            It runs on WCH's everyday USB bridges, a CH341T stick or a CH347T minimum-system board, and any CH341 or CH347 set for I²C should do:
            WCH's own evaluation kits too, their designs published (KiCad included) to build your own. The {{ DONGLES.length }} we tested, side by side →
          </span>
        </span>
      </RouterLink>
    </section>

    <!-- quotes -->
    <section class="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-12 lg:grid-cols-3">
      <figure v-for="qt in QUOTES" :key="qt.by" class="quote relative m-0 pt-7 text-center">
        <blockquote class="m-0 leading-relaxed text-slate-700 italic dark:text-slate-300">{{ qt.text }}</blockquote>
        <figcaption class="mt-2 text-xs tracking-wide text-slate-500 dark:text-slate-400">— {{ qt.by }}, <span class="italic">{{ qt.where }}</span></figcaption>
      </figure>
    </section>
  </main>
</template>

<style scoped>
.hero {
  background: radial-gradient(120% 120% at 50% -10%, rgb(5 150 105 / 0.14), transparent 60%);
}
.quote::before {
  content: '\201C';
  position: absolute;
  top: -0.3rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 3rem;
  line-height: 1;
  color: rgb(5 150 105);
  opacity: 0.35;
}
</style>
