<script setup>
// A hint: something to try or notice, beside a light bulb
</script>

<template>
  <p class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
    <svg viewBox="0 0 20 20" class="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10 2.5a5.5 5.5 0 0 0-3.3 9.9c.5.4.8 1 .8 1.6v.5h5v-.5c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 10 2.5z" fill="currentColor" fill-opacity="0.18" />
      <path d="M7.8 16.5h4.4M8.5 18.5h3" />
    </svg>
    <span><slot /></span>
  </p>
</template>
