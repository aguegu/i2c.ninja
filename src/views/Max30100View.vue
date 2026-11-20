<script setup>
// The MAX30100 on the shared pulse oximeter page; its wiring drawn
// (ch32v00x scripts/wiring/ch341t-max30100.py)
import PulseOximeterPage from '../components/PulseOximeterPage.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
</script>

<template>
  <PulseOximeterPage name="MAX30100">
    <template #intro>
      The <RouterLink to="/max30102" class="text-emerald-700 underline dark:text-emerald-400">MAX30102</RouterLink>'s elder, on many cheap pulse-sensor boards: a red and an infrared LED shine into the skin, a photodiode reads the light that comes back, and each heartbeat shows in it. Live over a USB-to-I²C bridge.
    </template>
    <template #board>
      <SvgDrawing src="/setup-max30100.svg" alt="A CH341T bridge on 3.3 V wired to a purple MAX30100 module seen from its front, turned half round, its sensor up: SDA to SDA, SCL to SCT (its SCL, misprinted), GND to GND, VCC to VIN, four straight wires; INT free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The purple CJMCU board, drawn from its front turned half round, so its printing reads upside down: four straight wires, VIN (3.3 V), GND, SCL to the pin printed "SCT" (its SCL), SDA; INT stays free. The sensor faces up: rest a fingertip on its window. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </template>
    <template #light>
      The LEDs, red at 660 nm and infrared at 880 nm (its datasheet), pulse 100 times a second; the photodiode counts the light that scatters back (16 bits, up to 65,535: two fewer than the MAX30102's, and a FIFO half as deep, 16 samples). Bare, it sees very little (under a hundred counts on ours). Its LEDs run at 14.2 mA here: on ours a fingertip then sends back about half the scale, and each beat ripples by some 180 counts; at 7.6 mA the ripple was a quarter of that, and from 27 mA up the reading hits the top of its 16 bits and the ripple is lost.
    </template>
  </PulseOximeterPage>
</template>
