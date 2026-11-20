<script setup>
// The MAX30100 on the shared pulse oximeter page; no wiring drawing yet
import PulseOximeterPage from '../components/PulseOximeterPage.vue';
</script>

<template>
  <PulseOximeterPage name="MAX30100">
    <template #intro>
      The <RouterLink to="/max30102" class="text-emerald-700 underline dark:text-emerald-400">MAX30102</RouterLink>'s elder, on many cheap pulse-sensor boards: a red and an infrared LED shine into the skin, a photodiode reads the light that comes back, and each heartbeat shows in it. Live over a USB-to-I²C bridge.
    </template>
    <template #board>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Four wires: VIN, GND, SCL to SCL, SDA to SDA; INT, IRD and RD stay free. No drawing of a board yet. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </p>
    </template>
    <template #light>
      The LEDs, red at 660 nm and infrared at 880 nm (its datasheet), pulse 100 times a second; the photodiode counts the light that scatters back (16 bits, up to 65,535: two fewer than the MAX30102's, and a FIFO half as deep, 16 samples). Bare, it sees very little (under a hundred counts on ours).
    </template>
  </PulseOximeterPage>
</template>
