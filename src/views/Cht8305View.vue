<script setup>
// The CHT8305C on the shared humidity page; no wiring drawing yet
import { Cht8305 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Cht8305" :response-s="8"
    drawing-caption="Its module's pins: VCC (3.3 V), GND, SCL to SCL, SDA to SDA; AD0 picks its address (open or GND 0x40, VCC 0x44, SDA 0x48, SCL 0x4C); ALERT signals a limit crossed. No drawing of a board yet."
  >
    <template #intro>
      Sensylink's humidity and temperature sensor: the air's moisture and warmth, with an alert pin for when either climbs too high. Live over a USB-to-I²C bridge.
    </template>
    <template #measures="{ readMs }">
      <p class="mb-2">
        A humidity sensor and a temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), each in 14 bits. Within ±3 %RH at 50 %RH and ±0.5 °C between 0 and 50 °C at most.
      </p>
      <p class="mb-2">
        Registers, as the <RouterLink to="/hdc1080" class="text-emerald-700 underline dark:text-emerald-400">HDC1080</RouterLink>'s, nearly: pointing at its temperature register starts both conversions; it refuses to answer until they're done (ours took about 10 ms; its maker says wait over 20). Then four bytes: <span class="font-mono">T = 165 × S / (2¹⁶ − 1) − 40</span>, <span class="font-mono">RH = 100 × S / (2¹⁶ − 1)</span>. No checksum.
      </p>
      <p class="mb-2">
        <b>Its alert:</b> two high limits, 80 %RH and 60 °C from power-up; reach either and its ALERT pin goes low. Four can share a bus, by the AD0 pin.
      </p>
      <p>
        <b>Every {{ readMs / 1000 }} s:</b> its datasheet's limit against self-heating, one measurement a second.
      </p>
    </template>
  </HumidityPage>
</template>
