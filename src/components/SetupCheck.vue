<script setup>
// Test the setup: pick the CH341 in the browser's chooser, open it, scan
// the I2C bus. Each way it can fail says what's likely missing.
import { ref } from 'vue';
import Ch341, { FILTERS } from 'atiic/adapters/ch341';

const SCL_HZ = 100000; // every I2C device takes 100 kHz

const props = defineProps({ platform: { type: String, required: true } });

const hasWebUsb = 'usb' in navigator;
const busy = ref(false);
const result = ref(null); // { ok, title, detail, error? }
const hex = (a) => `0x${a.toString(16).padStart(2, '0')}`;

const PERMISSION_HINT = {
  linux: 'Linux keeps USB devices to root unless a udev rule gives the dongle to you: add the rule above, then unplug and plug the dongle back in.',
  windows: 'Windows lets the browser open only devices on the WinUSB driver: bind the dongle to WinUSB with Zadig (above), then unplug and plug it back in.',
};

function explain(stage, e) {
  if (stage === 'choose') {
    if (e.name === 'NotFoundError') {
      return {
        title: 'No dongle chosen',
        detail: 'If the dongle wasn\'t in the list: check it\'s plugged in and its yellow jumper is on I2C (on TTL it\'s a serial port, which WebUSB doesn\'t list).',
      };
    }
    return { title: 'The chooser failed', detail: '' };
  }
  if (stage === 'open' && e.name === 'SecurityError') {
    return {
      title: 'The system didn\'t let the browser open the dongle',
      detail: PERMISSION_HINT[props.platform] ?? `${PERMISSION_HINT.linux} ${PERMISSION_HINT.windows}`,
    };
  }
  if (stage === 'open' && e.name === 'NetworkError') {
    return {
      title: 'The dongle is busy',
      detail: props.platform === 'linux'
        ? 'Most likely the kernel\'s spi-ch341 driver holds it: release it with the command above (after each plug), or block the driver. Otherwise another tab or program has it open.'
        : 'Another tab or program has it open: close it, or unplug and plug the dongle back in.',
    };
  }
  return { title: 'Talking to the dongle failed', detail: 'Unplug it, plug it back in and try again.' };
}

async function check() {
  busy.value = true;
  result.value = null;
  let stage = 'choose';
  let bus = null;
  try {
    const device = await navigator.usb.requestDevice({ filters: FILTERS });
    stage = 'open';
    bus = await new Ch341(device).open(SCL_HZ);
    stage = 'scan';
    const found = await bus.scan();
    result.value = found.length
      ? { ok: true, title: `Working: ${found.length === 1 ? 'a device answers' : `${found.length} devices answer`} at ${found.map(hex).join(', ')}`, detail: 'The browser, the dongle and the bus are all set.' }
      : { ok: true, title: 'The dongle works, but no device answered', detail: 'Check the four wires (SDA to SDA, SCL to SCL), and that the device is powered: VCC from the dongle\'s VCC, its green jumper on 3V3.' };
  } catch (e) {
    result.value = { ok: false, ...explain(stage, e), error: `${e.name}: ${e.message}` };
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
    <p
      v-if="!hasWebUsb"
      class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
    >
      This browser has no WebUSB. Open this page in Chrome, Edge or another
      Chromium.
    </p>
    <button
      v-else
      class="self-start rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
      :disabled="busy"
      @click="check"
    >
      {{ busy ? 'Checking…' : 'Connect and scan' }}
    </button>
    <div
      v-if="result"
      class="rounded-lg border p-3"
      :class="result.ok
        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100'
        : 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'"
    >
      <p class="font-semibold">
        {{ result.title }}
      </p>
      <p
        v-if="result.detail"
        class="mt-1"
      >
        {{ result.detail }}
      </p>
      <p
        v-if="result.error"
        class="mt-2 font-mono text-xs opacity-75"
      >
        {{ result.error }}
      </p>
    </div>
  </div>
</template>
