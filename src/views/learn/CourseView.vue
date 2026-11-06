<script setup>
// A course: its markdown (lib/courses.js) as a page. Links to the site's own
// pages go through the router; headings get ids, so a step can be linked
// (#questions).
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Marked } from 'marked';
import { COURSES } from '../../lib/courses.js';

const route = useRoute();
const router = useRouter();
const course = computed(() => COURSES.find((c) => c.slug === route.params.slug));
const html = ref('');

const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const md = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(text.replace(/^\d+\.\s*/, ''))}">${text}</h${depth}>\n`;
    },
  },
});

watch(course, async (c) => {
  html.value = c ? md.parse((await c.markdown()).default) : '';
  await nextTick();
  if (route.hash) document.getElementById(route.hash.slice(1))?.scrollIntoView();
}, { immediate: true });

// a link to one of the site's pages: the router, not a page load
function follow(e) {
  const a = e.target.closest('a');
  const href = a?.getAttribute('href');
  if (!href || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (href.startsWith('#')) { e.preventDefault(); router.replace({ hash: href }); document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' }); return; }
  if (href.startsWith('/')) { e.preventDefault(); router.push(href); }
}
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div v-if="course" class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Course</p>
      <h1 class="text-2xl font-bold">{{ course.title }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">You'll need: {{ course.kit }}, and a <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">CH341 dongle</RouterLink>.</p>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- our own course files, rendered by marked -->
    <article class="course rounded-xl bg-white p-4 leading-relaxed shadow-sm sm:p-6 dark:bg-slate-800" @click="follow" v-html="html" />
  </main>
</template>

<style>
/* the course's markdown: plain CSS, not scoped (v-html content); .course is
   this page's only. Dark as the site's dark: variant (style.css) */
.course h2 { margin: 1.75rem 0 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--chart-grid); font-size: 1.25rem; font-weight: 600; }
.course p { margin: 0.5rem 0; }
.course ol { list-style: decimal; padding-left: 1.5rem; }
.course ul { list-style: disc; padding-left: 1.5rem; }
.course li { margin: 0.5rem 0; }
.course li > ul { margin-top: 0.25rem; }
.course a { color: var(--color-emerald-700); text-decoration: underline; }
.course em { color: var(--color-slate-500); }
.course details { margin: 0.5rem 0; padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-slate-50); }
.course summary { cursor: pointer; font-weight: 600; }
.course details[open] summary { margin-bottom: 0.5rem; }
[data-theme="dark"] .course a { color: var(--color-emerald-400); }
[data-theme="dark"] .course em { color: var(--color-slate-400); }
[data-theme="dark"] .course details { background: var(--color-slate-900); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .course a { color: var(--color-emerald-400); }
  :root:not([data-theme="light"]) .course em { color: var(--color-slate-400); }
  :root:not([data-theme="light"]) .course details { background: var(--color-slate-900); }
}
</style>
