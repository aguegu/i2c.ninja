<script setup>
// The INA231's board (a 7-pin header, IN+ and IN- apart) on the shared power
// monitor page
import PowerMonitorPage from '../components/PowerMonitorPage.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
</script>

<template>
  <PowerMonitorPage title="INA231">
    <template #board>
      <SvgDrawing src="/setup-ina231.svg" alt="A CH341T bridge wired SDA, SCL, GND and VCC to a blue INA231 module; the module's shunt in series between a supply and a load: supply plus to IN+, IN minus to the load, the load's minus back to the supply's, joined to Gnd; Bus to IN minus" class="mx-auto w-full" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The blue INA231 board: a 7-pin header (ALE, SDA, SCL, Gnd, Vdd, Gnd, Bus), its IN+ and IN− holes apart. Four wires to the bridge as for any I2C device; the current to measure through the shunt, between the supply's + and the load (high side), the supply's − joined to GND, Bus to IN−. Ours answers with the INA226's IDs: the page says which chip it found. Another board, all eight pins in a row: the <RouterLink to="/ina226" class="text-emerald-700 underline dark:text-emerald-400">INA226 page</RouterLink>. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
      </figcaption>
    </template>
  </PowerMonitorPage>
</template>
