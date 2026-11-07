<script setup>
// The SHT20 on the shared humidity page
import { Sht20 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Sht20" drawing="/setup-sht20.svg" :response-s="8"
    drawing-alt="A CH341T dongle wired to a small green SHT20 module: SDA to sda and SCL to scl, crossing, GND to gnd, VCC (3.3 V) to vcc"
    drawing-caption="The small green SHT20 board: its header runs scl, sda, gnd, vcc, so the SDA and SCL wires cross. Keep it away from warm parts."
  >
    <template #intro>
      Sensirion's humidity and temperature sensor: how warm the air is, how much of the moisture it could hold it holds, and from the two, the dew point. Live over the USB dongle.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        Inside, a tiny capacitor whose dielectric takes up water vapour: its capacitance follows the humidity. A band-gap sensor beside it gives the temperature. The chip turns both into numbers: humidity in 12 bits (steps of 0.04 %RH), temperature in 14 bits (0.01 °C).
        Fine steps are not accuracy: typically ±3 %RH and ±0.3 °C, so two sensors side by side may read a few percent apart.
      </p>
      <p class="mb-2">
        Each reading is a command (temperature 0xF3, humidity 0xF5), a wait while it measures (up to 85 ms and 29 ms), and three bytes back: the value and a CRC checksum, which atiic checks.
        Then <span class="font-mono">T = −46.85 + 175.72 × S / 2¹⁶</span> and <span class="font-mono">RH = −6 + 125 × S / 2¹⁶</span>.
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> measuring warms the sensor. Sensirion asks it be active no more than 10% of the time to stay within 0.1 °C; a pair of readings keeps it busy about 115 ms.
      </p>
    </template>
  </HumidityPage>
</template>
