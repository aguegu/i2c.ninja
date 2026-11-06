<script setup>
// Two sensors fused, every way the site shows it: the numbers in and the
// formulas they go through (each with the latest values), the board in 3D and the
// attitude indicator, Mahony's roll, pitch and yaw with Start again and the
// gyro offset it learned, then roll and pitch three ways (fused, gravity's,
// the gyro alone) on charts. A page brings a useFusion() (reactive) fed by
// its readings; running enables the button.
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import TexMath from './TexMath.vue';
import Board3D from './Board3D.vue';
import AttitudeIndicator from './AttitudeIndicator.vue';

const props = defineProps({
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
// the latest numbers, as they go into the formulas
const n = (v, d = 3) => (v === undefined || v === null ? '—' : v.toFixed(d));
const formula = 'grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm leading-6 whitespace-nowrap dark:bg-slate-900';
const value = 'text-emerald-700 dark:text-emerald-400';
const vec = (v, d) => (v ? `(${v.map((c) => n(c, d)).join(', ')})` : '—');
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const aHat = computed(() => {
  const a = props.fusion.input?.accel, m = a && Math.hypot(...a);
  return m ? a.map((c) => c / m) : null;
});
const err = computed(() => (aHat.value && props.fusion.fused?.held ? cross(aHat.value, props.fusion.fused.held.up) : null));
// each block: a formula a row (LaTeX), its result with the latest numbers
const blocks = computed(() => {
  const u = props.fusion, i = u.input;
  return [
    { title: 'From the sensors, every reading', rows: [
      { tex: String.raw`\mathbf{a} = (a_x,\ a_y,\ a_z) =`, value: `${vec(i?.accel, 3)} g`, note: 'the accelerometer' },
      { tex: String.raw`\boldsymbol{\omega} = (\omega_x,\ \omega_y,\ \omega_z) =`, value: `${vec(i?.gyro, 1)} °/s`, note: 'the gyro: the rates about x, y and z' },
      { tex: String.raw`\Delta t =`, value: i ? `${(i.dt * 1000).toFixed(0)} ms` : '—', note: 'since the reading before' },
    ] },
    { title: 'Gravity\'s tilt, from a alone', rows: [
      { tex: String.raw`\varphi = \operatorname{atan2}(a_y,\ a_z) =`, value: `${f(u.gravity?.roll, 1)}°`, note: 'φ (phi), the roll: about the nose, x' },
      { tex: String.raw`\theta = \operatorname{atan2}\!\left(a_x,\ \sqrt{a_y^2 + a_z^2}\right) =`, value: `${f(u.gravity?.pitch, 1)}°`, note: 'θ (theta), the pitch: nose up' },
    ] },
    { title: 'The gyro alone: ω added up, from gravity\'s start', rows: [
      { tex: String.raw`\varphi \leftarrow \varphi + \omega_x\,\Delta t =`, value: `${f(u.gyroAlone?.roll, 1)}°`, note: 'started from gravity\'s φ' },
      { tex: String.raw`\theta \leftarrow \theta - \omega_y\,\Delta t =`, value: `${f(u.gyroAlone?.pitch, 1)}°`, note: 'started from gravity\'s θ; nose up is a turn about −y' },
    ] },
    { title: `Fused: Mahony's filter (kp ${u.kp}, ki ${u.ki})`, rows: [
      { tex: String.raw`\mathbf{q}_0 = \bigl(\cos\tfrac{\theta}{2}\cos\tfrac{\varphi}{2},\ \cos\tfrac{\theta}{2}\sin\tfrac{\varphi}{2},\ -\sin\tfrac{\theta}{2}\cos\tfrac{\varphi}{2},\ \sin\tfrac{\theta}{2}\sin\tfrac{\varphi}{2}\bigr)`, value: '', note: 'the start (and Start again): from gravity\'s φ and θ above, the yaw ψ (psi) 0' },
      { tex: String.raw`\mathbf{q} = (q_w,\ q_x,\ q_y,\ q_z) =`, value: vec(u.fused?.held?.q, 3), note: 'then the q the last line made, a reading before: a turn by an angle β about an axis n is (cos β/2, n sin β/2)' },
      { tex: String.raw`\hat{\mathbf{a}} = \mathbf{a} \,/\, \lVert \mathbf{a} \rVert =`, value: vec(aHat.value, 3), note: 'up, as gravity says (a unit vector)' },
      { tex: String.raw`\hat{\mathbf{v}} = \bigl(2(q_x q_z - q_w q_y),\ 2(q_y q_z + q_w q_x),\ 1 - 2(q_x^2 + q_y^2)\bigr) =`, value: vec(u.fused?.held?.up, 3), note: 'up, as q says' },
      { tex: String.raw`\mathbf{e} = \hat{\mathbf{a}} \times \hat{\mathbf{v}} =`, value: vec(err.value, 3), note: 'how far apart the two ups are (a cross product)' },
      { tex: String.raw`\boldsymbol{\omega}' = \boldsymbol{\omega} + k_p\,\mathbf{e} + k_i \textstyle\int \mathbf{e}\,dt`, value: '', note: 'the gyro, steered toward gravity: kp, a spring; ki, what adds up over time' },
      { tex: String.raw`\mathbf{q} \leftarrow \mathbf{q} + \tfrac{1}{2}\,\mathbf{q} \otimes (0,\ \boldsymbol{\omega}')\,\Delta t =`, value: vec(u.fused?.q, 3), note: '⊗, the quaternion product: q turned by ω′ over Δt, made unit length, held for the next reading; φ, θ and ψ come from it' },
    ] },
  ];
});
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <section :class="card">
    <h2 class="mb-2 text-lg font-semibold">The numbers, and what's done with them</h2>
    <div class="flex flex-col gap-3">
      <div v-for="b in blocks" :key="b.title">
        <p class="mb-1 text-sm font-semibold">{{ b.title }}</p>
        <div :class="formula">
          <template v-for="r in b.rows" :key="r.tex">
            <TexMath :expr="r.tex" /><span :class="value">{{ r.value }}</span><span class="text-right font-sans text-xs whitespace-normal text-slate-500 dark:text-slate-400">{{ r.note }}</span>
          </template>
        </div>
      </div>
    </div>
  </section>
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
