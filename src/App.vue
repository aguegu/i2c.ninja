<script setup>
import { useTheme } from './lib/theme.js';

const ATIIC = 'https://github.com/aguegu/atiic';
const { dark, toggle } = useTheme();
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
        <button type="button" class="-mr-1 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :title="dark ? 'Light mode' : 'Dark mode'" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <g v-if="dark"><circle cx="10" cy="10" r="3.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" /></g>
            <path v-else d="M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9z" />
          </svg>
        </button>
      </div>
    </header>
    <RouterView />
  </div>
</template>
