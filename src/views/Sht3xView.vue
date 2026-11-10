<script setup>
// The SHT3x (SHT30, SHT31, SHT35) on the shared humidity page: its
// repeatability to pick, hold master on a dart. No wiring drawing yet: the
// module's pin order not seen
import { Sht3x } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Sht3x" :response-s="8"
    drawing-caption="Four wires from the module's labels: VIN (or VCC) to 3.3 V, GND to GND, SCL to SCL, SDA to SDA. Its ADDR pin picks the address, 0x44 low or 0x45 high, and must not be left floating (modules tie it on the board). Keep it away from warm parts."
  >
    <template #intro>
      Sensirion's next humidity and temperature sensor after the SHT20 (the SHT30, SHT31 and SHT35 differ in accuracy): how warm the air is and how full of water. Faster and more accurate than the SHT20, read four times a second here. Live over the USB dongle; the water in the air and the dew point on <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>.
    </template>
    <template #measures="{ readMs, hold }">
      <p class="mb-2">
        Humidity and temperature in 16 bits each (steps of 0.0015 %RH and 0.003 °C, finer than the sensor's noise), typically within ±2 %RH and ±0.2 °C for an SHT30 or SHT31, ±1.5 %RH and ±0.1 °C for an SHT35.
      </p>
      <p class="mb-2">
        Each reading is one 16-bit command and six bytes back, the temperature first: each value followed by its CRC checksum, which atiic checks. Then <span class="font-mono">T = −45 + 175 × S / (2¹⁶ − 1)</span> and <span class="font-mono">RH = 100 × S / (2¹⁶ − 1)</span>.
      </p>
      <p class="mb-2">
        <b>Repeatability</b> trades time for noise: high takes up to 15.5 ms and repeats within 0.08 %RH, medium 6.5 ms and 0.15 %RH, low 4.5 ms and 0.21 %RH (three standard deviations, its datasheet's measure).
        {{ hold ? 'Your dart waits while the sensor holds the clock line until its result is ready (clock stretching), so a reading comes as soon as it\'s done.' : 'The CH341 and CH347 never wait on a held clock, so the page waits the longest a measurement can take and then asks; a dart lets the sensor hold the clock until it\'s done.' }}
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> its datasheet allows up to ten measurements a second but warns that at that rate it may warm itself, so this page takes four.
      </p>
    </template>
  </HumidityPage>
</template>
