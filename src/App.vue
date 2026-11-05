<script setup>
// The frame round every page: the header (the devices and Learn as menus,
// Setup, About, the theme; folded into one menu on a narrow screen) and the
// footer's site map
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavMenu from './components/NavMenu.vue';
import SiteFooter from './components/SiteFooter.vue';
import { useTheme } from './lib/theme.js';
import { DEVICE_LINKS, LEARN_LINKS, ATIIC } from './lib/nav.js';
import { version } from '../package.json';

const { dark, toggle } = useTheme();
const mobile = ref(false);
const route = useRoute();
watch(() => route.fullPath, () => { mobile.value = false; });
const navLink = 'hover:text-emerald-600';
const mobileLink = 'block rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700';
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <header class="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div class="mx-auto flex h-14 max-w-5xl items-center gap-5 px-4">
        <div class="flex items-center gap-2">
          <RouterLink to="/" class="text-lg font-bold">i2c.ninja</RouterLink>
          <RouterLink to="/about#releases" class="rounded-full border border-slate-300 px-2 py-0.5 font-mono text-xs text-slate-500 hover:border-emerald-600 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-400" :title="`Version ${version}: the releases`">{{ version }}</RouterLink>
        </div>
        <nav class="ml-auto hidden items-center gap-5 text-sm text-slate-500 sm:flex dark:text-slate-400" aria-label="Main">
          <NavMenu label="Devices" :links="DEVICE_LINKS" wide />
          <NavMenu label="Learn" :links="LEARN_LINKS" />
          <RouterLink to="/get-started" :class="navLink" active-class="text-emerald-600">Get started</RouterLink>
        </nav>
        <a :href="ATIIC" class="hidden rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:block dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" title="atiic on GitHub: the drivers" aria-label="atiic on GitHub">
          <svg viewBox="0 0 16 16" class="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
        </a>
        <button type="button" class="ml-auto rounded p-1 text-slate-500 hover:bg-slate-100 sm:hidden dark:text-slate-400 dark:hover:bg-slate-700" :aria-expanded="mobile" aria-label="Menu" @click="mobile = !mobile">
          <svg viewBox="0 0 20 20" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path v-if="!mobile" d="M3 6h14M3 10h14M3 14h14" />
            <path v-else d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
        <button type="button" class="-mr-1 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" :title="dark ? 'Light mode' : 'Dark mode'" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <g v-if="dark"><circle cx="10" cy="10" r="3.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" /></g>
            <path v-else d="M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9z" />
          </svg>
        </button>
      </div>
      <nav v-if="mobile" class="border-t border-slate-200 px-4 py-3 text-sm sm:hidden dark:border-slate-700" aria-label="Main">
        <p class="px-3 pt-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Devices</p>
        <RouterLink v-for="l in DEVICE_LINKS" :key="l.to" :to="l.to" :class="mobileLink">{{ l.label }} <span class="text-xs text-slate-400">{{ l.note }}</span></RouterLink>
        <p class="px-3 pt-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Learn</p>
        <RouterLink v-for="l in LEARN_LINKS" :key="l.to" :to="l.to" :class="mobileLink">{{ l.label }}</RouterLink>
        <p class="px-3 pt-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">More</p>
        <RouterLink to="/get-started" :class="mobileLink">Set up the dongle</RouterLink>
        <a :href="ATIIC" :class="mobileLink">atiic on GitHub <span class="text-xs text-slate-400">the drivers</span></a>
      </nav>
    </header>
    <div class="flex-1">
      <RouterView />
    </div>
    <SiteFooter />
  </div>
</template>
