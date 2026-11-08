<script setup>
// The live views of the Attitude page (and the board and the gyro ball), fed
// a made-up turning motion at the IMU's rate (useImu's 62.5 Hz) instead of a
// sensor, so their frame times can be measured on any machine: the glass
// box, its flat views, the two gauges, three charts. window.bench holds the
// counts bench/measure.mjs reads.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ProjectionBox from '../src/components/ProjectionBox.vue';
import ProjectionViews from '../src/components/ProjectionViews.vue';
import AttitudeIndicator from '../src/components/AttitudeIndicator.vue';
import HeadingIndicator from '../src/components/HeadingIndicator.vue';
import Board3D from '../src/components/Board3D.vue';
import GyroBall from '../src/components/GyroBall.vue';
import LiveChart from '../src/components/LiveChart.vue';
import { makeSeries } from '../src/lib/series.js';
import { fromAxisAngle } from '../src/lib/quaternion.js';

const SAMPLE_MS = 16; // useImu's
const WINDOW_MS = 10000;
const mul = ([a, b, c, d], [e, f, g, h]) => [a * e - b * f - c * g - d * h, a * f + b * e + c * h - d * g, a * g - b * h + c * e + d * f, a * h + b * g - c * f + d * e];
const SERIES3 = [{ label: 'g', color: '--series-1' }, { label: 'ω', color: '--series-2' }, { label: 'q', color: '--series-3' }];

// ?only=charts|gauges|box|flat|board|ball: one group alone, to find the costly one
// (?only=none: nothing shown, the floor)
const only = new URLSearchParams(location.search).get('only');
const show = (g) => !only || only === g;

const q = ref([1, 0, 0, 0]);
const roll = ref(0), pitch = ref(0), yaw = ref(0);
const rates = ref([0, 0, 0]), phases = ref([0, 0, 0]);
const charts = [makeSeries(3, WINDOW_MS), makeSeries(3, WINDOW_MS), makeSeries(2, WINDOW_MS)];

let timer = 0;
function tick() {
  const s = performance.now() / 1000;
  roll.value = 30 * Math.sin(s * 1.1);
  pitch.value = 20 * Math.sin(s * 0.7);
  yaw.value = (s * 25) % 360 - 180;
  q.value = mul(fromAxisAngle([0, 0, 1], yaw.value), mul(fromAxisAngle([0, 1, 0], pitch.value), fromAxisAngle([1, 0, 0], roll.value)));
  rates.value = [33 * Math.cos(s * 1.1), 14 * Math.cos(s * 0.7), 25];
  phases.value = [roll.value, pitch.value, yaw.value];
  const now = performance.now();
  charts[0].push(now, [roll.value, roll.value + 1, roll.value - 0.5]);
  charts[1].push(now, [pitch.value, pitch.value - 1, pitch.value + 0.5]);
  charts[2].push(now, [yaw.value, yaw.value + 2]);
  window.bench.samples++;
  timer = setTimeout(tick, SAMPLE_MS);
}
window.bench = { samples: 0 };
onMounted(tick);
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <template v-if="show('charts')">
      <LiveChart title="φ" unit="°" :series="SERIES3" :values="[roll, roll, roll]" :source="charts[0].source" :window-ms="WINDOW_MS" />
      <LiveChart title="θ" unit="°" :series="SERIES3" :values="[pitch, pitch, pitch]" :source="charts[1].source" :window-ms="WINDOW_MS" />
      <LiveChart title="ψ" unit="°" :series="SERIES3.slice(1)" :values="[yaw, yaw]" :source="charts[2].source" :window-ms="WINDOW_MS" />
    </template>
    <div v-if="show('gauges')" class="grid gap-4 sm:grid-cols-2">
      <AttitudeIndicator :roll="roll" :pitch="pitch" />
      <HeadingIndicator :heading="yaw" />
    </div>
    <ProjectionBox v-if="show('box')" :q="q" />
    <ProjectionViews v-if="show('flat')" :q="q" />
    <div class="grid gap-4 sm:grid-cols-2">
      <Board3D v-if="show('board')" :q="q" />
      <GyroBall v-if="show('ball')" :rates="rates" :phases="phases" />
    </div>
  </main>
</template>
