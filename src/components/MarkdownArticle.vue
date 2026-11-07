<script setup>
// A markdown page's body (a course, a blog post): the markdown drawn by
// marked, headings given ids (so a step can be linked: #questions), links to
// the site's own pages through the router, a #hash in the address scrolled to
import { ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Marked } from 'marked';

const props = defineProps({ source: { type: String, default: '' } });
const route = useRoute();
const router = useRouter();
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

watch(() => props.source, async (src) => {
  html.value = src ? md.parse(src) : '';
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
  <!-- eslint-disable-next-line vue/no-v-html -- our own markdown files, rendered by marked -->
  <article class="markdown rounded-xl bg-white p-4 leading-relaxed shadow-sm sm:p-6 dark:bg-slate-800" @click="follow" v-html="html" />
</template>

<style>
/* markdown pages (courses, the blog): plain CSS, not scoped (v-html
   content). Dark as the site's dark: variant (style.css) */
.markdown h2 { margin: 1.75rem 0 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--chart-grid); font-size: 1.25rem; font-weight: 600; }
.markdown p { margin: 0.5rem 0; }
.markdown ol { list-style: decimal; padding-left: 1.5rem; }
.markdown ul { list-style: disc; padding-left: 1.5rem; }
.markdown li { margin: 0.5rem 0; }
.markdown li > ul { margin-top: 0.25rem; }
.markdown a { color: var(--color-emerald-700); text-decoration: underline; }
.markdown em { color: var(--color-slate-500); }
.markdown details { margin: 0.5rem 0; padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-slate-50); }
.markdown img { display: block; width: 100%; max-width: 720px; height: auto; margin: 1rem auto; }
.markdown table { width: 100%; margin: 1rem 0; border-collapse: collapse; font-size: 0.95em; }
.markdown th { text-align: left; font-weight: 600; padding: 0.4rem 0.75rem 0.4rem 0; border-bottom: 2px solid var(--chart-grid); }
.markdown td { vertical-align: top; padding: 0.45rem 0.75rem 0.45rem 0; border-bottom: 1px solid var(--chart-grid); }
.markdown td:first-child { white-space: nowrap; font-weight: 500; }
.markdown blockquote { margin: 0.75rem 0; padding: 0.25rem 0 0.25rem 1rem; border-left: 3px solid var(--color-emerald-600); color: var(--color-slate-600); font-style: italic; }
.markdown h3 { margin: 1.25rem 0 0.5rem; font-weight: 600; }
.markdown code { font-family: ui-monospace, monospace; font-size: 0.9em; }
.markdown summary { cursor: pointer; font-weight: 600; }
.markdown details[open] summary { margin-bottom: 0.5rem; }
[data-theme="dark"] .markdown a { color: var(--color-emerald-400); }
[data-theme="dark"] .markdown em { color: var(--color-slate-400); }
[data-theme="dark"] .markdown blockquote { color: var(--color-slate-300); }
[data-theme="dark"] .markdown details { background: var(--color-slate-900); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .markdown a { color: var(--color-emerald-400); }
  :root:not([data-theme="light"]) .markdown em { color: var(--color-slate-400); }
  :root:not([data-theme="light"]) .markdown blockquote { color: var(--color-slate-300); }
  :root:not([data-theme="light"]) .markdown details { background: var(--color-slate-900); }
}
</style>
