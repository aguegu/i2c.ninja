<script setup>
// The SHT4x (SHT40, SHT41, SHT45) on the shared humidity page: its
// repeatability to pick; no wiring drawing yet
import { Sht4x } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Sht4x" :response-s="6"
    drawing-caption="Its module's four pins: VCC (3.3 V), GND, SCL to SCL, SDA to SDA. No drawing of a board yet."
  >
    <template #intro>
      Sensirion's fourth generation of humidity and temperature sensors (the SHT40, SHT41 and SHT45 differ in accuracy): tiny, frugal and quick, with a heater of its own. Live over a USB-to-I²C bridge.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        A capacitive humidity sensor and a temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), both in 16 bits (0.01 %RH, 0.01 °C). An SHT40 is typically within ±1.8 %RH and ±0.2 °C; an SHT45 within ±1.5 %RH and ±0.1 °C.
      </p>
      <p class="mb-2">
        One command measures both, at the repeatability you pick: how much the readings scatter, against how long it takes (high up to 8.2 ms, medium 4.5, low 1.7). Six bytes come back, temperature first, each value with a CRC checksum atiic checks: <span class="font-mono">T = −45 + 175 × S / (2¹⁶ − 1)</span>, <span class="font-mono">RH = −6 + 125 × S / (2¹⁶ − 1)</span>. Below 0 or over 100 %RH is possible from the formula, though not in the air; it's shown as it comes.
      </p>
      <p class="mb-2">
        <b>It doesn't hold the clock:</b> unlike the SHT3x, it just refuses to answer until it's done, so the page waits the longest, then asks.
      </p>
      <p>
        <b>Every {{ readMs / 1000 }} s:</b> the rate its datasheet gives its power figures at. Its heater (not used here) warms it by tens of degrees in a tenth of a second, to dry it after condensation; while it heats, the readings aren't to be trusted.
      </p>
    </template>
  </HumidityPage>
</template>
