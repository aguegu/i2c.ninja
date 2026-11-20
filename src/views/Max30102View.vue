<script setup>
// The MAX30102 on the shared pulse oximeter page
import PulseOximeterPage from '../components/PulseOximeterPage.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
</script>

<template>
  <PulseOximeterPage name="MAX30102">
    <template #intro>
      A pulse oximeter and heart-rate sensor, the kind in a smartwatch or a fingertip clip: a red and an infrared LED shine into the skin, a photodiode reads the light that comes back, and each heartbeat shows in it. Live over a USB-to-I²C bridge.
    </template>
    <template #board>
      <SvgDrawing src="/setup-max30102.svg" alt="A CH341T bridge wired to a black MAX30102 module: GND to GND, SCL to SCL, SDA to SDA, VCC (3.3 V) to VIN; INT, IRD, RD free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The common black MAX30102 board: four wires from its row of GND, SCL, SDA, VIN (3.3 or 5 V: the board makes the chip's 1.8 V and the LEDs' 3.3 V itself); INT, IRD, RD (the LEDs' own) and the other GND stay free. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </template>
    <template #light>
      The LEDs, red at 660 nm and infrared at 880 nm (its datasheet), pulse 100 times a second; the photodiode counts the light that scatters back (18 bits, up to 262,143). Bare, it sees little (a few thousand counts).
    </template>
    <template #more>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        More on the module and the principle: Last Minute Engineers' <a href="https://lastminuteengineers.com/max30102-pulse-oximeter-heart-rate-sensor-arduino-tutorial/" class="underline">MAX30102 tutorial</a>.
      </p>
    </template>
  </PulseOximeterPage>
</template>
