<script setup>
// A header menu: a button opening a list of links below it; shut by a
// click outside, Esc, or going to a page. Links carrying a group (the
// devices) get its name as a small heading before the group's first
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  label: { type: String, required: true },
  links: { type: Array, required: true }, // [{ to, label, note, icon (a 24-unit SVG path, optional), group (optional) }]
  wide: { type: Boolean, default: false },
  recent: { type: Array, default: () => [] }, // [{ to, label, note }]: shown on top, under "Recent"
  all: { type: Object, default: null }, // { to, label }: a page listing them all, at the foot
});

const open = ref(false);
const root = ref(null);
const route = useRoute();
const startsGroup = (i) => props.links[i].group && props.links[i].group !== props.links[i - 1]?.group;
const active = () => props.links.some((l) => route.path === l.to || route.path.startsWith(`${l.to}/`)) || (props.all && route.path === props.all.to);

watch(() => route.fullPath, () => { open.value = false; });
const onDoc = (e) => { if (open.value && root.value && !root.value.contains(e.target)) open.value = false; };
const onKey = (e) => { if (e.key === 'Escape') open.value = false; };
onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); });
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" class="flex items-center gap-1 hover:text-emerald-600" :class="active() && 'text-emerald-600'" :aria-expanded="open" @click="open = !open">
      {{ label }}
      <svg viewBox="0 0 20 20" class="h-4 w-4 transition-transform" :class="open && 'rotate-180'" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
    </button>
    <div v-if="open" class="absolute right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800" :class="wide ? 'grid w-[28rem] grid-cols-2 gap-x-2' : 'w-64'">
      <template v-if="recent.length">
        <p class="col-span-full px-3 pt-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Recent</p>
        <RouterLink v-for="l in recent" :key="`r${l.to}`" :to="l.to" class="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700" :class="l.icon ? 'flex items-center gap-2' : 'block'" exact-active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <svg v-if="l.icon" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="l.icon" /></svg>
          {{ l.label }}<span v-if="l.note" class="ml-1.5 text-xs text-slate-400">{{ l.note }}</span>
        </RouterLink>
        <p class="col-span-full mt-1 border-t border-slate-200 px-3 pt-2 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:border-slate-700">All</p>
      </template>
      <template v-for="(l, i) in links" :key="l.to">
        <p v-if="startsGroup(i)" class="col-span-full flex items-center gap-1.5 px-3 pt-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase"><span class="inline-block size-2 shrink-0 rounded-full" :style="{ background: `var(${l.groupColor})` }" aria-hidden="true" />{{ l.group }}</p>
        <RouterLink :to="l.to" class="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700" :class="l.icon ? 'flex items-center gap-2' : 'block'" exact-active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <svg v-if="l.icon" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="l.icon" /></svg>
          {{ l.label }}<span v-if="l.note" class="ml-1.5 text-xs text-slate-400">{{ l.note }}</span>
        </RouterLink>
      </template>
      <RouterLink v-if="all" :to="all.to" class="col-span-full mt-1 block rounded-lg border-t border-slate-200 px-3 pt-2 pb-1.5 text-sm font-medium text-emerald-700 hover:bg-slate-100 dark:border-slate-700 dark:text-emerald-400 dark:hover:bg-slate-700">{{ all.label }} →</RouterLink>
    </div>
  </div>
</template>
