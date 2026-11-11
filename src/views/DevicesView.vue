<script setup>
// All the device pages, by group (what a sensor senses: lib/devices.js), a
// card each: its kind, name, maker, what it measures, its address on the bus;
// a quick filter top right (lib/deviceSearch.js), kept in the address as ?q=
// so a filtered list can be shared; / focuses it, Esc clears it
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DEVICES, DEVICES_BY_GROUP } from '../lib/devices.js';
import { NEW_ISSUE } from '../lib/nav.js';
import { matches } from '../lib/deviceSearch.js';

const route = useRoute();
const router = useRouter();
const query = ref(typeof route.query.q === 'string' ? route.query.q : '');
const box = ref(null);
const shown = computed(() => DEVICES_BY_GROUP.map((g) => ({ ...g, devices: g.devices.filter((d) => matches(d, query.value)) })).filter((g) => g.devices.length));
const count = computed(() => shown.value.reduce((n, g) => n + g.devices.length, 0));
watch(query, (q) => router.replace({ query: q.trim() ? { q } : {} }));
// / to the box, as on GitHub; not while typing somewhere
function onKey(e) {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
  e.preventDefault();
  box.value?.focus();
}
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));

const card = 'flex flex-col rounded-xl border-t-4 bg-white p-4 shadow-sm transition hover:shadow-md hover:ring-2 focus-visible:ring-2 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 class="text-2xl font-bold">Devices</h1>
        <label class="relative w-full sm:w-64">
          <span class="sr-only">Filter the sensors</span>
          <svg viewBox="0 0 20 20" class="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l4 4" /></svg>
          <input ref="box" v-model="query" type="search" placeholder="Filter: name, type, 0x44…" autocomplete="off" spellcheck="false" class="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800" @keydown.esc="query = ''">
        </label>
      </div>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The sensors this site reads live over a USB-to-I2C dongle (a CH347, or a CH341), each with its wiring, its readings explained, and its settings. Every one is field-tested: its driver run on a real module, and its page tried on the bench with that module in hand, before it joined. More join the same way, one at a time.
      </p>
    </div>
    <p v-if="query.trim()" class="-mt-2 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">{{ count }} of {{ DEVICES.length }} sensors</p>
    <section v-for="g in shown" :key="g.name" :aria-labelledby="`group-${g.name}`">
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
      <b class="font-semibold text-slate-600 dark:text-slate-300">{{ count ? 'Your sensor isn\'t here?' : `No sensor matches “${query.trim()}”.` }}</b> Ask for it in <a :href="NEW_ISSUE" class="text-emerald-700 underline dark:text-emerald-400">an issue on GitHub</a>.
    </p>
  </main>
</template>
