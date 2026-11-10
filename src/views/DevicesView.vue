<script setup>
// All the device pages, by group (what a sensor senses: lib/devices.js), a
// card each: its kind, name, maker, what it measures, its address on the bus
import { DEVICES_BY_GROUP } from '../lib/devices.js';
import { NEW_ISSUE } from '../lib/nav.js';

const card = 'flex flex-col rounded-xl border-t-4 bg-white p-4 shadow-sm transition hover:shadow-md hover:ring-2 focus-visible:ring-2 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Devices</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The sensors this site reads live over a USB dongle (a CH347, or a CH341), each with its wiring, its readings explained, and its settings. Every one is field-tested: its driver run on a real module, and its page tried on the bench with that module in hand, before it joined. More join the same way, one at a time.
      </p>
    </div>
    <section v-for="g in DEVICES_BY_GROUP" :key="g.name" :aria-labelledby="`group-${g.name}`">
      <h2 :id="`group-${g.name}`" class="mt-2 flex items-center gap-2 text-lg font-semibold"><span class="inline-block size-3 shrink-0 rounded-full" :style="{ background: `var(${g.color})` }" aria-hidden="true" />{{ g.name }}</h2>
      <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">{{ g.blurb }}</p>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="d in g.devices" :key="d.to" :to="d.to" :class="card" :style="{ borderTopColor: `var(${g.color})`, '--tw-ring-color': `var(${g.color})` }">
          <span class="text-xs font-medium tracking-wide uppercase" :style="{ color: `var(${g.color}-text)` }">{{ d.kind }}</span>
          <span class="mt-1 text-lg font-semibold">{{ d.name }}</span>
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ d.maker }}</span>
          <span class="mt-2 flex-1 leading-relaxed">{{ d.measures }}</span>
          <span class="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ d.bus }}</span>
        </RouterLink>
      </div>
    </section>
    <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
      <b class="font-semibold text-slate-600 dark:text-slate-300">Your sensor isn't here?</b> Ask for it in <a :href="NEW_ISSUE" class="text-emerald-700 underline dark:text-emerald-400">an issue on GitHub</a>.
    </p>
  </main>
</template>
