<script setup>
// The footer: the site map (every page, from lib/nav.js), share this page,
// and the license.
// One grid, every group on its columns: seven on a wide screen (the devices
// four, their groups in them; physics; algorithms and learn; get started
// and elsewhere), three on a narrower one (the devices a row, the rest under
// their columns). On a phone the groups fold to their headings (open from sm
// up).
import { DEVICE_LINK_GROUPS, PHYSICS_LINKS, ALGORITHM_LINKS, START_LINKS, ELSEWHERE_LINKS } from '../lib/nav.js';
import { COURSE_LINKS } from '../lib/courses.js';
import ShareRow from './ShareRow.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const link = 'text-slate-600 hover:text-emerald-600 dark:text-slate-300';
const head = 'mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase';
const start = START_LINKS.filter((l) => l.to !== '/'); // the logo is home
// the devices' groups in four columns, near even in height: Motion with Body
// under it; Air, the biggest, over two columns under its one heading; Light
// with Electricity under it. A group the list doesn't have yet is left out
const byName = Object.fromEntries(DEVICE_LINK_GROUPS.map((g) => [g.head, g]));
const DEVICE_COLUMNS = [
  { groups: ['Motion', 'Body'], wide: false },
  { groups: ['Air'], wide: true },
  { groups: ['Light', 'Electricity'], wide: false },
].map((c) => ({ ...c, groups: c.groups.map((n) => byName[n]).filter(Boolean) }));
// the other columns, beside the devices' three on a wide screen, under them on a narrower one
const COLUMNS = [
  [{ head: 'Physics', to: '/physics', links: PHYSICS_LINKS }],
  [{ head: 'Algorithms', to: '/algorithms', links: ALGORITHM_LINKS }, { head: 'Learn', links: COURSE_LINKS }],
  [{ head: 'Get started', links: start }, { head: 'Elsewhere', links: ELSEWHERE_LINKS }],
];
// open from Tailwind's sm (40rem) up; folded below, until tapped
const SM = '(min-width: 40rem)';
const wide = ref(true); // open while prerendered: every link in the HTML
let mq = null;
const onChange = () => { wide.value = mq.matches; };
onMounted(() => { mq = matchMedia(SM); onChange(); mq.addEventListener('change', onChange); });
onBeforeUnmount(() => mq?.removeEventListener('change', onChange));
</script>

<template>
  <footer class="mt-2 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <nav class="mx-auto grid max-w-5xl gap-x-4 gap-y-1.5 px-4 py-6 text-sm leading-6 sm:grid-cols-3 sm:gap-y-6 lg:grid-cols-7" aria-label="Site map">
      <!-- the devices: four columns of the grid's, their groups in them (Air over two) -->
      <details class="group sm:col-span-3 lg:col-span-4" :open="wide">
        <summary :class="[head, 'flex cursor-pointer list-none items-center justify-between sm:pointer-events-none']">
          <RouterLink to="/devices" class="pointer-events-auto hover:text-emerald-600">Devices</RouterLink>
          <svg viewBox="0 0 20 20" class="h-4 w-4 transition-transform group-open:rotate-180 sm:hidden" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
        </summary>
        <div class="grid gap-x-4 sm:grid-cols-4">
          <div v-for="(col, i) in DEVICE_COLUMNS" :key="i" class="sm:space-y-3" :class="col.wide && 'sm:col-span-2'">
            <div v-for="g in col.groups" :key="g.head">
              <p class="flex items-center gap-1.5 pt-1 text-[11px] tracking-wide text-slate-400 uppercase sm:pt-0"><span class="inline-block size-2 shrink-0 rounded-full" :style="{ background: `var(${g.color})` }" aria-hidden="true" />{{ g.head }}</p>
              <ul class="flex flex-wrap gap-x-4 pb-1 sm:block sm:pb-0" :class="col.wide && 'sm:columns-2'">
                <li v-for="l in g.links" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label.replace(' / MPU-6500', '') }}</RouterLink></li>
              </ul>
            </div>
          </div>
        </div>
      </details>
      <!-- the rest: a column each, two groups stacked in some -->
      <div v-for="(col, i) in COLUMNS" :key="i" class="sm:space-y-3">
        <details v-for="g in col" :key="g.head" class="group border-t border-slate-100 py-1.5 sm:border-0 sm:py-0 dark:border-slate-700" :open="wide">
          <summary :class="[head, 'flex cursor-pointer list-none items-center justify-between sm:pointer-events-none']">
            <RouterLink v-if="g.to" :to="g.to" class="pointer-events-auto hover:text-emerald-600">{{ g.head }}</RouterLink>
            <template v-else>{{ g.head }}</template>
            <svg viewBox="0 0 20 20" class="h-4 w-4 transition-transform group-open:rotate-180 sm:hidden" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
          </summary>
          <ul class="flex flex-wrap gap-x-4 pb-1 sm:block sm:pb-0">
            <li v-for="l in g.links" :key="l.to ?? l.href">
              <a v-if="l.href" :href="l.href" :class="link">{{ l.label }}</a>
              <RouterLink v-else :to="l.to" :class="link">{{ l.short ?? l.label }}</RouterLink>
            </li>
          </ul>
        </details>
      </div>
    </nav>
    <div class="mx-auto max-w-5xl px-4 pb-4"><ShareRow /></div>
    <p class="mx-auto max-w-5xl px-4 pb-5 text-xs text-slate-400">
      i2c.ninja · free to use; for copies and reuse, the code under <a href="https://github.com/aguegu/i2c.ninja/blob/main/LICENSE" class="underline hover:text-emerald-600">PolyForm Noncommercial 1.0.0</a>, the text and drawings under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" class="underline hover:text-emerald-600">CC BY-NC-SA 4.0</a>; the drivers, atiic, MIT. The readings are the sensors' own, as their datasheets describe, shown as is: see the <RouterLink to="/about" class="underline hover:text-emerald-600">disclaimer</RouterLink>.
    </p>
  </footer>
</template>
