<script setup>
// Test the setup: pick the dongle in the browser's chooser, open it, scan
// the I2C bus. Each way it can fail says what's likely missing.
import { ref } from 'vue';
import { hasWebUsb, openDongle, explain, hex } from '../lib/dongle.js';

const SCL_HZ = 100000; // every I2C device takes 100 kHz

const props = defineProps({ platform: { type: String, required: true } });

const busy = ref(false);
const result = ref(null); // { ok, title, detail, error? }
const OK_BOX = 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100';
const FAIL_BOX = 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100';

async function check() {
  busy.value = true;
  result.value = null;
  let bus = null;
  try {
    bus = await openDongle(SCL_HZ);
    const found = await bus.scan();
    result.value = found.length
      ? { ok: true, title: `Working: ${found.length === 1 ? 'a device answers' : `${found.length} devices answer`} at ${found.map(hex).join(', ')}`, detail: 'The browser, the dongle and the bus are all set.' }
      : { ok: true, title: 'The dongle works, but no device answered', detail: 'Check the four wires (SDA to SDA, SCL to SCL), and that the device is powered: VCC from the dongle\'s VCC, its green jumper on 3V3.' };
  } catch (e) {
    result.value = { ok: false, ...explain(e, props.platform), error: e.message };
  } finally {
    try {
      await bus?.close();
    } catch {
      // closing what failed to open: nothing to do
    }
    busy.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another
      Chromium.
    </p>
    <button v-else class="self-start rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="busy" @click="check">
      {{ busy ? 'Checking…' : 'Connect and scan' }}
    </button>
    <div v-if="result" class="rounded-lg border p-3" :class="result.ok ? OK_BOX : FAIL_BOX">
      <p class="font-semibold">{{ result.title }}</p>
      <p v-if="result.detail" class="mt-1">{{ result.detail }}</p>
      <p v-if="result.error" class="mt-2 font-mono text-xs opacity-75">{{ result.error }}</p>
    </div>
  </div>
</template>
