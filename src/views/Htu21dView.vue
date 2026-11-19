<script setup>
// The HTU21D on the shared humidity page: an SHT20's commands with its own
// (faster) waits; hold master on a dart; the blue GY-21 board's wiring
import { Htu21d } from 'atiic';
import HumidityPage from '../components/HumidityPage.vue';
</script>

<template>
  <HumidityPage
    :driver="Htu21d" :response-s="10" resolution="11/11" drawing="/setup-htu21d.svg"
    drawing-alt="A CH341T bridge on 3.3 V wired to a blue HTU21D module (GY-21) seen from its back: SDA, SCL, GND and VCC to VIN, four straight wires"
    drawing-caption="The blue GY-21 board, from its back (the sensor and the pins' names on its front): four straight wires, SDA, SCL, GND and VCC to VIN. VIN feeds its own 3.3 V regulator; ours runs from a 3.3 V bridge. The same board carries an SHT21 or an SI7021."
  >
    <template #intro>
      TE Connectivity's (once Measurement Specialties') humidity and temperature sensor: the air's moisture and warmth, and from the two, the dew point. It speaks the SHT20's language, command for command, and measures in about half the time. Live over a USB-to-I²C bridge.
    </template>
    <template #measures="{ readMs, hold }">
      <p class="mb-2">
        A capacitive humidity sensor and a temperature sensor (how they work: <RouterLink to="/physics/humidity" class="text-emerald-700 underline dark:text-emerald-400">Humidity and dew point</RouterLink>), read at a resolution you pick: humidity in 12 bits (0.04 %RH) and temperature in 14 bits (0.01 °C) at most. Typically within ±2 %RH and ±0.3 °C.
      </p>
      <p class="mb-2">
        Its commands, formulas and CRC checksum are the <RouterLink to="/sht20" class="text-emerald-700 underline dark:text-emerald-400">SHT20</RouterLink>'s: <span class="font-mono">T = −46.85 + 175.72 × S / 2¹⁶</span>, <span class="font-mono">RH = −6 + 125 × S / 2¹⁶</span>. What differs is the time it takes: at full resolution up to 50 ms for temperature and 16 for humidity, where an SHT20 allows 85 and 29.
        {{ hold ? 'Your dart waits on the clock the sensor holds while measuring (hold master), so each reading comes as soon as it\'s ready.' : 'On a CH341 or CH347 the page waits the datasheet\'s longest, then asks; a dart waits on the clock the sensor holds instead.' }}
      </p>
      <p class="mb-2">
        <b>Telling it from an SHT20:</b> both sit at 0x40 and answer the same commands. Asked for its electronic ID, ours says "HT" in it, where an SHT20 doesn't: that's how atiic knows which it has.
      </p>
      <p>
        <b>Why every {{ readMs / 1000 }} seconds:</b> measuring warms it a little, so it's read no more than a tenth of the time. Its response time is about 10 s anyway.
      </p>
    </template>
  </HumidityPage>
</template>
