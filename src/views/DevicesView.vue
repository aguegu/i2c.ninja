<script setup>
// All the device pages, a card each: its kind, name, maker, what it
// measures, its address on the bus
import { DEVICES } from '../lib/devices.js';

const card = 'flex flex-col rounded-xl bg-white p-4 shadow-sm ring-emerald-600 transition hover:shadow-md hover:ring-2 focus-visible:ring-2 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Devices</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The sensors this site reads live over a CH341 dongle, each with its wiring, its readings explained, and its settings. More join one at a time, each once its driver and its page have run on a real one.
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="d in DEVICES" :key="d.to" :to="d.to" :class="card">
        <span class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{{ d.kind }}</span>
        <span class="mt-1 text-lg font-semibold">{{ d.name }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ d.maker }}</span>
        <span class="mt-2 flex-1 leading-relaxed">{{ d.measures }}</span>
        <span class="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ d.bus }}</span>
      </RouterLink>
    </div>
  </main>
</template>
