<script setup>
// A formula, written in LaTeX, drawn by KaTeX (its HTML, with MathML for
// screen readers). display: on a line of its own, centred.
import { computed } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const props = defineProps({
  expr: { type: String, required: true },
  display: { type: Boolean, default: false },
});
const html = computed(() => katex.renderToString(props.expr, { displayMode: props.display, throwOnError: false }));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- KaTeX's output for our own constant formulas -->
  <span v-html="html" />
</template>
