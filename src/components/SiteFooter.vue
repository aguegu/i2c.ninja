<script setup>
// The footer: the site map (every page, from lib/nav.js), share this page,
// and the license.
// Kept short as the devices grow: they fill rows across the full width
// first; Learn (its index; the steps are linked from there), Get started
// and Elsewhere share the row under them.
import { DEVICE_LINKS, PHYSICS_LINKS, ALGORITHM_LINKS, START_LINKS, ELSEWHERE_LINKS } from '../lib/nav.js';
import { COURSE_LINKS } from '../lib/courses.js';
import ShareRow from './ShareRow.vue';

const link = 'text-slate-600 hover:text-emerald-600 dark:text-slate-300';
const head = 'mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase';
const start = START_LINKS.filter((l) => l.to !== '/'); // the logo is home
</script>

<template>
  <footer class="mt-12 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <nav class="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 text-sm leading-6" aria-label="Site map">
      <div>
        <RouterLink to="/devices" :class="[head, 'block hover:text-emerald-600']">Devices</RouterLink>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4">
          <li v-for="l in DEVICE_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label.replace(' / MPU-6500', '') }}</RouterLink></li>
        </ul>
      </div>
      <div class="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-5">
        <div>
          <p :class="head">Algorithms</p>
          <ul>
            <li v-for="l in ALGORITHM_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <p :class="head">Physics</p>
          <ul>
            <li v-for="l in PHYSICS_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <p :class="head">Learn</p>
          <ul>
            <li v-for="l in COURSE_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label }}</RouterLink></li>
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
      </div>
    </nav>
    <div class="mx-auto max-w-5xl px-4 pb-4"><ShareRow /></div>
    <p class="mx-auto max-w-5xl px-4 pb-5 text-xs text-slate-400">
      i2c.ninja · free for noncommercial use: the code under <a href="https://github.com/aguegu/i2c.ninja/blob/main/LICENSE" class="underline hover:text-emerald-600">PolyForm Noncommercial 1.0.0</a>, the text and drawings under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" class="underline hover:text-emerald-600">CC BY-NC-SA 4.0</a>; the drivers, atiic, MIT. The readings are the sensors' own, as their datasheets describe, shown as is: see the <RouterLink to="/about" class="underline hover:text-emerald-600">disclaimer</RouterLink>.
    </p>
  </footer>
</template>
