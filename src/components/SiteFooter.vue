<script setup>
// The footer: the site map (every page, from lib/nav.js), kept short (the
// devices and the Learn steps in two columns each), and the license
import { DEVICE_LINKS, LEARN_LINKS, START_LINKS, ELSEWHERE_LINKS } from '../lib/nav.js';

const link = 'text-slate-600 hover:text-emerald-600 dark:text-slate-300';
const head = 'mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase';
const start = START_LINKS.filter((l) => l.to !== '/'); // the logo is home
</script>

<template>
  <footer class="mt-12 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <nav class="mx-auto grid max-w-5xl grid-cols-2 gap-x-8 gap-y-5 px-4 py-6 text-sm leading-6 md:grid-cols-[1.2fr_1.6fr_0.7fr_0.8fr]" aria-label="Site map">
      <div class="col-span-2 md:col-span-1">
        <p :class="head">Devices</p>
        <ul class="grid grid-cols-2 gap-x-4">
          <li v-for="l in DEVICE_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label.replace(' / MPU-6500', '') }}</RouterLink></li>
        </ul>
      </div>
      <div class="col-span-2 md:col-span-1">
        <p :class="head"><RouterLink to="/learn/imu" class="hover:text-emerald-600">Learn the IMU</RouterLink></p>
        <ul class="grid grid-cols-2 gap-x-4">
          <li v-for="l in LEARN_LINKS.slice(1)" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
        </ul>
      </div>
      <div>
        <p :class="head">Get started</p>
        <ul>
          <li v-for="l in start" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
        </ul>
      </div>
      <div>
        <p :class="head">Elsewhere</p>
        <ul>
          <li v-for="l in ELSEWHERE_LINKS" :key="l.href"><a :href="l.href" :class="link">{{ l.label }}</a></li>
        </ul>
      </div>
    </nav>
    <p class="mx-auto max-w-5xl px-4 pb-5 text-xs text-slate-400">
      i2c.ninja · free for noncommercial use (PolyForm Noncommercial 1.0.0); the drivers, atiic, are MIT.
    </p>
  </footer>
</template>
