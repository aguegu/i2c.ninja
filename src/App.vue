<script setup>
const ATIIC = 'https://github.com/aguegu/atiic';
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <header class="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div class="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <RouterLink to="/" class="text-lg font-bold">i2c.ninja</RouterLink>
        <nav class="ml-auto flex gap-4 text-sm text-slate-500 dark:text-slate-400">
          <RouterLink to="/learn/imu" class="hover:text-emerald-600" active-class="text-emerald-600">Learn</RouterLink>
          <RouterLink to="/setup" class="hover:text-emerald-600" active-class="text-emerald-600">Setup</RouterLink>
          <RouterLink to="/about" class="hover:text-emerald-600" active-class="text-emerald-600">About</RouterLink>
          <a :href="ATIIC" class="hover:text-emerald-600">atiic</a>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>
