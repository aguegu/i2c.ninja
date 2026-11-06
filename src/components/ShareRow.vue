<script setup>
// Share this page: the device's own share sheet where the browser has one
// (WeChat, WhatsApp, Telegram, Instagram... through it), plain share links to
// a few networks (nothing loaded from them, no trackers), email, and copy the
// link; each as its logo (Simple Icons, CC0; LinkedIn isn't in it: a plain
// "in" mark). Instagram takes no link from a web page: its button copies the
// link and opens Instagram to paste it. The page's address without its #tab,
// and its title.
import { ref, computed } from 'vue';
import { siX, siFacebook, siReddit, siInstagram } from 'simple-icons';
import { useRoute } from 'vue-router';
import { ORIGIN, pageFor, fullTitle } from '../lib/pages.js';

const route = useRoute();
const url = computed(() => `${ORIGIN}${route.path === '/' ? '/' : route.path}`);
// an alias (/mpu6500) titled as its page, as the router does
const title = computed(() => fullTitle(pageFor(route.matched[0]?.aliasOf?.path ?? route.path)));
const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
const copied = ref(false);

const e = encodeURIComponent;
// LinkedIn's "in", drawn plainly, cut out of a rounded square (evenodd; 24
// units, as Simple Icons)
const LINKEDIN = 'M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2.5 7.5V18h2.8V9.5zm1.4-4.2a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 0 0 0-3.2zM11 9.5V18h2.8v-4.5c0-1.2.3-2.2 1.6-2.2s1.4 1.1 1.4 2.3V18h2.8v-5c0-2.5-.6-3.7-3.1-3.7c-1.3 0-2.1.6-2.6 1.3V9.5z';
const MAIL = 'M3 5h18v14H3zM3 6l9 7l9-7';
const LINK = 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1';
const SHARE = 'M12 3v12M7 8l5-5l5 5M5 13v6h14v-6';
const NETWORKS = [
  { name: 'X', path: siX.path, href: (u, t) => `https://x.com/intent/post?url=${e(u)}&text=${e(t)}` },
  { name: 'Facebook', path: siFacebook.path, href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${e(u)}` },
  { name: 'LinkedIn', path: LINKEDIN, rule: 'evenodd', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(u)}` },
  { name: 'Reddit', path: siReddit.path, href: (u, t) => `https://www.reddit.com/submit?url=${e(u)}&title=${e(t)}` },
];
const INSTAGRAM = siInstagram.path;
const instagramCopied = ref(false);

// Instagram: the link copied, Instagram opened to paste it
async function toInstagram() {
  try {
    await navigator.clipboard.writeText(url.value);
    instagramCopied.value = true;
    setTimeout(() => { instagramCopied.value = false; }, 4000);
  } catch {
    // no clipboard: Instagram opens anyway
  }
  window.open('https://www.instagram.com/', '_blank', 'noopener');
}

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

const icon = 'flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-600 dark:text-slate-400 dark:hover:text-emerald-400';
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Share this page</span>
    <button v-if="canShare" type="button" :class="icon" title="Share…" aria-label="Share…" @click="share">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="SHARE" /></svg>
    </button>
    <a v-for="n in NETWORKS" :key="n.name" :href="n.href(url, title)" target="_blank" rel="noopener noreferrer" :class="icon" :title="`Share on ${n.name}`" :aria-label="`Share on ${n.name}`">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path :d="n.path" :fill-rule="n.rule ?? 'nonzero'" /></svg>
    </a>
    <button type="button" :class="icon" title="Instagram: copy the link, then paste it there" aria-label="Instagram: copy the link and open Instagram" @click="toInstagram">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path :d="INSTAGRAM" /></svg>
    </button>
    <a :href="`mailto:?subject=${e(title)}&body=${e(url)}`" :class="icon" title="Email the link" aria-label="Email the link">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path :d="MAIL" /></svg>
    </a>
    <button type="button" :class="icon" :title="copied ? 'Copied' : 'Copy the link'" aria-label="Copy the link" @click="copy">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path :d="LINK" /></svg>
    </button>
    <span v-if="copied" class="text-xs text-emerald-700 dark:text-emerald-400">link copied</span>
    <span v-if="instagramCopied" class="text-xs text-emerald-700 dark:text-emerald-400">link copied: paste it in Instagram</span>
  </div>
</template>
