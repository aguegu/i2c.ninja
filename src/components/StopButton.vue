<script setup>
// The pages' stop button: a stop square and "Stop", on its own colour so it
// stands apart from Connect; the click the caller's
</script>

<template>
  <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 active:bg-rose-800">
    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
    <slot>Stop</slot>
  </button>
</template>
