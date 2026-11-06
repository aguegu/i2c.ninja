<script setup>
// The blog: its posts, newest first
import { POSTS, BYLINE } from '../lib/blog.js';

const card = 'flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm ring-emerald-600 transition hover:shadow-md hover:ring-2 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Blog</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">How i2c.ninja and its drivers, <a href="https://github.com/aguegu/atiic" class="text-emerald-700 underline dark:text-emerald-400">atiic</a>, come about: the sensors, the ideas, the questions, and the mistakes on the way.</p>
    </div>
    <RouterLink v-for="p in POSTS" :key="p.slug" :to="`/blog/${p.slug}`" :class="card">
      <span class="text-xs text-slate-500 dark:text-slate-400">{{ p.date }} · {{ p.version }}</span>
      <span class="text-lg font-semibold">{{ p.title }}</span>
      <span class="leading-relaxed">{{ p.summary }}</span>
    </RouterLink>
    <p class="text-xs text-slate-500 dark:text-slate-400">Written {{ BYLINE }}.</p>
  </main>
</template>
