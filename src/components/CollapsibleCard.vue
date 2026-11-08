<script setup>
// A card that can be minimised, as an expansion panel: a button in its
// corner folds it to one line, its title, and back. Folded, its content is
// taken out of the page (its charts and drawings stop, their data still
// kept by the page, so they come back with their history): a lesson can keep
// only what it needs, and the page gets lighter. Remembered per page in this
// browser (localStorage; forgotten where that's blocked).
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  id: { type: String, required: true }, // the card's name on its page, for remembering
  title: { type: String, required: true }, // shown folded, and named on the button
});

const key = `i2c.ninja.folded:${useRoute().path}:${props.id}`;
const remembered = () => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const folded = ref(remembered());
watch(folded, (v) => {
  try {
    if (v) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch {
    // not remembered: fine
  }
});
</script>

<template>
  <section class="relative rounded-xl bg-white p-4 pr-12 shadow-sm dark:bg-slate-800">
    <button type="button" class="absolute top-3 right-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :aria-expanded="!folded" :aria-label="`${folded ? 'Expand' : 'Minimise'}: ${title}`" :title="folded ? 'Expand' : 'Minimise'" @click="folded = !folded">
      <svg viewBox="0 0 20 20" class="h-5 w-5 transition-transform" :class="folded && '-rotate-90'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
    </button>
    <button v-if="folded" type="button" class="text-left text-lg font-semibold hover:text-emerald-700 dark:hover:text-emerald-400" @click="folded = false">{{ title }}</button>
    <slot v-else />
  </section>
</template>
