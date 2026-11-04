<script setup>
const ATIIC = 'https://github.com/aguegu/atiic';
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <header class="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
      <RouterLink
        to="/"
        class="text-lg font-bold"
      >
        i2c.ninja
      </RouterLink>
      <nav class="ml-auto flex gap-4 text-sm text-slate-500 dark:text-slate-400">
        <RouterLink
          to="/setup"
          class="hover:text-emerald-600"
          active-class="text-emerald-600"
        >
          Setup
        </RouterLink>
        <a
          :href="ATIIC"
          class="hover:text-emerald-600"
        >atiic</a>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
