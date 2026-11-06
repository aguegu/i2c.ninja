<script setup>
// A blog post: its markdown (lib/blog.js) as a page, its date, byline and
// release above it
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownArticle from '../components/MarkdownArticle.vue';
import { POSTS, BYLINE } from '../lib/blog.js';

const route = useRoute();
const post = computed(() => POSTS.find((p) => p.slug === route.params.slug));
const source = ref('');
watch(post, async (p) => { source.value = p ? (await p.markdown()).default : ''; }, { immediate: true });
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-4 p-4">
    <div v-if="post" class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400"><RouterLink to="/blog">Blog</RouterLink></p>
      <h1 class="text-2xl font-bold">{{ post.title }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ post.date }} · {{ BYLINE }} · <RouterLink to="/about#releases" :class="link">{{ post.version }}</RouterLink></p>
    </div>
    <p v-else class="mt-2">No such post. <RouterLink to="/blog" :class="link">All posts</RouterLink>.</p>
    <img v-if="post?.banner" :src="post.banner.src" :alt="post.banner.alt" class="w-full rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
    <MarkdownArticle v-if="post" :source="source" />
  </main>
</template>
