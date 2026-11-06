<script setup>
// atan2 as triangles, live: gravity's tilt from the accelerometer's reading.
// φ_g = atan2(ay, az): az across, ay up, the angle at the corner; θ_g =
// atan2(ax, √(ay² + az²)): the level part across, ax up. Units of g; the
// legs in their axes' colours.
import { computed } from 'vue';
import TexMath from './TexMath.vue';

const props = defineProps({
  accel: { type: Array, default: null }, // [ax ay az] g
});

const U = 62; // px a g
const R = 92; // half the drawing
const ARC = 22; // the angle's arc radius, px
const COLOR = { x: 'var(--series-1)', y: 'var(--series-2)', z: 'var(--series-3)', level: '#64748b' };
const DEG = 180 / Math.PI;

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

const views = computed(() => {
  const [ax, ay, az] = props.accel ?? [0, 0, 1];
  return [
    { key: 'phi', tex: String.raw`\varphi_g = \operatorname{atan2}(a_y,\ a_z)`, t: triangle(az, ay, [['a'], ['z', 1]], [['a'], ['y', 1]], COLOR.z, COLOR.y, 'φ') },
    { key: 'theta', tex: String.raw`\theta_g = \operatorname{atan2}\!\left(a_x,\ \sqrt{a_y^2 + a_z^2}\right)`, t: triangle(Math.hypot(ay, az), ax, [['√(a'], ['y', 1], ['² + a'], ['z', 1], ['²)']], [['a'], ['x', 1]], COLOR.level, COLOR.x, 'θ') },
  ];
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
        <line x1="0" y1="0" :x2="w.t.P[0]" :y2="w.t.P[1]" stroke="currentColor" stroke-width="1.5" />
        <circle :cx="w.t.P[0]" :cy="w.t.P[1]" r="3" fill="currentColor" />
        <polyline :points="w.t.arc" fill="none" stroke="#f59e0b" stroke-width="2" />
        <text :x="w.t.tag[0]" :y="w.t.tag[1]" font-size="12" text-anchor="middle" fill="#d97706">{{ w.t.sym }}</text>
        <!-- the axes' names: across under its right end, up beside its top -->
        <text :x="R - 4" y="15" font-size="11" text-anchor="end" :fill="w.t.hColor"><tspan v-for="(p, i) in w.t.hName" :key="i" :baseline-shift="p[1] ? 'sub' : null" :font-size="p[1] ? 8 : null">{{ p[0] }}</tspan></text>
        <text x="6" :y="-R + 12" font-size="11" :fill="w.t.vColor"><tspan v-for="(p, i) in w.t.vName" :key="i" :baseline-shift="p[1] ? 'sub' : null" :font-size="p[1] ? 8 : null">{{ p[0] }}</tspan></text>
      </svg>
      <figcaption class="text-center text-sm">
        <TexMath :expr="w.tex" />
        <span class="block font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">across {{ w.t.hValue }} g, up {{ w.t.vValue }} g: {{ w.t.sym }} = {{ w.t.deg }}°</span>
      </figcaption>
    </figure>
  </div>
</template>
