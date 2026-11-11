<script setup>
// The bridges we know: side by side, then each with its cheatsheet, how to
// recognise it and the words that find it (lib/dongles.js)
import SvgDrawing from '../components/SvgDrawing.vue';
import { DONGLES, COMPARE, STARS, EFFORT } from '../lib/dongles.js';
import { NEW_ISSUE } from '../lib/nav.js';

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <h1 class="mt-2 text-2xl font-bold">USB-to-I²C bridges</h1>
    <p class="leading-relaxed text-slate-500 dark:text-slate-400">
      A USB-to-I²C bridge, a small board or a devkit such as WCH's CH347F
      evaluation board, connects the computer to the I2C bus. They
      come as many boards under many names; these are the ones we ran on our
      bench, WCH's CH347F evaluation board first (high-speed USB, I2C, SPI
      and eight I/O lines at once, no modes to set),
      each drawn from the board itself and its chip's datasheet. Any
      CH341 that shows up as USB ID 1A86 5512 in I2C mode, or a CH347 as 1A86
      55DB (a CH347T in mode 1) or 55DE (a CH347F), should run this site, but
      these are the ones we know. Setting one up:
      <RouterLink to="/get-started" :class="link">Get started</RouterLink>.
    </p>

    <section :class="card">
      <h2 class="mb-3 text-lg font-semibold">Side by side</h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="py-2 pr-3" />
              <th v-for="d in DONGLES" :key="d.id" class="py-2 pr-3 font-semibold">
                <a :href="`#${d.id}`" class="hover:text-emerald-600">{{ d.name }}</a>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in COMPARE" :key="r.label" class="border-b border-slate-100 align-top last:border-0 dark:border-slate-700/60">
              <th class="py-2 pr-3 font-medium text-slate-500 dark:text-slate-400">{{ r.label }}</th>
              <td v-for="(c, i) in r.cells" :key="i" class="py-2 pr-3">{{ c }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-for="d in DONGLES" :id="d.id" :key="d.id" :class="card" class="scroll-mt-4">
      <div class="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 class="text-lg font-semibold">{{ d.name }}</h2>
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ d.kind }}</span>
        <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :title="`Difficulty: ${d.effortWhy}`">
          <span aria-hidden="true">{{ STARS(d.effort) }}</span> {{ EFFORT[d.effort] }}
        </span>
        <span v-if="d.recommended" class="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">recommended</span>
        <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="d.site ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
          {{ d.site ? 'runs this site' : 'not on this site yet' }}
        </span>
      </div>
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="md:w-1/2">
          <SvgDrawing :src="d.sheet" :alt="d.alt" class="mx-auto w-full max-w-md" />
          <a :href="d.sheet" target="_blank" rel="noopener" class="mt-1 block text-center text-sm" :class="link">Open the full cheatsheet</a>
        </div>
        <div class="flex flex-col gap-3 md:w-1/2">
          <div>
            <p class="text-sm font-medium">How to recognise it</p>
            <ul class="list-disc pl-5 text-sm leading-relaxed">
              <li v-for="l in d.look" :key="l">{{ l }}</li>
            </ul>
          </div>
          <p class="text-sm">
            <span class="font-medium">Difficulty:</span> {{ STARS(d.effort) }} {{ EFFORT[d.effort] }}, {{ d.effortWhy }}.
          </p>
          <p class="text-sm">
            <span class="font-medium">Search for:</span>
            <code class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-900">{{ d.search }}</code>
          </p>
          <p class="text-sm leading-relaxed">{{ d.note }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            More in atiic: <a :href="d.doc" :class="link">its notes on the chip</a>.
          </p>
        </div>
      </div>
    </section>

    <p class="text-sm text-slate-500 dark:text-slate-400">
      A bridge we haven't tried?
      <a :href="NEW_ISSUE" :class="link">Open an issue</a>
      with its name and a photo or the listing.
    </p>
  </main>
</template>
