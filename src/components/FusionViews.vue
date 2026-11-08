<script setup>
// Two sensors fused, every way the site shows it: the numbers in and the
// formulas they go through (each with the latest values; Start again), then
// roll and pitch three ways (gravity's, the gyro alone, fused) and yaw two
// ways (the gyro alone, fused) on charts, then the result on a pilot's
// instruments: the attitude indicator (φ, θ) and the heading indicator (ψ),
// the board in a glass box and its three walls unfolded. A
// page brings a useFusion() (reactive) fed by its readings; running enables
// the button.
import { computed } from 'vue';
import LiveChart from './LiveChart.vue';
import TexMath from './TexMath.vue';
import InfoTip from './InfoTip.vue';
import AttitudeIndicator from './AttitudeIndicator.vue';
import HeadingIndicator from './HeadingIndicator.vue';
import ProjectionViews from './ProjectionViews.vue';
import TiltTriangles from './TiltTriangles.vue';
import TwoUps from './TwoUps.vue';
import ProjectionBox from './ProjectionBox.vue';

const props = defineProps({
  fusion: { type: Object, required: true }, // useFusion(), reactive
  running: { type: Boolean, default: false },
  windowMs: { type: Number, default: 10000 },
});

const ANGLE_FLOOR_DEG = 45; // the charts' least half-range
// each angle three ways, named as in the formulas (g gravity's, ω the gyro alone, q fused), in their order
const threeOf = (sym) => [
  { label: sym, sub: 'g', color: '--series-1' },
  { label: sym, sub: 'ω', color: '--series-2' },
  { label: sym, sub: 'q', color: '--series-3' },
];
const PHI = threeOf('φ');
const THETA = threeOf('θ');
const PSI = threeOf('ψ').slice(1); // no ψ_g: gravity can't see yaw
const f = (v, n = 0) => (v === undefined || v === null ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(n));
// the latest numbers, as they go into the formulas
const n = (v, d = 3) => (v === undefined || v === null ? '—' : v.toFixed(d));
const formula = 'grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm leading-6 whitespace-nowrap dark:bg-slate-900';
const value = 'text-emerald-700 dark:text-emerald-400';
// each value's widest so far, in characters (the font is monospaced): its
// cell keeps that width, so a number growing a digit or a sign doesn't
// resize the column, re-wrap the notes and move the page under it each
// reading; it only grows, a few times after a start
const widths = new Map();
const widest = (key, text) => {
  const n = Math.max(widths.get(key) ?? 0, [...text].length);
  widths.set(key, n);
  return n;
};
const vec = (v, d) => (v ? `(${v.map((c) => n(c, d)).join(', ')})` : '—');
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const aHat = computed(() => {
  const a = props.fusion.input?.accel, m = a && Math.hypot(...a);
  return m ? a.map((c) => c / m) : null;
});
const err = computed(() => (aHat.value && props.fusion.fused?.held ? cross(aHat.value, props.fusion.fused.held.up) : null));
// q as one turn: its angle beta (degrees) and axis n (the same in the
// board's axes and the room's)
const turnOf = (q) => {
  if (!q) return null;
  const w = Math.min(1, Math.abs(q[0])), sgn = q[0] < 0 ? -1 : 1; // q and -q are the same turn: the short way
  const beta = 2 * Math.acos(w) * (180 / Math.PI), s2 = Math.sqrt(1 - w * w);
  return { beta, n: s2 > 1e-6 ? q.slice(1).map((c) => (sgn * c) / s2) : null };
};
const turn = computed(() => turnOf(props.fusion.fused?.held?.q));
const fusionAngles = (u) => (u.fused ? `(${f(u.fused.roll, 1)}, ${f(u.fused.pitch, 1)}, ${f(u.fused.yaw, 1)})°` : '—');
const flatCaptions = computed(() => {
  const u = props.fusion.fused;
  const deg = (v) => (u ? `${f(v, 0)}°` : '—');
  return {
    back: { sym: 'φ', sub: 'q', value: deg(u?.roll), name: 'roll' },
    side: { sym: 'θ', sub: 'q', value: deg(u?.pitch), name: 'pitch' },
    floor: { sym: 'ψ', sub: 'q', value: deg(u?.yaw), name: 'yaw' },
  };
});
// each block: a formula a row (LaTeX), its result with the latest numbers
// (wide: a long formula, its result after it on the line); term: the short
// name shown beside it, note: the explanation, in its tooltip
const blocks = computed(() => {
  const u = props.fusion, i = u.input;
  return [
    { title: 'From the sensors, every reading', rows: [
      { tex: String.raw`\mathbf{a} = (a_x,\ a_y,\ a_z) =`, value: `${vec(i?.accel, 3)} g`, term: 'the accelerometer', note: 'The accelerometer\'s raw reading, in g, along the board\'s x, y and z: gravity\'s pull (about 1 g up at rest) plus every push and shake' },
      { tex: String.raw`\mathbf{b}_0 =`, value: `${vec(u.b0, 2)} °/s`, term: 'Zero\'s offset', note: u.zeroed ? 'What the gyro reads while still: averaged over the two seconds after you pressed Zero, and taken off every reading since' : 'What the gyro reads while still: not measured yet, so 0. Hold the board still and press Zero' },
      { tex: String.raw`\boldsymbol{\omega} = (\omega_x,\ \omega_y,\ \omega_z) =`, value: `${vec(i?.gyro, 1)} °/s`, term: 'the gyro', note: 'The gyro\'s reading: how fast the board turns about its x, y and z, in degrees a second, b₀ taken off' },
      { tex: String.raw`\Delta t =`, value: i ? `${(i.dt * 1000).toFixed(0)} ms` : '—', term: 'the time step', note: 'The time since the reading before: a turn rate times Δt is how far the board turned meanwhile' },
    ] },
    { title: 'Gravity\'s tilt, from a alone', rows: [
      { tex: String.raw`\varphi_g = \operatorname{atan2}(a_y,\ a_z) =`, value: `${f(u.gravity?.roll, 1)}°`, term: 'roll, from gravity', note: 'φ (phi), the roll: the turn about the nose (x), worked out from which way gravity pulls. Steady, but every shake moves it' },
      { tex: String.raw`\theta_g = \operatorname{atan2}\!\left(a_x,\ \sqrt{a_y^2 + a_z^2}\right) =`, value: `${f(u.gravity?.pitch, 1)}°`, term: 'pitch, from gravity', note: 'θ (theta), the pitch: nose up or down, from gravity too. With the roll it says where down is; gravity can\'t tell the heading' },
    ] },
    { title: 'The gyro alone: ω added up, from gravity\'s start', rows: [
      { tex: String.raw`\varphi_\omega \leftarrow \varphi_\omega + \omega_x\,\Delta t =`, value: `${f(u.gyroAlone?.roll, 1)}°`, term: 'roll, gyro alone', note: 'The roll from the gyro alone: gravity\'s roll at the start, then each reading\'s turn added. Smooth and quick, but its small errors add up: watch it drift' },
      { tex: String.raw`\theta_\omega \leftarrow \theta_\omega - \omega_y\,\Delta t =`, value: `${f(u.gyroAlone?.pitch, 1)}°`, term: 'pitch, gyro alone', note: 'The pitch from the gyro alone, added up the same way; minus ω_y because nose up is a turn about −y in the board\'s axes' },
      { tex: String.raw`\psi_\omega \leftarrow \psi_\omega - \omega_z\,\Delta t =`, value: `${f(u.gyroAlone?.yaw, 1)}°`, term: 'yaw, gyro alone', note: 'The yaw (the heading) from the gyro alone: from 0, as gravity can\'t see yaw; minus ω_z because turning right is a turn about −z. Nothing corrects it, so it drifts for good' },
    ] },
    { title: 'The attitude, q: a quaternion, four numbers for how the board sits in the room', rows: [
      { tex: String.raw`\mathbf{q}_0 = \bigl(\cos\tfrac{\theta_g}{2}\cos\tfrac{\varphi_g}{2},\ \cos\tfrac{\theta_g}{2}\sin\tfrac{\varphi_g}{2},\ -\sin\tfrac{\theta_g}{2}\cos\tfrac{\varphi_g}{2},\ \sin\tfrac{\theta_g}{2}\sin\tfrac{\varphi_g}{2}\bigr)`, value: '', term: 'the start', note: 'Where q starts (and Start again): built from gravity\'s roll and pitch above, the yaw 0. Lying flat it\'s (1, 0, 0, 0), no turn at all' },
      { tex: String.raw`\mathbf{q} = (q_w,\ q_x,\ q_y,\ q_z) =`, value: vec(u.fused?.held?.q, 3), term: 'the attitude', note: 'The attitude as four numbers, a quaternion: how the board is turned in the room. Each reading starts from the q the filter made the reading before (the last lines below)' },
      { tex: String.raw`\mathbf{v}_W = \mathbf{q} \otimes (0,\ \mathbf{v}_b) \otimes \mathbf{q}^{*}`, value: '', term: 'what q does', note: 'What q is for: it turns a direction in the board\'s axes (b, the body frame) into the world\'s (W); q*, its conjugate, turns back' },
      { tex: String.raw`\beta = 2 \arccos q_w =`, value: turn.value ? `${turn.value.beta.toFixed(1)}°` : '—', term: 'the turn angle', note: 'How far the board has turned from the start, as one single turn about one axis: any attitude can be reached that way' },
      { tex: String.raw`\mathbf{n} = (q_x,\ q_y,\ q_z) \,/\, \sin\tfrac{\beta}{2} =`, value: vec(turn.value?.n, 3), term: 'the turn axis', note: 'The axis of that one turn, a unit direction (none while β is 0). Together: q = (cos β/2, n sin β/2)' },
    ] },
    { title: 'Fused: Mahony\'s filter, each reading', rows: [
      { tex: String.raw`k_p =`, value: `${u.kp} /s`, term: 'proportional gain', note: 'The spring: an e of so many radians steers the gyro by kp × e radians a second, so gravity closes a gap in about 1/kp = 1 s' },
      { tex: String.raw`k_i =`, value: `${u.ki} /s²`, term: 'integral gain', note: 'The memory: e held for a second adds ki × e to the steering, for good; it learns a gyro offset in about kp/ki (10 s at 1 and 0.1) (capped at ±10 °/s). Both are this site\'s picks, not the paper\'s or a chip\'s: calm through a shake, level again within a second or two. Try others with the sliders under Mahony\'s filter, below' },
      { tex: String.raw`k_d =`, value: '0', term: 'derivative gain', note: 'No D: the gyro already gives the rate of turning, read directly every reading; a D on e would take a noisier one from the accelerometer\'s jitter' },
      { tex: String.raw`\hat{\mathbf{a}} = \mathbf{a} \,/\, \lVert \mathbf{a} \rVert =`, value: vec(aHat.value, 3), term: 'up, from gravity', note: 'Up, as gravity says: a, the accelerometer\'s reading (the first block), about 1 g up at rest; divided by its length |a|, only its direction is kept' },
      { tex: String.raw`\hat{\mathbf{v}} = \bigl(2(q_x q_z - q_w q_y),\ 2(q_y q_z + q_w q_x),\ 1 - 2(q_x^2 + q_y^2)\bigr) =`, value: vec(u.fused?.held?.up, 3), wide: true, term: 'up, from q', note: 'Up, as q says it: the world\'s Z turned into the board\'s own axes. With q right and the board still, v̂ and â match' },
      { tex: String.raw`\mathbf{e} = \hat{\mathbf{a}} \times \hat{\mathbf{v}} =`, value: vec(err.value, 3), term: 'the error', note: 'The error, a cross product: its length says how far apart the two ups are, its direction is the axis to turn q about to bring them together' },
      { tex: String.raw`\hat{\mathbf{b}} = -k_i \textstyle\int \mathbf{e}\,dt =`, value: `${vec(u.learned, 2)} °/s`, term: 'the bias estimate', note: 'B̂ (b-hat): the gyro\'s bias (its offset), estimated: what the I has learned so far, on the axes gravity can see. The hat here means estimated' },
      { tex: String.raw`\boldsymbol{\omega}' = \boldsymbol{\omega} + k_p\,\mathbf{e} + k_i \textstyle\int \mathbf{e}\,dt + k_d \frac{d\mathbf{e}}{dt}`, value: '', term: 'the steered gyro', note: 'The gyro, steered toward gravity: PID: kp e now, ki ∫e over time (that is, −b̂), kd de/dt how fast it changes; here kd = 0, so a PI controller' },
      { tex: String.raw`\mathbf{q} \leftarrow \mathbf{q} + \tfrac{1}{2}\,\mathbf{q} \otimes (0,\ \boldsymbol{\omega}')\,\Delta t =`, value: vec(u.fused?.q, 3), term: 'the update', note: '⊗, the quaternion product: q turned by ω′ over Δt, made unit length, held for the next reading; the fused angles come from it (the last line)' },
      { tex: String.raw`(\varphi_q,\ \theta_q,\ \psi_q) =`, value: fusionAngles(u), term: 'the fused angles', note: 'Roll, pitch and yaw read back from the new q: the attitude fused, steady like gravity\'s and quick like the gyro\'s. The gauges below show them' },
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
            <!-- a row without a value: its formula across both columns; a
                 wide one (a long formula): its value after it, both across -->
            <span v-if="r.wide" class="col-span-2"><TexMath :expr="r.tex" /> <span class="inline-block" :class="value" :style="{ minWidth: `${widest(r.tex, r.value)}ch` }">{{ r.value }}</span></span>
            <template v-else>
              <TexMath :expr="r.tex" :class="r.value === '' && 'col-span-2'" /><span v-if="r.value !== ''" :class="value" :style="{ minWidth: `${widest(r.tex, r.value)}ch` }">{{ r.value }}</span>
            </template>
            <!-- the term, its explanation in a tooltip (hover, focus or a tap) -->
            <InfoTip :text="r.note" class="cursor-help justify-self-end text-right font-sans text-xs text-slate-500 underline decoration-dotted underline-offset-2 dark:text-slate-400">{{ r.term }}</InfoTip>
          </template>
        </div>
      </div>
    </div>
  </section>
  <section :class="card">
    <h2 class="mb-2 text-lg font-semibold">The math, drawn</h2>
    <div class="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
      <div>
        <p class="mb-2 text-sm font-semibold">Gravity's tilt: atan2 as a triangle, and q's</p>
        <TiltTriangles :accel="fusion.input?.accel ?? null" :v-hat="fusion.fused?.held?.up ?? null" />
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">atan2 takes the two legs of a right triangle, across and up, and gives the angle at its corner, the right way round in every quarter. Tilt the board and the triangles follow. The red line is a, gravity's say; the violet one is v̂, the same angle as q says it: the gap between them is what Mahony's filter closes.</p>
      </div>
      <div>
        <p class="mb-2 text-sm font-semibold">Mahony's comparison: the two ups</p>
        <TwoUps :a-hat="aHat" :v-hat="fusion.fused?.held?.up ?? null" :e="err" />
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">In the board's own axes. Held still they lie together; shake it and â swings away while v̂ hardly moves; e is the axis the filter turns q about to bring them back.</p>
      </div>
    </div>
  </section>
  <section :class="card">
    <LiveChart title="φ, the roll" unit="°" :series="PHI" :values="fusion.fused ? [fusion.gravity.roll, fusion.gyroAlone.roll, fusion.fused.roll] : []" :source="fusion.rollSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
  <section :class="card">
    <LiveChart title="θ, the pitch" unit="°" :series="THETA" :values="fusion.fused ? [fusion.gravity.pitch, fusion.gyroAlone.pitch, fusion.fused.pitch] : []" :source="fusion.pitchSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
  <section :class="card">
    <LiveChart title="ψ, the yaw" unit="°" :series="PSI" :values="fusion.fused ? [fusion.gyroAlone.yaw, fusion.fused.yaw] : []" :source="fusion.yawSource" :window-ms="windowMs" :floor="ANGLE_FLOOR_DEG" :digits="1" />
  </section>
  <section :class="card">
    <h2 class="mb-2 text-lg font-semibold">The result, as a pilot reads it</h2>
    <div class="flex flex-wrap justify-center gap-x-10 gap-y-4">
      <figure class="flex flex-col items-center gap-1">
        <AttitudeIndicator :roll="fusion.fused?.roll ?? 0" :pitch="fusion.fused?.pitch ?? 0" />
        <figcaption class="text-center text-sm">
          <TexMath :expr="String.raw`\varphi_q,\ \theta_q =`" />
          <span class="ml-1.5 font-mono tabular-nums">{{ f(fusion.fused?.roll, 0) }}°, {{ f(fusion.fused?.pitch, 0) }}°</span>
          <span class="block text-xs text-slate-500 dark:text-slate-400">the attitude indicator: the horizon tilts with φ, drops as the nose comes up with θ</span>
        </figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-1">
        <HeadingIndicator :heading="fusion.fused?.yaw ?? null" />
        <figcaption class="text-center text-sm">
          <TexMath :expr="String.raw`\psi_q =`" />
          <span class="ml-1.5 font-mono tabular-nums">{{ f(fusion.fused?.yaw, 0) }}°</span>
          <span class="block text-xs text-slate-500 dark:text-slate-400">the heading indicator: 0 is where the nose pointed at the start</span>
        </figcaption>
      </figure>
    </div>
    <figure class="mt-4 flex flex-col items-center">
      <ProjectionBox :q="fusion.fused?.q ?? [1, 0, 0, 0]" />
      <figcaption class="mt-1 max-w-xl text-center text-xs text-slate-500 dark:text-slate-400">the board in a glass box, as in an engineering drawing: seen from in front, its true projection on the floor (from above), the wall to its right (from its left side) and the wall behind it (from its nose). The world's axes leave the walls' corner. X, Y, Z: the world's axes; x, y, z: the board's own</figcaption>
    </figure>
    <div class="mt-4">
      <ProjectionViews :q="fusion.fused?.q ?? [1, 0, 0, 0]" :captions="flatCaptions" />
      <p class="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">the three walls unfolded: the board seen straight along the world's Z, Y and X. The world's axes in capitals, the board's own in lowercase</p>
    </div>
    <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
      In an aircraft the heading indicator is a gyro too: it knows no north and drifts, so pilots set it to the magnetic compass now and then. ψ<sub>q</sub> drifts the same way, and a compass would fix it the same way.
    </p>
  </section>
</template>
