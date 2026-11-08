<script setup>
// An attitude indicator, as on an aircraft's panel: the horizon behind a
// fixed aircraft symbol. Nose up moves the horizon down (more sky); right
// side down turns the horizon the other way (its right end rises). A
// button takes it full screen, its roll and pitch written under it there.
// Drawn as layers: the horizon and the roll pointer each move by a CSS
// transform (the GPU turns them, nothing repaints), the rim and the
// aircraft painted once over them.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  roll: { type: Number, default: 0 }, // degrees, right side down +
  pitch: { type: Number, default: 0 }, // degrees, nose up +
});

const SIZE = 200;
const R = SIZE / 2;
const PX_PER_DEG = 1; // the pitch ladder's scale: the face's 96 px radius shows +/-90 degrees and a little
const LADDER = [-90, -80, -70, -60, -50, -40, -30, -20, -10, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const LABELLED = 30; // a long, numbered mark every 30 degrees (90's number would sit under the rim)
const SKY = '#4a90d9';
const GROUND = '#9b6b3d';

const FACE = 96; // the face's radius, in the viewBox's units
// the transforms, the shift as a share of the gauge so it scales with it
const horizon = computed(() => ({ transform: `rotate(${-props.roll}deg) translateY(${(props.pitch * PX_PER_DEG / SIZE) * 100}%)` }));
const rollMark = computed(() => ({ transform: `rotate(${-props.roll}deg)` }));
const LAYER = 'absolute inset-0 will-change-transform';
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative" :class="full && 'flex! h-full! w-full! flex-col items-center justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <div class="relative" :class="full ? 'h-[min(80vh,80vw)] w-[min(80vh,80vw)]' : 'h-52 w-52'" role="img" :aria-label="`Attitude: roll ${roll.toFixed(0)} degrees, pitch ${pitch.toFixed(0)} degrees`">
      <!-- the face, round: its moving layers clipped to it -->
      <div class="absolute overflow-hidden rounded-full" :style="{ inset: `${((R - FACE) / SIZE) * 100}%` }">
        <div class="absolute" :style="{ inset: `${-((R - FACE) / (2 * FACE)) * 100}%` }">
          <svg :class="LAYER" :style="horizon" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" overflow="visible" aria-hidden="true">
            <rect :x="-SIZE * 2" :y="-SIZE * 2" :width="SIZE * 4" :height="SIZE * 2" :fill="SKY" />
            <rect :x="-SIZE * 2" y="0" :width="SIZE * 4" :height="SIZE * 2" :fill="GROUND" />
            <line :x1="-SIZE * 2" y1="0" :x2="SIZE * 2" y2="0" stroke="white" stroke-width="2" />
            <g v-for="d in LADDER" :key="d" :transform="`translate(0 ${-d * PX_PER_DEG})`">
              <line :x1="d % LABELLED ? -10 : -24" y1="0" :x2="d % LABELLED ? 10 : 24" y2="0" stroke="white" :stroke-width="d % LABELLED ? 1 : 1.5" />
              <text v-if="!(d % LABELLED) && Math.abs(d) < 90" x="28" y="3.5" fill="white" font-size="10">{{ Math.abs(d) }}</text>
            </g>
          </svg>
          <!-- the roll pointer on the rim turns with the horizon -->
          <svg :class="LAYER" :style="rollMark" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" aria-hidden="true"><path d="M 0 -94 L -6 -82 L 6 -82 Z" fill="white" /></svg>
        </div>
      </div>
      <!-- the rim and the aircraft: fixed, painted once -->
      <svg class="absolute inset-0" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" aria-hidden="true">
        <circle :r="FACE" fill="none" stroke="#334155" stroke-width="4" />
        <path d="M -60 0 H -18 L -10 8 M 60 0 H 18 L 10 8" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <circle r="3" fill="#f59e0b" />
      </svg>
    </div>
    <p v-if="full" class="font-mono text-2xl tabular-nums">roll {{ roll.toFixed(0) }}° · pitch {{ pitch.toFixed(0) }}°</p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
