<script setup>
// the About page: src/assets/ABOUT.md and the repo's releases.md, both
// ours, rendered by marked
import { marked } from 'marked';
import { version } from '../../package.json';
import mdAbout from '../assets/ABOUT.md?raw';
import mdReleases from '../../releases.md?raw';

const about = marked.parse(mdAbout);
const releases = marked.parse(mdReleases.replace(/^# Releases\s*/, ''));
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 flex items-center gap-3 text-2xl font-bold">
      About
      <span class="rounded-full border border-emerald-600 px-2 text-sm font-normal text-emerald-700 dark:text-emerald-400">{{ version }}</span>
    </h1>
    <!-- eslint-disable vue/no-v-html -- our own markdown, built into the page -->
    <section class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <div class="md" v-html="about" />
    </section>
    <section class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <h2 class="mb-2 text-lg font-semibold">Releases</h2>
      <div class="md" v-html="releases" />
    </section>
    <!-- eslint-enable vue/no-v-html -->
  </main>
</template>
