<script setup>
// the About page: two tabs, src/assets/ABOUT.md and the repo's
// releases.md, both ours, rendered by marked; the tab kept in the address
// (/about#releases) so each can be linked
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import { version } from '../../package.json';
import mdAbout from '../assets/ABOUT.md?raw';
import mdReleases from '../../releases.md?raw';

const about = marked.parse(mdAbout);
const releases = marked.parse(mdReleases.replace(/^# Releases\s*/, ''));
const TABS = [
  { key: 'about', label: 'About', hash: '' },
  { key: 'releases', label: 'Releases', hash: '#releases' },
];

const route = useRoute();
const router = useRouter();
const tab = computed(() => (route.hash === '#releases' ? 'releases' : 'about'));
const pick = (t) => router.replace({ hash: t.hash });
const on = 'border-emerald-600 text-emerald-700 dark:text-emerald-400';
const off = 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 flex items-center gap-3 text-2xl font-bold">
      About
      <span class="rounded-full border border-emerald-600 px-2 text-sm font-normal text-emerald-700 dark:text-emerald-400">{{ version }}</span>
    </h1>
    <div class="flex gap-4 border-b border-slate-200 dark:border-slate-700" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" class="-mb-px border-b-2 px-1 pb-2 font-medium" :class="tab === t.key ? on : off" @click="pick(t)">{{ t.label }}</button>
    </div>
    <!-- eslint-disable vue/no-v-html -- our own markdown, built into the page -->
    <section v-if="tab === 'about'" class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800" role="tabpanel">
      <div class="md" v-html="about" />
    </section>
    <section v-else class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800" role="tabpanel">
      <div class="md" v-html="releases" />
    </section>
    <!-- eslint-enable vue/no-v-html -->
  </main>
</template>
