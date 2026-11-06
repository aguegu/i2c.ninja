<script setup>
// Share this page: the device's own share sheet where the browser has one
// (WeChat, WhatsApp, Telegram... through it), plain share links to a few
// networks (nothing loaded from them, no trackers), email, and copy the
// link. The page's address without its #tab, and its title.
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ORIGIN, pageFor, fullTitle } from '../lib/pages.js';

const route = useRoute();
const url = computed(() => `${ORIGIN}${route.path === '/' ? '/' : route.path}`);
// an alias (/mpu6500) titled as its page, as the router does
const title = computed(() => fullTitle(pageFor(route.matched[0]?.aliasOf?.path ?? route.path)));
const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
const copied = ref(false);

const e = encodeURIComponent;
const NETWORKS = [
  { name: 'X', href: (u, t) => `https://x.com/intent/post?url=${e(u)}&text=${e(t)}` },
  { name: 'Facebook', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${e(u)}` },
  { name: 'LinkedIn', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(u)}` },
  { name: 'Reddit', href: (u, t) => `https://www.reddit.com/submit?url=${e(u)}&title=${e(t)}` },
  { name: 'Weibo', href: (u, t) => `https://service.weibo.com/share/share.php?url=${e(u)}&title=${e(t)}` },
  { name: 'Email', href: (u, t) => `mailto:?subject=${e(t)}&body=${e(u)}` },
];

async function share() {
  try {
    await navigator.share({ title: title.value, url: url.value });
  } catch {
    // dismissed, or not allowed here
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // no clipboard: nothing to do
  }
}

const pill = 'rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-600 dark:text-slate-300 dark:hover:text-emerald-400';
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Share this page</span>
    <button v-if="canShare" type="button" :class="pill" @click="share">Share…</button>
    <a v-for="n in NETWORKS" :key="n.name" :href="n.href(url, title)" target="_blank" rel="noopener noreferrer" :class="pill">{{ n.name }}</a>
    <button type="button" :class="pill" @click="copy">{{ copied ? 'Copied' : 'Copy link' }}</button>
  </div>
</template>
