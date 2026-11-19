<script setup>
// The HDC1080 on the shared humidity page; the purple carrier's wiring (from shop photos)
import { Hdc1080 } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Hdc1080" :response-s="15" drawing="/setup-hdc1080.svg"
    drawing-alt="A CH341T bridge on 3.3 V wired to a purple HDC1080 module seen from its back: SDA to SDA and SCL to SCL, crossing; GND to GND and VCC to 3.3V, crossing"
    drawing-caption="The purple carrier, from its back: four wires, SDA and SCL crossing, GND and VCC (to its 3.3V) crossing. Its back lists SI7021, HTU21D, SHT21, SHT20 and HDC1080: the same board carries any of them, so check the chip, or connect and see which answers."
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
