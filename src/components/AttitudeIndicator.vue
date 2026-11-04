<script setup>
// An attitude indicator, as on an aircraft's panel: the horizon behind a
// fixed aircraft symbol. Nose up moves the horizon down (more sky); right
// side down turns the horizon the other way (its right end rises).
import { computed } from 'vue';

const props = defineProps({
  roll: { type: Number, default: 0 }, // degrees, right side down +
  pitch: { type: Number, default: 0 }, // degrees, nose up +
});

const SIZE = 200;
const R = SIZE / 2;
const PX_PER_DEG = 1; // the pitch ladder's scale: the face's 96 px radius shows +/-90 degrees and a little
const LADDER = [-90, -80, -70, -60, -50, -40, -30, -20, -10, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const LABELLED = 30; // a long, numbered mark every 30 degrees
const SKY = '#4a90d9';
const GROUND = '#9b6b3d';

const horizon = computed(() => `rotate(${-props.roll}) translate(0 ${props.pitch * PX_PER_DEG})`);
const rollMark = computed(() => `rotate(${-props.roll})`);
</script>

<template>
  <svg :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" class="h-52 w-52" role="img" :aria-label="`Attitude: roll ${roll.toFixed(0)} degrees, pitch ${pitch.toFixed(0)} degrees`">
    <defs>
      <clipPath id="ai-face"><circle r="96" /></clipPath>
    </defs>
    <g clip-path="url(#ai-face)">
      <g :transform="horizon">
        <rect :x="-SIZE * 2" :y="-SIZE * 2" :width="SIZE * 4" :height="SIZE * 2" :fill="SKY" />
        <rect :x="-SIZE * 2" y="0" :width="SIZE * 4" :height="SIZE * 2" :fill="GROUND" />
        <line :x1="-SIZE * 2" y1="0" :x2="SIZE * 2" y2="0" stroke="white" stroke-width="2" />
        <g v-for="d in LADDER" :key="d" :transform="`translate(0 ${-d * PX_PER_DEG})`">
          <line :x1="d % LABELLED ? -10 : -24" y1="0" :x2="d % LABELLED ? 10 : 24" y2="0" stroke="white" :stroke-width="d % LABELLED ? 1 : 1.5" />
          <text v-if="!(d % LABELLED)" x="28" y="3.5" fill="white" font-size="10">{{ Math.abs(d) }}</text>
        </g>
      </g>
      <!-- the roll pointer on the rim turns with the horizon -->
      <g :transform="rollMark"><path d="M 0 -94 L -6 -82 L 6 -82 Z" fill="white" /></g>
    </g>
    <circle r="96" fill="none" stroke="#334155" stroke-width="4" />
    <!-- the aircraft: fixed -->
    <path d="M -60 0 H -18 L -10 8 M 60 0 H 18 L 10 8" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <circle r="3" fill="#f59e0b" />
  </svg>
</template>
