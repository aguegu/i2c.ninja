<script setup>
// atan2 as triangles, live: gravity's tilt from the accelerometer's reading.
// φ_g = atan2(ay, az): az across, ay up, the angle at the corner; θ_g =
// atan2(ax, √(ay² + az²)): the level part across, ax up. Units of g; the
// legs in their axes' colours. With vHat (v̂, up as q says, in the board's
// axes) the same angle from it too: a second line from the corner, as long
// as a's, the gap between them what Mahony's filter steers away.
import { computed } from 'vue';
import TexMath from './TexMath.vue';

const props = defineProps({
  accel: { type: Array, default: null }, // [ax ay az] g
  vHat: { type: Array, default: null }, // [x y z] unit
});

const U = 62; // px a g
const R = 92; // half the drawing
const ARC = 22; // the angle's arc radius, px
const COLOR = { x: 'var(--series-1)', y: 'var(--series-2)', z: 'var(--series-3)', level: '#64748b' };
const DEG = 180 / Math.PI;
const A_COLOR = '#dc2626'; // â's and v̂'s colours, as in the two ups
const V_COLOR = '#7c3aed';
const GAP_ARC = 40; // the gap's arc radius, px

const n = (v) => v.toFixed(2);
// one triangle: across (h) and up (v) in g, their names (parts [text, sub?]) and colours
function triangle(h, v, hName, vName, hColor, vColor, sym) {
  const angle = Math.atan2(v, h);
  const P = [h * U, -v * U];
  const steps = 16;
  const arc = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (angle * i) / steps;
    return `${(ARC * Math.cos(t)).toFixed(1)},${(-ARC * Math.sin(t)).toFixed(1)}`;
  }).join(' ');
  const mid = angle / 2;
  return {
    P, hName, vName, hColor, vColor, sym,
    hValue: n(h), vValue: n(v), deg: (angle * DEG).toFixed(1),
    arc, tag: [(ARC + 14) * Math.cos(mid), -(ARC + 14) * Math.sin(mid) + 4],
  };
}

// v̂'s line: the angle q says (h, v across and up of v̂), drawn as long as a's
// hypotenuse, and the arc from a's angle to it
function qLine(t, h, v) {
  const angle = Math.atan2(v, h), len = Math.hypot(t.P[0], t.P[1]) || U;
  const from = Math.atan2(-t.P[1], t.P[0]);
  const d = Math.atan2(Math.sin(angle - from), Math.cos(angle - from)); // the short way round
  const steps = 12;
  const arc = Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + (d * i) / steps;
    return `${(GAP_ARC * Math.cos(a)).toFixed(1)},${(-GAP_ARC * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return { Q: [len * Math.cos(angle), -len * Math.sin(angle)], deg: (angle * DEG).toFixed(1), gap: (d * DEG).toFixed(1), arc };
}

const views = computed(() => {
  const [ax, ay, az] = props.accel ?? [0, 0, 1];
  const vs = props.vHat;
  const out = [
    { key: 'phi', tex: String.raw`\varphi_g = \operatorname{atan2}(a_y,\ a_z)`, t: triangle(az, ay, [['a'], ['z', 1]], [['a'], ['y', 1]], COLOR.z, COLOR.y, 'φ') },
    { key: 'theta', tex: String.raw`\theta_g = \operatorname{atan2}\!\left(a_x,\ \sqrt{a_y^2 + a_z^2}\right)`, t: triangle(Math.hypot(ay, az), ax, [['√(a'], ['y', 1], ['² + a'], ['z', 1], ['²)']], [['a'], ['x', 1]], COLOR.level, COLOR.x, 'θ') },
  ];
  if (vs) {
    out[0].q = qLine(out[0].t, vs[2], vs[1]);
    out[1].q = qLine(out[1].t, Math.hypot(vs[1], vs[2]), vs[0]);
  }
  return out;
});
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <figure v-for="w in views" :key="w.key" class="flex flex-col items-center">
      <svg :viewBox="`${-R} ${-R} ${2 * R} ${2 * R}`" class="h-48 w-full max-w-56" role="img" :aria-label="`${w.t.sym} = ${w.t.deg} degrees: across ${w.t.hValue} g, up ${w.t.vValue} g`">
        <!-- the axes, a 1 g circle -->
        <circle :r="U" fill="none" stroke="var(--chart-grid)" stroke-dasharray="3 4" />
        <line :x1="-R + 4" y1="0" :x2="R - 4" y2="0" stroke="var(--chart-grid)" />
        <line x1="0" :y1="-R + 4" x2="0" :y2="R - 4" stroke="var(--chart-grid)" />
        <!-- the legs: across, then up -->
        <line x1="0" y1="0" :x2="w.t.P[0]" y2="0" :stroke="w.t.hColor" stroke-width="3" stroke-linecap="round" />
        <line :x1="w.t.P[0]" y1="0" :x2="w.t.P[0]" :y2="w.t.P[1]" :stroke="w.t.vColor" stroke-width="3" stroke-linecap="round" />
        <!-- a: the hypotenuse, and the angle -->
        <line x1="0" y1="0" :x2="w.t.P[0]" :y2="w.t.P[1]" :stroke="A_COLOR" stroke-width="2" />
        <circle :cx="w.t.P[0]" :cy="w.t.P[1]" r="3" :fill="A_COLOR" />
        <!-- v̂: the same angle as q says it, and the gap -->
        <template v-if="w.q">
          <polyline :points="w.q.arc" fill="none" :stroke="V_COLOR" stroke-width="1.5" stroke-dasharray="3 2" />
          <line x1="0" y1="0" :x2="w.q.Q[0]" :y2="w.q.Q[1]" :stroke="V_COLOR" stroke-width="2" />
          <circle :cx="w.q.Q[0]" :cy="w.q.Q[1]" r="3" :fill="V_COLOR" />
        </template>
        <polyline :points="w.t.arc" fill="none" stroke="#f59e0b" stroke-width="2" />
        <text :x="w.t.tag[0]" :y="w.t.tag[1]" font-size="12" text-anchor="middle" fill="#d97706">{{ w.t.sym }}</text>
        <!-- the axes' names: across under its right end, up beside its top -->
        <text :x="R - 4" y="15" font-size="11" text-anchor="end" :fill="w.t.hColor"><tspan v-for="(p, i) in w.t.hName" :key="i" :baseline-shift="p[1] ? 'sub' : null" :font-size="p[1] ? 8 : null">{{ p[0] }}</tspan></text>
        <text x="6" :y="-R + 12" font-size="11" :fill="w.t.vColor"><tspan v-for="(p, i) in w.t.vName" :key="i" :baseline-shift="p[1] ? 'sub' : null" :font-size="p[1] ? 8 : null">{{ p[0] }}</tspan></text>
      </svg>
      <figcaption class="text-center text-sm">
        <TexMath :expr="w.tex" />
        <span class="block font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">across {{ w.t.hValue }} g, up {{ w.t.vValue }} g: {{ w.t.sym }} = {{ w.t.deg }}°</span>
        <span v-if="w.q" class="block font-mono text-xs tabular-nums"><span :style="{ color: A_COLOR }">â {{ w.t.deg }}°</span> · <span :style="{ color: V_COLOR }">v̂ {{ w.q.deg }}°</span> · gap {{ w.q.gap }}°</span>
      </figcaption>
    </figure>
  </div>
</template>
