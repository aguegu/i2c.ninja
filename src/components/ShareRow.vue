<script setup>
// Share this page: the device's own share sheet where the browser has one
// (WeChat, WhatsApp, Telegram... through it), plain share links to
// a few networks (nothing loaded from them, no trackers), email, and copy the
// link, and a QR code of it to scan from a phone (uqr, drawn here); each as its logo (Simple Icons, CC0; LinkedIn isn't in it: a plain
// "in" mark). The page's address without its #tab,
// and its title.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { renderSVG } from 'uqr';
import { siX, siFacebook, siReddit } from 'simple-icons';
import { useRoute } from 'vue-router';
import { ORIGIN, pageFor, fullTitle } from '../lib/pages.js';

const route = useRoute();
const url = computed(() => `${ORIGIN}${route.path === '/' ? '/' : route.path}`);
// an alias (/mpu6500) titled as its page, as the router does
const page = computed(() => pageFor(route.matched[0]?.aliasOf?.path ?? route.path));
const title = computed(() => fullTitle(page.value));
// the text beside the link on X and Reddit: the page's own name, without
// the site's (X turns a bare "i2c.ninja" into a link of its own and builds
// its card from the first link: the home page's, not this page's)
const shareText = computed(() => (page.value.path === '/' ? title.value : page.value.heading ?? page.value.title));
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
  { name: 'X', path: siX.path, href: (u, t) => `https://x.com/intent/post?url=${e(u)}&text=${e(t)}`, short: true },
  { name: 'Facebook', path: siFacebook.path, href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${e(u)}` },
  { name: 'LinkedIn', path: LINKEDIN, rule: 'evenodd', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(u)}` },
  { name: 'Reddit', path: siReddit.path, href: (u, t) => `https://www.reddit.com/submit?url=${e(u)}&title=${e(t)}`, short: true },
];
// the QR code: a pop-up, dark on white whatever the theme (scanners need it);
// shut by a click outside or Esc
const QR = 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2M6 6h1M17 6h1M6 17h1';
const qrOpen = ref(false);
const qrBox = ref(null);
const qrSvg = computed(() => (qrOpen.value ? renderSVG(url.value, { border: 2 }) : ''));
const onDoc = (ev) => { if (qrOpen.value && qrBox.value && !qrBox.value.contains(ev.target)) qrOpen.value = false; };
const onKey = (ev) => { if (ev.key === 'Escape') qrOpen.value = false; };
onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); });

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
    <a v-for="n in NETWORKS" :key="n.name" :href="n.href(url, n.short ? shareText : title)" target="_blank" rel="noopener noreferrer" :class="icon" :title="`Share on ${n.name}`" :aria-label="`Share on ${n.name}`">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path :d="n.path" :fill-rule="n.rule ?? 'nonzero'" /></svg>
    </a>
    <a :href="`mailto:?subject=${e(title)}&body=${e(url)}`" :class="icon" title="Email the link" aria-label="Email the link">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path :d="MAIL" /></svg>
    </a>
    <button type="button" :class="icon" :title="copied ? 'Copied' : 'Copy the link'" aria-label="Copy the link" @click="copy">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path :d="LINK" /></svg>
    </button>
    <div ref="qrBox" class="relative">
      <button type="button" :class="icon" title="A QR code of the link" aria-label="Show a QR code of the link" :aria-expanded="qrOpen" @click="qrOpen = !qrOpen">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path :d="QR" /></svg>
      </button>
      <div v-if="qrOpen" class="absolute bottom-10 left-1/2 z-20 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-lg dark:border-slate-700">
        <!-- eslint-disable-next-line vue/no-v-html -- uqr's SVG of our own address -->
        <div class="qr" v-html="qrSvg" />
        <p class="mt-2 font-mono text-[11px] break-all text-slate-600">{{ url }}</p>
        <p class="text-xs text-slate-500">scan it with a phone's camera</p>
      </div>
    </div>
    <span v-if="copied" class="text-xs text-emerald-700 dark:text-emerald-400">link copied</span>
  </div>
</template>

<style>
.qr svg { display: block; width: 100%; height: auto; }
</style>
