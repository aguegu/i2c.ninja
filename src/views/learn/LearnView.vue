<script setup>
// Learn: the courses, each a walk through the site's pages in five stages
import { COURSES } from '../../lib/courses.js';

const STAGES = ['the physics', 'the wiring', 'what the sensors give', 'the maths that joins them', 'practice'];
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Learn</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Courses that walk you through this site's pages in order, five stages each: {{ STAGES.join(', ') }}. Each step says where to go, what to do there, and when you're done.
      </p>
    </div>
    <RouterLink v-for="c in COURSES" :key="c.slug" :to="`/learn/${c.slug}`" :class="[card, 'group flex flex-col gap-1']">
      <span class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Course</span>
      <span class="text-lg font-semibold group-hover:text-emerald-600">{{ c.title }}</span>
      <span class="leading-relaxed">{{ c.blurb }}</span>
      <span class="mt-1 text-xs text-slate-500 dark:text-slate-400">you'll need {{ c.kit }}</span>
    </RouterLink>
  </main>
</template>
