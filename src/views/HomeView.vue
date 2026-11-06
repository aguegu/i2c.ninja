<script setup>
// The home page as a book's cover, then its contents. The cover: the title,
// what it is, the glass box with the board turning slowly in it (still when
// the system asks for less motion), the three parts, the way in. The
// contents: the parts and their pages, as a book lists its chapters, and
// the course. Recent above them, when there is any.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ProjectionBox from '../components/ProjectionBox.vue';
import { DEVICES, GUIDES } from '../lib/devices.js';
import { PHYSICS } from '../lib/physics.js';
import { ALGORITHMS } from '../lib/algorithms.js';
import { fromAxisAngle } from '../lib/quaternion.js';
import { recent, withLabels, ago, clearRecent } from '../lib/recent.js';
import { version } from '../../package.json';

const hasWebUsb = 'usb' in navigator;
const EDITION = version.split('.').slice(0, 2).join('.'); // 1.3.0: edition 1.3

// the cover's board: a slow sway about the vertical, a little roll and pitch
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

// the contents, part by part, a card a page: its kind, title, what it's
// about, and a foot line
const physicsTitle = (slug) => PHYSICS.find((p) => p.slug === slug)?.title ?? slug;
const PARTS = [
  { n: 'I', title: 'Physics', note: 'what is measured', items: PHYSICS.filter((p) => p.component).map((p) => ({ to: `/physics/${p.slug}`, kind: 'Physics', label: p.title, text: p.blurb, foot: `with ${p.devices.map((d) => d.label).join(', ')}` })) },
  { n: 'II', title: 'Devices', note: 'the sensors that measure it', items: DEVICES.map((d) => ({ to: d.to, kind: d.kind, label: d.name, sub: d.maker, text: d.measures, foot: d.bus, mono: true })) },
  { n: 'III', title: 'Algorithms', note: 'the maths that joins them', items: ALGORITHMS.filter((p) => p.component).map((p) => ({ to: `/algorithms/${p.slug}`, kind: 'Algorithm', label: p.title, text: p.blurb, foot: `combines ${p.combines.map(physicsTitle).join(' + ')}` })) },
  { n: '', title: 'Learn', lead: 'Course', note: 'the parts in order, step by step', items: GUIDES.map((g) => ({ to: g.to, kind: g.kind, label: g.name, text: g.measures })) },
];
const card = 'flex flex-col rounded-xl bg-white p-4 shadow-sm ring-emerald-600 transition hover:shadow-md hover:ring-2 focus-visible:ring-2 dark:bg-slate-800';
const button = 'rounded-lg px-4 py-2 font-medium';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-10 p-4">
    <!-- the cover -->
    <section class="mx-auto mt-4 flex w-full max-w-2xl flex-col items-center rounded-sm border border-slate-300 bg-white px-6 pt-10 pb-6 text-center shadow-md sm:px-12 dark:border-slate-600 dark:bg-slate-800">
      <p class="text-xs tracking-[0.3em] text-emerald-700 uppercase dark:text-emerald-400">a hands-on book of sensors</p>
      <h1 class="mt-4 font-serif text-5xl font-bold tracking-tight sm:text-6xl">i2c.ninja</h1>
      <p class="mt-3 font-serif text-xl text-slate-600 italic dark:text-slate-300">Sensors, live and explained</p>
      <div class="my-4 w-full"><ProjectionBox :q="q" /></div>
      <p class="font-serif text-lg tracking-wide">Physics · Devices · Algorithms</p>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        A sensor on a CH341 dongle, its readings live in your browser, and how it all works, drawn and worked out. For STEM lessons, digital experiments and the electronics bench; nothing to install.
      </p>
      <div class="mt-5 flex flex-wrap justify-center gap-3">
        <RouterLink v-for="g in GUIDES" :key="g.to" :to="g.to" :class="[button, 'bg-emerald-600 text-white hover:bg-emerald-700']">Start the course</RouterLink>
        <RouterLink to="/get-started" :class="[button, 'border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700']">Get started</RouterLink>
      </div>
      <p class="mt-8 w-full border-t border-slate-200 pt-3 text-xs tracking-widest text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">Sourcekit · edition {{ EDITION }}</p>
    </section>

    <p v-if="!hasWebUsb" class="mx-auto max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB: the live pages need Chrome, Edge or another Chromium (Chrome on Android too, with an OTG cable).
    </p>

    <!-- the contents -->
    <section class="w-full">
      <div v-if="recent.length" class="mb-8 text-sm">
        <span class="text-slate-500 dark:text-slate-400">Where you were:</span>
        <template v-for="(r, i) in withLabels(recent)" :key="r.to">{{ i ? ' · ' : ' ' }}<RouterLink :to="r.to" class="text-emerald-700 underline dark:text-emerald-400">{{ r.label }}</RouterLink> <span class="text-xs text-slate-400">{{ ago(r.at) }}</span></template>
        <button type="button" class="ml-2 text-xs text-slate-500 underline hover:text-emerald-600 dark:text-slate-400" title="Forget the pages opened here (kept in this browser only)" @click="clearRecent">clear</button>
      </div>

      <h2 class="mb-6 text-center font-serif text-2xl tracking-wide">Contents</h2>
      <div v-for="p in PARTS" :key="p.title" class="mb-10">
        <p class="mb-3 font-serif text-lg"><span class="mr-2 text-emerald-700 dark:text-emerald-400">{{ p.lead ?? `Part ${p.n}` }}</span>{{ p.title }} <span class="text-sm text-slate-500 italic dark:text-slate-400">· {{ p.note }}</span></p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink v-for="it in p.items" :key="it.to" :to="it.to" :class="card">
            <span class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{{ it.kind }}</span>
            <span class="mt-1 text-lg font-semibold">{{ it.label }}</span>
            <span v-if="it.sub" class="text-sm text-slate-500 dark:text-slate-400">{{ it.sub }}</span>
            <span class="mt-2 flex-1 leading-relaxed">{{ it.text }}</span>
            <span v-if="it.foot" class="mt-3 text-xs text-slate-500 dark:text-slate-400" :class="it.mono && 'font-mono'">{{ it.foot }}</span>
          </RouterLink>
        </div>
      </div>
      <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">More devices join one at a time, each once its driver and its page have run on a real one.</p>
    </section>
  </main>
</template>
