<script setup>
// The frame round every page: the header (the devices and Learn as menus,
// Setup, About, the theme; folded into one menu on a narrow screen) and the
// footer's site map
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavMenu from './components/NavMenu.vue';
import SiteFooter from './components/SiteFooter.vue';
import { useTheme } from './lib/theme.js';
import { DEVICE_LINKS, LEARN_LINKS } from './lib/nav.js';

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
        <RouterLink to="/" class="text-lg font-bold">i2c.ninja</RouterLink>
        <nav class="ml-auto hidden items-center gap-5 text-sm text-slate-500 sm:flex dark:text-slate-400" aria-label="Main">
          <NavMenu label="Devices" :links="DEVICE_LINKS" wide />
          <NavMenu label="Learn" :links="LEARN_LINKS" />
          <RouterLink to="/setup" :class="navLink" active-class="text-emerald-600">Setup</RouterLink>
          <RouterLink to="/about" :class="navLink" active-class="text-emerald-600">About</RouterLink>
        </nav>
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
        <RouterLink to="/setup" :class="mobileLink">Set up the dongle</RouterLink>
        <RouterLink to="/about" :class="mobileLink">About</RouterLink>
      </nav>
    </header>
    <div class="flex-1">
      <RouterView />
    </div>
    <SiteFooter />
  </div>
</template>
