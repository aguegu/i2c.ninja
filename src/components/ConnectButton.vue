<script setup>
// The pages' connect control: a Connect button that opens the USB bridge, and
// — where the browser has Web Bluetooth — a caret beside it opening a small
// menu to pick the USB bridge or a Dart over Bluetooth. Emits connect(via),
// via 'usb' or 'ble'; the label is the slot.
import { ref } from 'vue';
import { hasWebBluetooth } from '../lib/dongle.js';
defineProps({ busy: { type: Boolean, default: false } });
const emit = defineEmits(['connect']);
const open = ref(false);
function pick(via) {
  open.value = false;
  emit('connect', via);
}
</script>

<template>
  <span class="relative inline-flex">
    <button type="button" class="inline-flex items-center gap-2 bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :class="hasWebBluetooth ? 'rounded-l-lg' : 'rounded-lg'" :disabled="busy" @click="pick('usb')">
      <svg v-if="busy" viewBox="0 0 24 24" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
      <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2v4M15 2v4M7 6h10v5a5 5 0 0 1-10 0zM12 16v6" /></svg>
      <slot />
    </button>
    <button v-if="hasWebBluetooth" type="button" class="inline-flex items-center rounded-r-lg border-l border-emerald-500 bg-emerald-600 px-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="busy" aria-haspopup="menu" :aria-expanded="open" aria-label="More connection options" @click="open = !open" @keydown.esc="open = false">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </button>

    <div v-if="open" class="fixed inset-0 z-10" @click="open = false"></div>
    <div v-if="open" role="menu" class="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <button type="button" role="menuitem" class="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700" @click="pick('usb')">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2v4M15 2v4M7 6h10v5a5 5 0 0 1-10 0zM12 16v6" /></svg>
        USB bridge
      </button>
      <button type="button" role="menuitem" class="flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700" @click="pick('ble')">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10-5 5V2l5 5L7 17" /></svg>
        Dart over Bluetooth
      </button>
    </div>
  </span>
</template>
