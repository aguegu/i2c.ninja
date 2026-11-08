<script setup>
// The pages' connect button: a plug before its label, a spinner while busy
// (choosing, opening, looking); the label is the slot, the click the
// caller's
defineProps({ busy: { type: Boolean, default: false } });
</script>

<template>
  <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="busy">
    <svg v-if="busy" viewBox="0 0 24 24" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
    <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2v4M15 2v4M7 6h10v5a5 5 0 0 1-10 0zM12 16v6" /></svg>
    <slot />
  </button>
</template>
