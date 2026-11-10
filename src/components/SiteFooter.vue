<script setup>
// The footer: the site map (every page, from lib/nav.js), share this page,
// and the license.
// Kept short as the devices and physics topics grow: they fill rows across
// the full width (the devices a line per group, its name first; the topics
// by their short names); the other groups share
// the row under them. On a phone those groups fold to their headings (open from sm up).
import { DEVICE_LINK_GROUPS, PHYSICS_LINKS, ALGORITHM_LINKS, START_LINKS, ELSEWHERE_LINKS } from '../lib/nav.js';
import { COURSE_LINKS } from '../lib/courses.js';
import ShareRow from './ShareRow.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const link = 'text-slate-600 hover:text-emerald-600 dark:text-slate-300';
const head = 'mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase';
const start = START_LINKS.filter((l) => l.to !== '/'); // the logo is home
const GROUPS = [
  { head: 'Algorithms', links: ALGORITHM_LINKS },
  { head: 'Learn', links: COURSE_LINKS },
  { head: 'Get started', links: start },
  { head: 'Elsewhere', links: ELSEWHERE_LINKS },
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
  <footer class="mt-12 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <nav class="mx-auto flex max-w-5xl flex-col gap-1.5 px-4 py-6 text-sm leading-6 sm:gap-5" aria-label="Site map">
      <details class="group" :open="wide">
        <summary :class="[head, 'flex cursor-pointer list-none items-center justify-between sm:pointer-events-none']">
          <RouterLink to="/devices" class="pointer-events-auto hover:text-emerald-600">Devices</RouterLink>
          <svg viewBox="0 0 20 20" class="h-4 w-4 transition-transform group-open:rotate-180 sm:hidden" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
        </summary>
        <div class="grid gap-x-4 sm:grid-cols-[6.5rem_1fr]">
          <template v-for="g in DEVICE_LINK_GROUPS" :key="g.head">
            <p class="flex items-center gap-1.5 pt-1 text-[11px] tracking-wide text-slate-400 uppercase sm:pt-0.5"><span class="inline-block size-2 shrink-0 rounded-full" :style="{ background: `var(${g.color})` }" aria-hidden="true" />{{ g.head }}</p>
            <ul class="flex flex-wrap gap-x-4 pb-1 sm:pb-0">
              <li v-for="l in g.links" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.label.replace(' / MPU-6500', '') }}</RouterLink></li>
            </ul>
          </template>
        </div>
      </details>
      <details class="group border-t border-slate-100 py-1.5 sm:border-0 sm:py-0 dark:border-slate-700" :open="wide">
        <summary :class="[head, 'flex cursor-pointer list-none items-center justify-between sm:pointer-events-none']">
          Physics
          <svg viewBox="0 0 20 20" class="h-4 w-4 transition-transform group-open:rotate-180 sm:hidden" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
        </summary>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 pb-1 sm:pb-0">
          <li v-for="l in PHYSICS_LINKS" :key="l.to"><RouterLink :to="l.to" :class="link">{{ l.short }}</RouterLink></li>
        </ul>
      </details>
      <div class="grid gap-x-8 sm:grid-cols-4 sm:gap-y-5">
        <details v-for="g in GROUPS" :key="g.head" class="group border-t border-slate-100 py-1.5 sm:border-0 sm:py-0 dark:border-slate-700" :open="wide">
          <summary :class="[head, 'flex cursor-pointer list-none items-center justify-between sm:pointer-events-none sm:mb-1.5']">
            {{ g.head }}
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
      i2c.ninja · free for noncommercial use: the code under <a href="https://github.com/aguegu/i2c.ninja/blob/main/LICENSE" class="underline hover:text-emerald-600">PolyForm Noncommercial 1.0.0</a>, the text and drawings under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" class="underline hover:text-emerald-600">CC BY-NC-SA 4.0</a>; the drivers, atiic, MIT. The readings are the sensors' own, as their datasheets describe, shown as is: see the <RouterLink to="/about" class="underline hover:text-emerald-600">disclaimer</RouterLink>.
    </p>
  </footer>
</template>
