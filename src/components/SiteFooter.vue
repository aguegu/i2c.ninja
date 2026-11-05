<script setup>
// The footer: the site map (every page, from lib/nav.js) and the license
import { DEVICE_LINKS, LEARN_LINKS, START_LINKS, ELSEWHERE_LINKS } from '../lib/nav.js';

const link = 'text-slate-600 hover:text-emerald-600 dark:text-slate-300';
const head = 'mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase';
</script>

<template>
  <footer class="mt-12 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <nav class="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-8 text-sm md:grid-cols-4" aria-label="Site map">
      <div>
        <p :class="head">Devices</p>
        <ul class="space-y-1">
          <li v-for="l in DEVICE_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink> <span class="text-xs text-slate-400">{{ l.note }}</span></li>
        </ul>
      </div>
      <div>
        <p :class="head">Learn</p>
        <ul class="space-y-1">
          <li v-for="l in LEARN_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
        </ul>
      </div>
      <div>
        <p :class="head">Get started</p>
        <ul class="space-y-1">
          <li v-for="l in START_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
        </ul>
      </div>
      <div>
        <p :class="head">Elsewhere</p>
        <ul class="space-y-1">
          <li v-for="l in ELSEWHERE_LINKS" :key="l.href"><a :href="l.href" :class="link">{{ l.label }}</a> <span class="text-xs text-slate-400">{{ l.note }}</span></li>
        </ul>
      </div>
    </nav>
    <p class="mx-auto max-w-5xl px-4 pb-6 text-xs text-slate-400">
      i2c.ninja · free for noncommercial use (PolyForm Noncommercial 1.0.0); the drivers, atiic, are MIT.
    </p>
  </footer>
</template>
