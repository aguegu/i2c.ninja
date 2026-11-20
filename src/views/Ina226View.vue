<script setup>
// The INA226's board (eight pins in a row: IN+, IN-, VBS, ALE, SDA, SCL,
// GND, VCC; an R100 shunt) on the shared power monitor page; its wiring drawn
// (ch32v00x scripts/wiring/ch341t-ina226.py)
import PowerMonitorPage from '../components/PowerMonitorPage.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
</script>

<template>
  <PowerMonitorPage title="INA226">
    <template #board>
      <SvgDrawing src="/setup-ina226.svg" alt="A CH341T bridge on 3.3 V wired to a blue INA226 module seen from its front: SDA, SCL, GND and VCC straight across; above, a supply and a load: the supply plus to IN+, IN minus to the load plus, the load minus to the supply minus, and that to GND; VBS tied to IN minus on the module, ALE free" class="mx-auto w-full lg:w-3/5" />
      <div class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        <p class="mb-2">
          The blue INA226 board, drawn from its front: eight pins in a row, IN+, IN−, VBS, ALE, SDA, SCL, GND, VCC, and two big pads for IN+ and IN− beside its R100 shunt (0.1 Ω), for thick wires.
        </p>
        <ul class="mb-2 list-disc space-y-1 pl-5">
          <li><b>To the bridge:</b> VCC to 3.3 V, GND, SCL, SDA. ALE (its alert pin) stays free.</li>
          <li><b>The current:</b> the shunt in series with the load, on the supply's + side: the supply's + to IN+, IN− to the load's +.</li>
          <li><b>The voltage:</b> VBS (its VBUS) to IN−, to read what the load gets.</li>
          <li><b>One ground:</b> the supply's − to the load's −, and to GND: without it the bus voltage means nothing.</li>
        </ul>
        <p>
          Up to about 0.82 A with its R100 (±81.92 mV across 0.1 Ω) and 36 V. A first test: a 5 V USB supply and a 100 Ω resistor (½ W) as the load, about 50 mA. Another board, a 7-pin header: the <RouterLink to="/ina231" class="text-emerald-700 underline dark:text-emerald-400">INA231 page</RouterLink>. New to the bridge? <RouterLink to="/get-started" class="text-emerald-700 underline dark:text-emerald-400">Get started</RouterLink>.
        </p>
      </div>
    </template>
  </PowerMonitorPage>
</template>
