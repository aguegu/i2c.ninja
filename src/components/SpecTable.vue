<script setup>
// A chip's specifications, as rows of [what, value], from its datasheet
defineProps({
  rows: { type: Array, required: true }, // [[label, value], ...]
});
</script>

<template>
  <table class="w-full text-left text-sm">
    <tbody>
      <tr v-for="[k, v] in rows" :key="k" class="border-t border-slate-200 first:border-t-0 dark:border-slate-700">
        <th scope="row" class="w-1/3 py-1.5 pr-4 align-top font-medium text-slate-500 dark:text-slate-400">{{ k }}</th>
        <td class="py-1.5">{{ v }}</td>
      </tr>
    </tbody>
  </table>
</template>
