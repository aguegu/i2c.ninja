<script setup>
// An attitude indicator, as on an aircraft's panel: the horizon behind a
// fixed aircraft symbol. Nose up moves the horizon down (more sky); right
// side down turns the horizon the other way (its right end rises). A
// button takes it full screen, its roll and pitch written under it there.
// Drawn as layers: the horizon and the roll pointer each move by a CSS
// transform (the GPU turns them, nothing repaints), the rim and the
// aircraft painted once over them; Vue renders what doesn't move once
// (v-once), only the transforms change.
// heading (degrees, 0 magnetic north; 9-axis fusion): a heading tape on the
// horizon, as a glass cockpit's: a tick every 10 degrees, N, E, S and W and
// the tens between every 30, sliding along the horizon as the board turns.
// The roll scale, fixed on the rim as on an aircraft's: marks at 10, 20, 30,
// 45, 60 and 90 degrees either side (long at 30, 60 and 90) and a triangle
// at 0; the pointer turning with the horizon reads the roll against it.
// Lanes on the ground, as a road ahead in perspective: lines meeting at the
// horizon straight ahead, banking and pitching with it.
import { ref, computed } from 'vue';
import FullscreenButton from './FullscreenButton.vue';
import { canFullscreen, useFullscreen } from '../lib/fullscreen.js';

const props = defineProps({
  roll: { type: Number, default: 0 }, // degrees, right side down +
  pitch: { type: Number, default: 0 }, // degrees, nose up +
  heading: { type: Number, default: null }, // degrees, turning right +; null: no heading tape
  large: { type: Boolean, default: false }, // 288 px across, not 208: its marks easier to read
});

const SIZE = 200;
const R = SIZE / 2;
const PX_PER_DEG = 1; // the pitch ladder's scale: the face's 96 px radius shows +/-90 degrees and a little
const LADDER = [-90, -80, -70, -60, -50, -40, -30, -20, -10, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const LABELLED = 30; // a long, numbered mark every 30 degrees (90's number would sit under the rim)
const SKY = '#4a90d9';
const GROUND = '#9b6b3d';
const LANES = [-1.2, -0.4, 0.4, 1.2]; // each lane line's sideways run per unit down: a road ahead in perspective
const LANE_OPACITY = 0.3;
const TAPE = '#0f172a'; // slate-900: the heading tape apart from the white ladder; 5.3:1 on the sky, where its labels sit, 3.9:1 on the ground
const AIRCRAFT = '#f59e0b';
const AIRCRAFT_OPACITY = 0.65; // the horizon and the heading tape show through it
const RIM_OPACITY = 0.4; // the rim: the face's edge, light, the roll scale over it
const ROLL_MARKS = [10, 20, 30, 45, 60, 90].flatMap((d) => [d, -d]);
const ROLL_LONG = [30, 60, 90];
const SCALE_OUT = 95; // the roll scale's marks: from the rim inward
const SCALE_IN = 88; // a short mark's inner end
const SCALE_IN_LONG = 83; // a long mark's
const POINTER_TIP = 87; // the roll pointer's tip, pointing out at the scale (its zero triangle's tip)
const POINTER_BASE = 77;
const LADDER_WINDOW = 76; // the pitch ladder's round window: inside the pointer, so the top rungs never run into it

const FACE = 96; // the face's radius, in the viewBox's units
const HDG_PX_PER_DEG = 2; // the tape's scale: the face shows about +/-48 degrees of heading
const HDG_REACH = 240; // the tape drawn this far either side of 0: a heading near 180 still fills the face
const HDG_TICKS = Array.from({ length: (2 * HDG_REACH) / 10 + 1 }, (_, i) => i * 10 - HDG_REACH);
const CARDINALS = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
const hdgMark = (d) => { const a = ((d % 360) + 360) % 360; return CARDINALS[a] ?? a / 10; };
// the transforms, the shift as a share of the gauge so it scales with it
const horizon = computed(() => ({ transform: `rotate(${-props.roll}deg) translateY(${(props.pitch * PX_PER_DEG / SIZE) * 100}%)` }));
// the tape: the horizon's own transform, then along the horizon by the heading (-180..180)
const tape = computed(() => {
  const h = ((((props.heading ?? 0) + 180) % 360) + 360) % 360 - 180;
  return { transform: `rotate(${-props.roll}deg) translateY(${(props.pitch * PX_PER_DEG / SIZE) * 100}%) translateX(${(-h * HDG_PX_PER_DEG / SIZE) * 100}%)` };
});
const rollMark = computed(() => ({ transform: `rotate(${-props.roll}deg)` }));
const LAYER = 'absolute inset-0 will-change-transform';
const box = ref(null);
const { full, toggle } = useFullscreen(box);
</script>

<template>
  <div ref="box" class="relative live-view" :class="full && 'flex! h-full! w-full! flex-col items-center justify-center gap-4 bg-white p-4 dark:bg-slate-900'">
    <div class="relative" :class="full ? 'h-[min(80vh,80vw)] w-[min(80vh,80vw)]' : large ? 'aspect-square w-72 max-w-full' : 'h-52 w-52'" role="img" :aria-label="`Attitude: roll ${roll.toFixed(0)} degrees, pitch ${pitch.toFixed(0)} degrees${heading === null ? '' : `, heading ${(((heading % 360) + 360) % 360).toFixed(0)} degrees`}`">
      <!-- the face, round: its moving layers clipped to it -->
      <div class="absolute overflow-hidden rounded-full" :style="{ inset: `${((R - FACE) / SIZE) * 100}%` }">
        <div class="absolute" :style="{ inset: `${-((R - FACE) / (2 * FACE)) * 100}%` }">
          <svg :class="LAYER" :style="horizon" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" overflow="visible" aria-hidden="true">
            <g v-once>
              <rect :x="-SIZE * 2" :y="-SIZE * 2" :width="SIZE * 4" :height="SIZE * 2" :fill="SKY" />
              <rect :x="-SIZE * 2" y="0" :width="SIZE * 4" :height="SIZE * 2" :fill="GROUND" />
              <line v-for="c in LANES" :key="`l${c}`" x1="0" y1="0" :x2="c * SIZE * 2" :y2="SIZE * 2" stroke="white" :stroke-opacity="LANE_OPACITY" />
              <line :x1="-SIZE * 2" y1="0" :x2="SIZE * 2" y2="0" stroke="white" stroke-width="2" />
            </g>
          </svg>
          <!-- the pitch ladder: moves with the horizon, seen through a round window inside the roll scale -->
          <div class="absolute inset-0" :style="{ clipPath: `circle(${(LADDER_WINDOW / SIZE) * 100}% at 50% 50%)` }">
            <svg :class="LAYER" :style="horizon" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" overflow="visible" aria-hidden="true">
              <g v-once>
                <g v-for="d in LADDER" :key="d" :transform="`translate(0 ${-d * PX_PER_DEG})`">
                  <line :x1="d % LABELLED ? -10 : -24" y1="0" :x2="d % LABELLED ? 10 : 24" y2="0" stroke="white" :stroke-width="d % LABELLED ? 1 : 1.5" />
                  <text v-if="!(d % LABELLED) && Math.abs(d) < 90" x="28" y="3.5" fill="white" font-size="10">{{ Math.abs(d) }}</text>
                </g>
              </g>
            </svg>
          </div>
          <!-- the heading tape on the horizon: moves with it, and along it as the board turns -->
          <svg v-if="heading !== null" :class="LAYER" :style="tape" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" overflow="visible" aria-hidden="true">
            <g v-once>
              <g v-for="d in HDG_TICKS" :key="d" :transform="`translate(${d * HDG_PX_PER_DEG} 0)`">
                <line x1="0" :y1="d % 30 ? -3 : -4" x2="0" :y2="d % 30 ? 3 : 4" :stroke="TAPE" :stroke-width="d % 30 ? 1 : 1.5" />
                <text v-if="!(d % 30)" x="0" y="-6" text-anchor="middle" :fill="TAPE" font-size="9" :font-weight="d % 90 ? 'normal' : 'bold'">{{ hdgMark(d) }}</text>
              </g>
            </g>
          </svg>
          <!-- the roll pointer turns with the horizon: the aircraft's colour, as it reads the aircraft's roll -->
          <svg :class="LAYER" :style="rollMark" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" aria-hidden="true"><path :d="`M 0 ${-POINTER_TIP} L -6 ${-POINTER_BASE} L 6 ${-POINTER_BASE} Z`" :fill="AIRCRAFT" :opacity="AIRCRAFT_OPACITY" /></svg>
        </div>
      </div>
      <!-- the rim and the aircraft: fixed, painted and rendered once -->
      <svg v-once class="absolute inset-0" :viewBox="`${-R} ${-R} ${SIZE} ${SIZE}`" aria-hidden="true">
        <circle :r="FACE" fill="none" stroke="#334155" stroke-width="4" :stroke-opacity="RIM_OPACITY" />
        <!-- the roll scale: fixed, the pointer turns against it -->
        <line v-for="d in ROLL_MARKS" :key="`r${d}`" x1="0" :y1="-SCALE_OUT" x2="0" :y2="ROLL_LONG.includes(Math.abs(d)) ? -SCALE_IN_LONG : -SCALE_IN" :transform="`rotate(${d})`" stroke="white" :stroke-width="ROLL_LONG.includes(Math.abs(d)) ? 2 : 1.5" stroke-linecap="round" />
        <path :d="`M 0 ${-POINTER_TIP} L -6 ${-SCALE_OUT} L 6 ${-SCALE_OUT} Z`" fill="white" />
        <g :opacity="AIRCRAFT_OPACITY">
          <path d="M -60 0 H -18 L -10 8 M 60 0 H 18 L 10 8" fill="none" :stroke="AIRCRAFT" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <circle r="3" :fill="AIRCRAFT" />
        </g>
      </svg>
    </div>
    <p v-if="full" class="font-mono text-2xl tabular-nums">roll {{ roll.toFixed(0) }}° · pitch {{ pitch.toFixed(0) }}°</p>
    <FullscreenButton v-if="canFullscreen" :full="full" class="absolute top-0 right-0" @toggle="toggle" />
  </div>
</template>
