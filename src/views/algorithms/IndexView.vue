<script setup>
// Algorithms: the topics, a card each (lib/algorithms.js): its icon, title
// and what it works out, and the physics it combines, each a chip in that
// topic's colour (lib/topicColor.js), linking to its page
import { ALGORITHMS } from '../../lib/algorithms.js';
import { PHYSICS } from '../../lib/physics.js';
import { topicColor } from '../../lib/topicColor.js';

const TOPICS = ALGORITHMS.filter((a) => a.component).map((a) => ({
  ...a,
  physics: a.combines.map((slug) => PHYSICS.find((p) => p.slug === slug)).filter((p) => p?.component),
}));

const card = 'flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const chip = 'flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Algorithms</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The maths that turns readings into understanding, a page each: what no single sensor gives, worked out step by step, every formula with its live numbers from sensors on a USB-to-I²C bridge. Each names the physics it combines.
      </p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <section v-for="t in TOPICS" :key="t.slug" :class="card" :aria-labelledby="`algorithm-${t.slug}`">
        <RouterLink :to="`/algorithms/${t.slug}`" class="group flex items-start gap-3">
          <svg viewBox="0 0 24 24" class="mt-0.5 h-7 w-7 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
          <span>
            <span :id="`algorithm-${t.slug}`" class="block text-lg font-semibold group-hover:text-emerald-600">{{ t.title }}</span>
            <span class="mt-1 block leading-relaxed text-slate-600 dark:text-slate-300">{{ t.blurb }}</span>
          </span>
        </RouterLink>
        <ul class="mt-auto flex flex-wrap gap-2 pt-1 pl-10" aria-label="Combines">
          <li v-for="p in t.physics" :key="p.slug">
            <RouterLink :to="`/physics/${p.slug}`" :class="chip">
              <svg viewBox="0 0 24 24" class="size-4 shrink-0" :style="{ color: `var(${topicColor(p)}-text)` }" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="p.icon" /></svg>{{ p.title }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
