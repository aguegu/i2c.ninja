<script setup>
// Two sensors fused, every way the site shows it: the board in 3D and the
// attitude indicator, Mahony's roll, pitch and yaw with Start again and the
// gyro offset it learned, then roll and pitch three ways (fused, gravity's,
// the gyro alone) on charts. A page brings a useFusion() (reactive) fed by
// its readings; running enables the button.
import LiveChart from './LiveChart.vue';
import Board3D from './Board3D.vue';
import AttitudeIndicator from './AttitudeIndicator.vue';

defineProps({
  fusion: { type: Object, required: true }, // useFusion(), reactive
  running: { type: Boolean, default: false },
  windowMs: { type: Number, default: 10000 },
});

const ANGLE_FLOOR_DEG = 45; // the charts' least half-range
const THREE = [
  { label: 'fused', color: '--series-1' },
  { label: 'gravity', color: '--series-2' },
  { label: 'gyro alone', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];
const f = (v, n = 0) => (v === undefined || v === null ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <section :class="card">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 class="text-lg font-semibold">Fused</h2>
      <button :class="button" :disabled="!running" @click="fusion.restart">Start again</button>
    </div>
    <div class="mt-2 grid items-center gap-4 md:grid-cols-2">
      <div class="flex flex-col items-center">
        <Board3D :q="fusion.fused?.q ?? [1, 0, 0, 0]" />
      </div>
      <div class="flex flex-col items-center gap-2">
        <AttitudeIndicator :roll="fusion.fused?.roll ?? 0" :pitch="fusion.fused?.pitch ?? 0" />
        <p class="font-mono text-sm tabular-nums">roll {{ f(fusion.fused?.roll) }}° · pitch {{ f(fusion.fused?.pitch) }}° · yaw {{ f(fusion.fused?.yaw) }}°</p>
        <p class="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
          gyro offset learned: <template v-for="(k, i) in AXES" :key="k">{{ i ? ' · ' : '' }}{{ k }} {{ f(fusion.learned?.[i], 2) }}</template> °/s
        </p>
      </div>
    </div>
  </section>
  <section :class="card">
    <LiveChart title="Roll" unit="degrees" :series="THREE" :values="fusion.fused ? [fusion.fused.roll, fusion.gravity.roll, fusion.gyroAlone.roll] : []" :source="fusion.rollSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
  <section :class="card">
    <LiveChart title="Pitch" unit="degrees" :series="THREE" :values="fusion.fused ? [fusion.fused.pitch, fusion.gravity.pitch, fusion.gyroAlone.pitch] : []" :source="fusion.pitchSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
</template>
