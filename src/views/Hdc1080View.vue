<script setup>
// The HDC1080 on the shared humidity page; no wiring drawing yet
import { Hdc1080 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Hdc1080" :response-s="15"
    drawing-caption="Its module's four pins: VCC (3.3 V), GND, SCL to SCL, SDA to SDA. No drawing of a board yet."
  >
    <template #intro>
      Texas Instruments' humidity and temperature sensor: the air's moisture and warmth, at very low power. Live over a USB-to-I²C bridge.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        A capacitive humidity sensor and a temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), each in 14 bits here. Typically within ±2 %RH and ±0.2 °C.
      </p>
      <p class="mb-2">
        Not commands but registers, like most I²C chips: pointing at its temperature register starts both conversions, temperature then humidity, about 13 ms together; until they're done it refuses to answer. Then four bytes: <span class="font-mono">T = S / 2¹⁶ × 165 − 40</span>, <span class="font-mono">RH = S / 2¹⁶ × 100</span>. No checksum.
      </p>
      <p class="mb-2">
        <b>Who it is:</b> it carries Texas Instruments' ID (0x5449) and its own (0x1050) in two registers: atiic reads both, as at 0x40 an SHT20, an HTU21D and a CHT8305C may answer too.
      </p>
      <p>
        <b>Every {{ readMs / 1000 }} s:</b> TI advises no more than one reading a second, against warming itself.
      </p>
    </template>
  </HumidityPage>
</template>
