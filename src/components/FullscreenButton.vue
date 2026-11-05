<script setup>
// The expand / shrink icon button for anything that goes full screen
defineProps({ full: { type: Boolean, default: false } });
defineEmits(['toggle']);
</script>

<template>
  <button type="button" class="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :title="full ? 'Exit full screen (Esc)' : 'Full screen'" :aria-label="full ? 'Exit full screen' : 'Full screen'" @click="$emit('toggle')">
    <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path v-if="!full" d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" />
      <path v-else d="M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4" />
    </svg>
  </button>
</template>
