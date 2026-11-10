<script setup>
// The AHT21B and the AHT30 (one protocol, not told apart on the bus: atiic's
// Aht21) on the shared humidity page, a drawing for each one's board
import { Aht21 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';

const AHT30 = [{
  src: '/setup-aht30.svg',
  alt: 'A CH341T dongle wired to a purple AHT30 module: VCC (3.3 V) to VIN, GND to GND, SCL to SCL, SDA to SDA, all four wires crossing',
  caption: 'The purple AHT30 board: its header runs VIN, GND, SCL, SDA, the other way from the dongle\'s, so all four wires cross. Keep it away from warm parts.',
}];
</script>

<template>
  <HumidityPage
    :driver="Aht21" drawing="/setup-aht21.svg" :response-s="8" :more-drawings="AHT30"
    drawing-alt="A CH341T dongle wired SDA, SCL, GND and VCC (3.3 V) to an AHT21B module"
    drawing-caption="Aosong's own small green AHT21B module (its datasheet's Figure 1): pads 1 VDD, 2 SDA, 3 GND, 4 SCL, so three wires cross. Keep it away from warm parts."
  >
    <template #intro>
      Aosong's humidity and temperature sensors, the AHT21B and the newer AHT30: read the same way, so one page for both. How warm the air is and how much of the moisture it could hold it holds. Live over the USB dongle; beside an SHT20, two makers' answers to the same air.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        A MEMS capacitive humidity element and a temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), read out by its own chip, calibrated at the factory. Both come back as 20-bit numbers (steps of 0.024 %RH and 0.01 °C, its datasheet says), typically within ±3 %RH and ±0.5 °C.
      </p>
      <p class="mb-2">
        The two are read alike (the AHT30's datasheet, June 2024, gives the same command, wait, bytes, CRC and formulas) and have no ID to tell them apart, so atiic reads both as one. At power-on the status byte (command 0x71) must read 0x18, calibrated. A reading is one command (0xAC 0x33 0x00), a wait of 80 ms while it measures (its busy bit says when it's done), and seven bytes back: the status, 20 bits of humidity, 20 bits of temperature, and a CRC, which atiic checks.
        Then <span class="font-mono">RH = S / 2²⁰ × 100</span> and <span class="font-mono">T = S / 2²⁰ × 200 − 50</span>.
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> measuring warms the sensor. The AHT21B's datasheet asks it be active no more than 10 % of the time to stay within 0.1 °C, a reading every 2 seconds; the AHT30's asks a second or more, so 2 s suits both. The AHT30 also works to 120 °C (the AHT21B to 80 °C) and starts in 5 ms without the AHT21B's register set-up, which atiic doesn't need for a chip that reads 0x18 anyway.
      </p>
    </template>
  </HumidityPage>
</template>
