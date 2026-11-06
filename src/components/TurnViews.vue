<script setup>
// The board's turn about each axis, as three flat views: from above (x
// right, y up: the axes as printed; turned by its angle about z), from its
// right side (x right, z up; by its angle about y), from its nose (y right,
// z up; by its angle about x). Each angle is the rate about that axis added
// up on its own: right for one turn at a time, a sketch when turns mix.
// captions: optional, per axis { sym, sub, value, name } in place of
// "about x" (a page showing its own angles, e.g. roll as φ). A button takes
// the three full screen.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  angles: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) }, // degrees
  captions: { type: Object, default: null },
});

const R = 100;
const HALF = { x: 55, y: 32.5, z: 4 }; // the board, half sizes (px)
const WALL = 85; // the wall's half size (px)
const GRID = [-WALL / 2, 0, WALL / 2];
const TOP = '#1f5fa8'; // the 3D board's colours
const SIDE = '#163f70';
// the top face's arrow, as the 3D board's (x ahead), in px: the shaft and its head
const ARROW = [[-30, 0], [30, 0], [19, -10], [30, 0], [19, 10]].map((p) => p.join(',')).join(' ');
const COLOR = { x: 'var(--series-1)', y: 'var(--series-2)', z: 'var(--series-3)' };
// each view: its axes across and up, the axis it turns about, and the turn's
// sense on screen: about an axis toward the eye a positive turn looks
// anticlockwise (SVG's rotate is clockwise: -1), away from it clockwise (+1)
const VIEWS = [
  { key: 'top', title: 'From above', h: 'x', v: 'y', about: 'z', sense: -1, away: 'z points at you' },
  { key: 'side', title: 'From its right side', h: 'x', v: 'z', about: 'y', sense: 1, away: 'y points away' },
  { key: 'nose', title: 'From its nose', h: 'y', v: 'z', about: 'x', sense: -1, away: 'x points at you' },
];

const views = computed(() => VIEWS.map((w) => {
  const a = props.angles[w.about] ?? 0;
  return { ...w, a, turn: `rotate(${(w.sense * a).toFixed(1)})`, bw: HALF[w.h], bh: HALF[w.v] };
}));
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! items-center justify-center bg-white p-4 dark:bg-slate-900'">
    <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <figure v-for="w in views" :key="w.key" class="flex flex-col items-center">
        <figcaption class="mb-1 text-sm font-semibold">{{ w.title }}</figcaption>
        <svg :viewBox="`${-R} ${-R} ${2 * R} ${2 * R}`" :class="full ? 'h-[60vh] w-full' : 'h-48 w-full max-w-60'" role="img" :aria-label="`${w.title}: turned ${w.a.toFixed(0)} degrees about ${w.about}`">
          <!-- the wall it's seen on, as in the glass box: tinted in its axis's colour, a faint grid -->
          <rect :x="-WALL" :y="-WALL" :width="2 * WALL" :height="2 * WALL" :fill="COLOR[w.about]" fill-opacity="0.08" :stroke="COLOR[w.about]" stroke-opacity="0.6" />
          <g :stroke="COLOR[w.about]" stroke-opacity="0.2">
            <line v-for="t in GRID" :key="`v${t}`" :x1="t" :y1="-WALL" :x2="t" :y2="WALL" />
            <line v-for="t in GRID" :key="`h${t}`" :x1="-WALL" :y1="t" :x2="WALL" :y2="t" />
          </g>
          <text :x="R - 6" y="-6" text-anchor="end" font-size="11" :fill="COLOR[w.h]">+{{ w.h }}</text>
          <text x="5" :y="-R + 14" font-size="11" :fill="COLOR[w.v]">+{{ w.v }}</text>
          <g :transform="w.turn">
            <rect :x="-w.bw" :y="-w.bh" :width="2 * w.bw" :height="2 * w.bh" :fill="w.about === 'z' ? TOP : SIDE" stroke="#0b1f38" stroke-width="1" stroke-linejoin="round" />
            <!-- from above: the top face, its big white nose arrow, as on the 3D board -->
            <polyline v-if="w.about === 'z'" :points="ARROW" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <!-- the nose (+x) where it shows: an arrow from above and from the side, a dot seen from the nose -->
            <path v-if="w.h === 'x'" :d="`M ${w.bw - 2} 0 L ${w.bw + 14} 0`" :stroke="COLOR.x" stroke-width="4" stroke-linecap="round" />
            <path v-if="w.h === 'x'" :d="`M ${w.bw + 20} 0 L ${w.bw + 10} -6 L ${w.bw + 10} 6 Z`" :fill="COLOR.x" />
            <g v-if="w.about === 'x'"><circle r="7" fill="none" :stroke="COLOR.x" stroke-width="2" /><circle r="2.2" :fill="COLOR.x" /></g>
          </g>
          <!-- the axis it turns about, at the corner, its positive way -->
          <g :transform="`translate(${-R + 18} ${R - 18})`" :stroke="COLOR[w.about]" :fill="COLOR[w.about]">
            <circle r="7" fill="none" stroke-width="2" />
            <circle v-if="w.sense < 0" r="2.2" stroke="none" />
            <g v-else stroke-width="2"><line x1="-5" y1="-5" x2="5" y2="5" /><line x1="5" y1="-5" x2="-5" y2="5" /></g>
            <text x="12" y="4" font-size="11" stroke="none">{{ w.about }}</text>
          </g>
        </svg>
        <p v-if="captions?.[w.about]" class="font-mono text-sm tabular-nums">{{ captions[w.about].sym }}<sub>{{ captions[w.about].sub }}</sub> {{ captions[w.about].value }} · {{ captions[w.about].name }}</p>
        <p v-else class="font-mono text-sm tabular-nums">about {{ w.about }} {{ w.a.toFixed(0) }}°</p>
        <p class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ w.away }}</p>
      </figure>
    </div>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
