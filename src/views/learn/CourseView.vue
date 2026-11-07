<script setup>
// A course: its markdown (lib/courses.js) as a page
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownArticle from '../../components/MarkdownArticle.vue';
import { COURSES } from '../../lib/courses.js';

const route = useRoute();
const course = computed(() => COURSES.find((c) => c.slug === route.params.slug));
const source = ref('');
watch(course, async (c) => { source.value = c ? (await c.markdown()).default : ''; }, { immediate: true });
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div v-if="course" class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Course</p>
      <h1 class="text-2xl font-bold">{{ course.title }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">You'll need: {{ course.kit }}, and a <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">USB dongle (CH341 or CH347)</RouterLink>.</p>
    </div>
    <MarkdownArticle :source="source" />
  </main>
</template>
