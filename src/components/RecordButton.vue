<script setup>
// Record, beside the pages' Stop (StopButton.vue): the page's named series
// written to a CSV on the disk as they come (lib/recorder.js); Stop
// recording, the page's Stop or leaving the page ends it and saves the
// file to the browser's downloads. While it runs, the bar at the page's
// top (RecordingBar.vue) shows it.
import { onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { hasRecorder, recording, failure, startRecording, stopRecording } from '../lib/recorder.js';

const route = useRoute();
// the file's name: the page's path, /physics/acceleration -> physics-acceleration
const label = () => route.path.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'i2c-ninja';

onBeforeUnmount(stopRecording);
</script>

<template>
  <template v-if="hasRecorder">
    <button v-if="!recording" type="button" class="inline-flex items-center gap-2 rounded-lg border border-rose-600 px-4 py-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950" title="Record every reading to a CSV file, until you stop" @click="startRecording(label())">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
      Record
    </button>
    <button v-else type="button" class="inline-flex items-center gap-2 rounded-lg border border-rose-600 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300" title="Stop recording and save the CSV" @click="stopRecording">
      <svg viewBox="0 0 24 24" class="h-4 w-4 animate-pulse" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
      Stop recording
    </button>
    <span v-if="failure" class="text-sm text-red-700 dark:text-red-400">{{ failure }}</span>
  </template>
</template>
