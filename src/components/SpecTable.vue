<script setup>
// A chip's settings: what it offers (from its datasheet) and what this page
// uses, as rows of [setting, offers, used]
defineProps({
  rows: { type: Array, required: true }, // [[setting, offers, used], ...]
});
</script>

<template>
  <table class="w-full text-left text-sm">
    <thead class="text-slate-500 dark:text-slate-400">
      <tr>
        <th class="w-1/5 py-1.5 pr-4 font-medium">Setting</th>
        <th class="py-1.5 pr-4 font-medium">The chip offers</th>
        <th class="py-1.5 font-medium">This page uses</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="[k, offers, used] in rows" :key="k" class="border-t border-slate-200 dark:border-slate-700">
        <th scope="row" class="py-1.5 pr-4 align-top font-medium text-slate-500 dark:text-slate-400">{{ k }}</th>
        <td class="py-1.5 pr-4 align-top">{{ offers }}</td>
        <td class="py-1.5 align-top font-medium text-emerald-700 dark:text-emerald-400">{{ used }}</td>
      </tr>
    </tbody>
  </table>
</template>
