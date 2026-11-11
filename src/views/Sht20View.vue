<script setup>
// The SHT20 on the shared humidity page
import { Sht20 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Sht20" drawing="/setup-sht20.svg" :response-s="8" resolution="11/11"
    drawing-alt="A CH341T dongle wired to a small green SHT20 module: SDA to sda and SCL to scl, crossing, GND to gnd, VCC (3.3 V) to vcc"
    drawing-caption="The small green SHT20 board: its header runs scl, sda, gnd, vcc, so the SDA and SCL wires cross. Keep it away from warm parts."
  >
    <template #intro>
      Sensirion's humidity and temperature sensor: how warm the air is, how much of the moisture it could hold it holds, and from the two, the dew point. Live over a USB-to-I2C dongle.
    </template>
    <template #measures="{ readMs, hold }">
      <p class="mb-2">
        A capacitive humidity sensor and a band-gap temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), read at a resolution you pick: humidity in 12 bits (steps of 0.04 %RH) and temperature in 14 bits (0.01 °C) at most, or fewer bits, measured faster. Typically within ±3 %RH and ±0.3 °C.
      </p>
      <p class="mb-2">
        Each reading is a command and three bytes back: the value and a CRC checksum, which atiic checks. Then <span class="font-mono">T = −46.85 + 175.72 × S / 2¹⁶</span> and <span class="font-mono">RH = −6 + 125 × S / 2¹⁶</span>.
        While it measures, either the host waits the longest the datasheet allows and then asks (temperature 0xF3, humidity 0xF5: "no hold master"), or the sensor holds the clock line low until it's done and the dongle waits on it (0xE3, 0xE5: "hold master"), so the answer comes as soon as it's ready.
        {{ hold ? 'Your dart waits on the held clock, so this page uses hold master.' : 'The CH341 and CH347 never wait on a held clock, so on them this page uses no hold master; a dart waits.' }}
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> measuring warms the sensor, so Sensirion asks it be active no more than 10 % of the time. At full resolution a pair of readings takes up to 114 ms, so at most one pair every 1.14 s; at 11 and 11 bits only 26 ms, so one every 0.26 s. Faster isn't quicker to follow, though: its response time is about 8 s.
      </p>
    </template>
  </HumidityPage>
</template>
