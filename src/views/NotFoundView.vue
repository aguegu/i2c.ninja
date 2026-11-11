<script setup>
// an address the site doesn't have: say so, and point somewhere useful
import { useRoute } from 'vue-router';
import { DEVICE_LINKS } from '../lib/nav.js';

const route = useRoute();
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">Not found</h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      There's no page at <code class="font-mono">{{ route.path }}</code>. Try a device, or
      <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">get started</RouterLink> with a USB-to-I2C dongle.
    </p>
    <ul class="flex flex-wrap gap-2">
      <li v-for="l in DEVICE_LINKS" :key="l.to">
        <RouterLink :to="l.to" class="inline-block rounded-lg bg-white px-3 py-1.5 shadow-sm hover:text-emerald-600 dark:bg-slate-800">{{ l.label }}</RouterLink>
      </li>
    </ul>
  </main>
</template>
