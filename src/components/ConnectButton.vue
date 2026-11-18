<script setup>
// The pages' connect control: the USB bridge button (a plug before its label,
// a spinner while busy), and under it — where the browser has Web Bluetooth —
// a link to connect a Dart over Bluetooth instead. Emits connect(via), via
// 'usb' or 'ble'; the label is the slot.
import { hasWebBluetooth } from '../lib/dongle.js';
defineProps({ busy: { type: Boolean, default: false } });
defineEmits(['connect']);
</script>

<template>
  <span class="inline-flex flex-col items-start gap-1">
    <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="busy" @click="$emit('connect', 'usb')">
      <svg v-if="busy" viewBox="0 0 24 24" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
      <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2v4M15 2v4M7 6h10v5a5 5 0 0 1-10 0zM12 16v6" /></svg>
      <slot />
    </button>
    <button v-if="hasWebBluetooth" type="button" class="inline-flex items-center gap-1 text-sm text-emerald-700 underline decoration-dotted underline-offset-2 hover:text-emerald-800 disabled:opacity-50 dark:text-emerald-400 dark:hover:text-emerald-300" :disabled="busy" @click="$emit('connect', 'ble')">
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10-5 5V2l5 5L7 17" /></svg>
      or connect a Dart over Bluetooth
    </button>
  </span>
</template>
