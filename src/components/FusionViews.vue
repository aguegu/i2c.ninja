<script setup>
// Two sensors fused, every way the site shows it: the numbers in and the
// formulas they go through (each with the latest values; Start again), then
// roll and pitch three ways (fused, gravity's, the gyro alone) on charts. A
// page brings a useFusion() (reactive) fed by its readings; running enables
// the button.
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import TexMath from './TexMath.vue';

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
// q as one turn: its angle beta (degrees) and axis n
const turn = computed(() => {
  const q = props.fusion.fused?.held?.q;
  if (!q) return null;
  const w = Math.min(1, Math.abs(q[0])), sgn = q[0] < 0 ? -1 : 1; // q and -q are the same turn: the short way
  const beta = 2 * Math.acos(w) * (180 / Math.PI), s2 = Math.sqrt(1 - w * w);
  return { beta, n: s2 > 1e-6 ? q.slice(1).map((c) => (sgn * c) / s2) : null };
});
const fusionAngles = (u) => (u.fused ? `(${f(u.fused.roll, 1)}, ${f(u.fused.pitch, 1)}, ${f(u.fused.yaw, 1)})°` : '—');
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
    { title: 'The attitude, q: a quaternion, four numbers for how the board sits in the room', rows: [
      { tex: String.raw`\mathbf{q}_0 = \bigl(\cos\tfrac{\theta}{2}\cos\tfrac{\varphi}{2},\ \cos\tfrac{\theta}{2}\sin\tfrac{\varphi}{2},\ -\sin\tfrac{\theta}{2}\cos\tfrac{\varphi}{2},\ \sin\tfrac{\theta}{2}\sin\tfrac{\varphi}{2}\bigr)`, value: '', note: 'the start (and Start again): from gravity\'s φ and θ above, the yaw ψ (psi) 0; flat, (1, 0, 0, 0)' },
      { tex: String.raw`\mathbf{q} = (q_w,\ q_x,\ q_y,\ q_z) =`, value: vec(u.fused?.held?.q, 3), note: 'then, each reading: the q the filter made the reading before (the last line below)' },
      { tex: String.raw`\beta = 2 \arccos q_w =`, value: turn.value ? `${turn.value.beta.toFixed(1)}°` : '—', note: 'how far the board has turned from the start, all in one turn' },
      { tex: String.raw`\mathbf{n} = (q_x,\ q_y,\ q_z) \,/\, \sin\tfrac{\beta}{2} =`, value: vec(turn.value?.n, 3), note: 'the axis of that turn (none while β is 0): so q = (cos β/2, n sin β/2)' },
    ] },
    { title: 'Fused: Mahony\'s filter, each reading', rows: [
      { tex: String.raw`k_p =`, value: `${u.kp} /s`, note: 'the spring: an e of so many radians steers the gyro by kp × e radians a second, so gravity closes a gap in about 1/kp = 1 s' },
      { tex: String.raw`k_i =`, value: `${u.ki} /s²`, note: 'the memory: e held for a second adds ki × e to the steering, for good; it learns a gyro offset in about kp/ki = 10 s (capped at ±10 °/s). Both are this site\'s picks, not the paper\'s or a chip\'s: calm through a shake, level again within a second or two. Try others on Learn the IMU, step 4' },
      { tex: String.raw`-k_i \textstyle\int \mathbf{e}\,dt =`, value: `${vec(u.learned, 2)} °/s`, note: 'what the I has learned so far: the gyro\'s offset, on the axes gravity can see' },
      { tex: String.raw`k_d =`, value: '0', note: 'no D: the gyro already gives the rate of turning, read directly every reading; a D on e would take a noisier one from the accelerometer\'s jitter' },
      { tex: String.raw`\hat{\mathbf{a}} = \mathbf{a} \,/\, \lVert \mathbf{a} \rVert =`, value: vec(aHat.value, 3), note: 'up, as gravity says: a, the accelerometer\'s reading (the first block), about 1 g up at rest; divided by its length |a|, only its direction is kept' },
      { tex: String.raw`\hat{\mathbf{v}} = \bigl(2(q_x q_z - q_w q_y),\ 2(q_y q_z + q_w q_x),\ 1 - 2(q_x^2 + q_y^2)\bigr) =`, value: vec(u.fused?.held?.up, 3), note: 'up, as q says' },
      { tex: String.raw`\mathbf{e} = \hat{\mathbf{a}} \times \hat{\mathbf{v}} =`, value: vec(err.value, 3), note: 'how far apart the two ups are (a cross product)' },
      { tex: String.raw`\boldsymbol{\omega}' = \boldsymbol{\omega} + k_p\,\mathbf{e} + k_i \textstyle\int \mathbf{e}\,dt + k_d \frac{d\mathbf{e}}{dt}`, value: '', note: 'the gyro, steered toward gravity: PID: kp e now, ki ∫e over time, kd de/dt how fast it changes; here kd = 0, so a PI controller' },
      { tex: String.raw`\mathbf{q} \leftarrow \mathbf{q} + \tfrac{1}{2}\,\mathbf{q} \otimes (0,\ \boldsymbol{\omega}')\,\Delta t =`, value: vec(u.fused?.q, 3), note: '⊗, the quaternion product: q turned by ω′ over Δt, made unit length, held for the next reading; φ, θ and ψ come from it' },
      { tex: String.raw`(\varphi,\ \theta,\ \psi) =`, value: fusionAngles(u), note: 'roll, pitch and yaw, from the new q: the attitude, fused' },
    ] },
  ];
});
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
</script>

<template>
  <section :class="card">
    <div class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 class="text-lg font-semibold">The numbers, and what's done with them</h2>
      <button :class="button" :disabled="!running" @click="fusion.restart">Start again</button>
    </div>
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
    <LiveChart title="Roll" unit="degrees" :series="THREE" :values="fusion.fused ? [fusion.fused.roll, fusion.gravity.roll, fusion.gyroAlone.roll] : []" :source="fusion.rollSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
  <section :class="card">
    <LiveChart title="Pitch" unit="degrees" :series="THREE" :values="fusion.fused ? [fusion.fused.pitch, fusion.gravity.pitch, fusion.gyroAlone.pitch] : []" :source="fusion.pitchSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
</template>
