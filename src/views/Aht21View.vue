<script setup>
// The AHT21B on the shared humidity page
import { Aht21 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Aht21" drawing="/setup-aht21.svg" :response-s="8"
    drawing-alt="A CH341T dongle wired SDA, SCL, GND and VCC (3.3 V) to an AHT21B module"
    drawing-caption="Aosong's own small green AHT21B module (its datasheet's Figure 1): pads 1 VDD, 2 SDA, 3 GND, 4 SCL, so three wires cross. Keep it away from warm parts."
  >
    <template #intro>
      Aosong's humidity and temperature sensor: how warm the air is, how much of the moisture it could hold it holds, and from the two, the dew point. Live over the CH341 dongle; beside an SHT20, two makers' answers to the same air.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        A MEMS capacitive humidity element and a temperature sensor, read out by its own chip, calibrated at the factory. Both come back as 20-bit numbers (steps of 0.024 %RH and 0.01 °C, its datasheet says).
        Fine steps are not accuracy: typically ±3 %RH and ±0.5 °C, so beside an SHT20 the two may read a few percent apart.
      </p>
      <p class="mb-2">
        At power-on its status byte (command 0x71) must read 0x18, calibrated. A reading is one command (0xAC 0x33 0x00), a wait of 80 ms while it measures (its busy bit says when it's done), and seven bytes back: the status, 20 bits of humidity, 20 bits of temperature, and a CRC, which atiic checks.
        Then <span class="font-mono">RH = S / 2²⁰ × 100</span> and <span class="font-mono">T = S / 2²⁰ × 200 − 50</span>.
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> measuring warms the sensor. Its datasheet asks it be active no more than 10% of the time to stay within 0.1 °C, a reading every 2 seconds.
      </p>
    </template>
  </HumidityPage>
</template>
