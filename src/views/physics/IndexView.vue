<script setup>
// Physics: the topics, a card each (lib/physics.js): its icon, title and
// what it explains (the icon in its sensors' group colour), and the sensors
// that measure it, each a chip in its device group's colour (lib/devices.js),
// linking to its page
import { PHYSICS } from '../../lib/physics.js';
import { groupColorOf, topicColor } from '../../lib/topicColor.js';

const TOPICS = PHYSICS.filter((p) => p.component);

const card = 'flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const chip = 'flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Physics</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The ideas behind the sensors, a page each: what's being measured, how a chip measures it, and its limits, with the readings live from a sensor on a USB-to-I²C bridge and things to try. Each topic names the sensors that measure it.
      </p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <section v-for="t in TOPICS" :key="t.slug" :class="card" :aria-labelledby="`topic-${t.slug}`">
        <RouterLink :to="`/physics/${t.slug}`" class="group flex items-start gap-3">
          <svg viewBox="0 0 24 24" class="mt-0.5 h-7 w-7 shrink-0" :style="{ color: `var(${topicColor(t)}-text)` }" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="t.icon" /></svg>
          <span>
            <span :id="`topic-${t.slug}`" class="block text-lg font-semibold group-hover:text-emerald-600">{{ t.title }}</span>
            <span class="mt-1 block leading-relaxed text-slate-600 dark:text-slate-300">{{ t.blurb }}</span>
          </span>
        </RouterLink>
        <ul class="mt-auto flex flex-wrap gap-2 pt-1 pl-10" aria-label="Measured by">
          <li v-for="d in t.devices" :key="d.to">
            <RouterLink :to="d.to" :class="chip" :title="d.note">
              <span class="inline-block size-2 shrink-0 rounded-full" :style="{ background: `var(${groupColorOf(d.to)})` }" aria-hidden="true" />{{ d.label }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
