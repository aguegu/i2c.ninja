<script setup>
// The pages' stop button: a stop square and "Stop", orange so it
// stands apart from Connect and from the recorder's red; the click the caller's. Record beside it
// (RecordButton.vue): a recording ends with Stop, saved first.
import RecordButton from './RecordButton.vue';
import { stopRecording } from '../lib/recorder.js';

defineOptions({ inheritAttrs: false });
const emit = defineEmits(['click']);
async function onStop(e) {
  await stopRecording();
  emit('click', e);
}
</script>

<template>
  <button type="button" v-bind="$attrs" class="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-400 active:bg-orange-600" @click="onStop">
    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
    <slot>Stop</slot>
  </button>
  <RecordButton />
</template>
