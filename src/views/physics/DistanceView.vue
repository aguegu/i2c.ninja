<script setup>
// Physics: distance and time of flight. How the VL53L1X times light there
// and back (moved from its device page); then motion from its distances:
// position, speed (a line fitted to the last few readings) and acceleration
// (a parabola fitted to a few more), how noise grows with each derivative,
// and a drop to see g. Short distance mode, 33 ms a reading (30 a second,
// ~1 mm of noise at a metre on r8845's module)
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import ConnectButton from '../../components/ConnectButton.vue';
import StopButton from '../../components/StopButton.vue';
import LiveSettings from '../../components/LiveSettings.vue';
import LiveChart from '../../components/LiveChart.vue';
import SvgDrawing from '../../components/SvgDrawing.vue';
import TexMath from '../../components/TexMath.vue';
import { reactive, ref, computed } from 'vue';
import { hasWebUsb } from '../../lib/dongle.js';
import { useVl53l1x, STATUS } from '../../lib/useVl53l1x.js';
import { makeSeries } from '../../lib/series.js';
import { makeMotion } from '../../lib/motion.js';

const WINDOW_MS = 10000;
const SETTINGS = { mode: 'short', budget: 33, roi: 16 }; // 30 readings a second, to 1.3 m
const LIGHT_MM_PER_NS = 299.792458; // the speed of light
const G = 9.81; // m/s², free fall at the Earth's surface
// sound in dry air: 331.3 m/s at 0 °C, 0.606 m/s more a degree (the usual
// linear approximation)
const SOUND_0C = 331.3;
const SOUND_PER_C = 0.606;
const ROOM_C = 20;
const sound = (c) => SOUND_0C + SOUND_PER_C * c;
const ROUND_TRIP_M = 2; // a target 1 m away
const soundMs = (ROUND_TRIP_M / sound(ROOM_C)) * 1000;
const lightNs = (ROUND_TRIP_M * 1000) / LIGHT_MM_PER_NS;
// readings fitted for speed and for acceleration: from neighbours only, to
// smoother (at 33 ms, 1 mm of noise leaves 0.044 / 2.3, 0.010 / 0.10,
// 0.004 / 0.03 m/s and m/s²: test/motion.test.js's sums)
const FITS = [
  { label: 'neighbours (2 and 3 readings)', speedPoints: 2, accelPoints: 3 },
  { label: '5 and 9 readings', speedPoints: 5, accelPoints: 9 },
  { label: '9 and 15 readings', speedPoints: 9, accelPoints: 15 },
];
const DERIVATIVES = String.raw`v = \frac{\Delta x}{\Delta t}, \qquad a = \frac{\Delta v}{\Delta t}`;
const PARABOLA = String.raw`\begin{gathered} x(t) \approx c_0 + c_1 t + c_2 t^2 \\ v = c_1, \qquad a = 2 c_2 \end{gathered}`;
const X_SERIES = [{ label: 'x', color: '--series-1' }];
const V_SERIES = [{ label: 'v', color: '--series-2' }];
const A_SERIES = [{ label: 'a', color: '--series-3' }];
const X_SPAN_MM = 50;
const V_FLOOR = 0.5; // m/s
const A_FLOOR = 15; // m/s²: g fits

const fit = ref(1);
const speed = makeSeries(1, WINDOW_MS);
const accel = makeSeries(1, WINDOW_MS);
const latestV = ref(null);
const latestA = ref(null);
let motion = makeMotion(FITS[fit.value]);

function onValid(t, mm) {
  const o = motion.push(t, mm);
  if (o.speed) { speed.push(o.speed.t, [o.speed.v]); latestV.value = o.speed.v; }
  if (o.acceleration) { accel.push(o.acceleration.t, [o.acceleration.a]); latestA.value = o.acceleration.a; }
}

function setFit(i) {
  fit.value = i;
  motion = makeMotion(FITS[i]);
  speed.clear();
  accel.clear();
  latestV.value = null;
  latestA.value = null;
}

const tof = reactive(useVl53l1x({ windowMs: WINDOW_MS, settings: SETTINGS, onValid }));
const r = computed(() => tof.latest);
// the light's round trip to the target and back
const roundTripNs = computed(() => (r.value?.valid ? (2 * r.value.distance) / LIGHT_MM_PER_NS : null));

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Distance and time of flight</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A time-of-flight sensor measures distance by timing something out to whatever it faces and back: light, or sound. Read it often enough and the distances tell more than where something is: how fast it moves, and how fast that changes. Here with the <RouterLink to="/vl53l1x" :class="link">VL53L1X</RouterLink>, 30 readings a second.
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <ConnectButton v-if="tof.state === 'idle' || tof.state === 'connecting'" :busy="tof.state === 'connecting'" @click="tof.connect">{{ tof.state === 'connecting' ? 'Connecting…' : 'Connect a VL53L1X' }}</ConnectButton>
      <StopButton v-else @click="tof.disconnect" />
      <label :class="field">Speed and acceleration from
        <select :value="fit" :class="select" @change="setFit(Number($event.target.value))">
          <option v-for="(f, i) in FITS" :key="i" :value="i">{{ f.label }}</option>
        </select>
      </label>
      <span v-if="tof.state === 'running'" class="font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">short mode · 33 ms · {{ tof.rate.toFixed(1) }} readings/s</span>
      <LiveSettings class="ml-auto" />
    </section>
    <div v-if="tof.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ tof.failure.title }}</p>
      <p v-if="tof.failure.detail" class="mt-1">{{ tof.failure.detail }}</p>
      <p v-if="tof.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ tof.failure.error }}</p>
    </div>

    <section :class="[card, 'grid grid-cols-3 gap-4 font-mono tabular-nums']">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">position x</p>
        <p class="text-3xl">{{ r?.valid ? r.distance : '—' }} <span class="text-base">mm</span></p>
        <p v-if="r && !r.valid" class="text-xs text-amber-700 dark:text-amber-400">{{ STATUS[r.status] ?? `status ${r.status}` }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">speed v</p>
        <p class="text-3xl">{{ latestV !== null ? latestV.toFixed(2) : '—' }} <span class="text-base">m/s</span></p>
      </div>
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">acceleration a</p>
        <p class="text-3xl">{{ latestA !== null ? latestA.toFixed(1) : '—' }} <span class="text-base">m/s²</span></p>
      </div>
    </section>

    <CollapsibleCard id="motion" title="Position, speed, acceleration">
      <div class="flex flex-col gap-4">
        <LiveChart title="Position" unit="mm" :series="X_SERIES" :values="r?.valid ? [r.distance] : []" :source="tof.source" :window-ms="WINDOW_MS" :floor="X_SPAN_MM" :digits="0" fit />
        <LiveChart title="Speed" unit="m/s" :series="V_SERIES" :values="latestV !== null ? [latestV] : []" :source="speed.source" :window-ms="WINDOW_MS" :floor="V_FLOOR" :digits="2" />
        <LiveChart title="Acceleration" unit="m/s²" :series="A_SERIES" :values="latestA !== null ? [latestA] : []" :source="accel.source" :window-ms="WINDOW_MS" :floor="A_FLOOR" :digits="1" />
      </div>
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        x is the distance from the sensor: moving away is positive speed. Speed and acceleration are drawn a little late, at the middle of the readings they're fitted to.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="how-it-measures" title="How it measures" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <SvgDrawing src="/time-of-flight.svg" alt="Time of flight: the sensor sends a pulse of light to a wall and its detector catches the weaker echo a time Δt later; the distance d is the speed of light times Δt, halved; 1 m away the echo comes back after 6.67 ns" class="mx-auto mb-3 w-full max-w-xl" />
      <p class="mb-2">
        <b>Time of flight.</b> It sends out pulses of light and times how long they take to bounce back. Light goes about 300 mm a nanosecond, so the times are tiny:
        <span class="font-mono">{{ roundTripNs !== null ? `${r.distance} mm there and back is ${roundTripNs.toFixed(2)} ns` : 'a metre there and back is under 7 ns' }}</span>.
        No stopwatch is that fast for one pulse: it gathers the echoes of many pulses over a reading and works the distance out from when they arrive.
      </p>
      <p class="mb-2">
        <b>A reading takes its timing budget</b>, 33 ms on this page: longer gathers more photons, so reaches farther and is steadier. In long distance mode it reaches up to 4 m in the dark; bright light and dark, matt targets cut that down. Short mode gives up range (1.3 m) for better immunity to ambient light, and is the only one with a 20 ms budget.
      </p>
      <p class="mb-2">
        <b>The light comes back to a grid of 16 x 16 SPADs</b> (single-photon avalanche diodes), each able to notice a single photon. It picks how many to use for a reading, so they aren't flooded (the <RouterLink to="/vl53l1x" :class="link">VL53L1X page</RouterLink> shows how many, and the light each reading gets). Pick a smaller region and it looks through only the middle of the grid: a narrower view (27° across the diagonal with all of them, 15° with 4 x 4), and less light.
      </p>
      <p class="mb-2">
        <b>Each reading comes with a status.</b> Valid, or why not: too uncertain, too little light back (a far or dark target, or nothing at all), or past its range. The charts use the valid ones only.
      </p>
      <p>
        <b>Under the hood,</b> ST publishes no register map for it, only their "Ultra Lite Driver": atiic follows it, loading its 91 bytes of default configuration, setting the mode, budget and region with its values, and reading each result (status, distance, light back, background, SPADs) in one 17-byte read.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="light-or-sound" title="Light or sound" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Light or sound</h2>
      <p class="mb-2">
        An ultrasonic sensor, like the cheap two-eyed modules in many kits, times flight too, but of sound: a click too high to hear, out and back. Sound is almost a million times slower than light: {{ sound(ROOM_C).toFixed(0) }} m/s in air at {{ ROOM_C }} °C, so a target a metre away answers after {{ soundMs.toFixed(1) }} ms, against {{ lightNs.toFixed(2) }} ns for light.
      </p>
      <ul class="mb-2 list-disc space-y-1 pl-5">
        <li><b>Sound is easy to time.</b> Milliseconds need no special hardware: any microcontroller times one echo with its clock. Light's nanoseconds take a chip like the VL53L1X, gathering many pulses.</li>
        <li><b>Sound depends on the air.</b> It goes {{ SOUND_PER_C }} m/s faster for every degree warmer: a sensor that assumes {{ ROOM_C }} °C reads about 1 % off for every 5 °C of difference ({{ sound(0).toFixed(0) }} m/s at 0 °C, {{ sound(40).toFixed(0) }} m/s at 40 °C). Light hardly cares about the air.</li>
        <li><b>Sound spreads wide.</b> Its beam is a broad cone, so it finds the nearest thing in a wide view, and soft things (curtains, clothes) swallow it. Light makes a narrow beam (27° here, narrower with a smaller region) and doesn't mind softness, but dark targets and sunlight cut its reach.</li>
        <li><b>Sound is slow to repeat.</b> Each click has to die away before the next, so a few tens of readings a second at most; and two sensors side by side hear each other.</li>
      </ul>
      <p>
        Most hobby ultrasonic modules talk through a trigger pin and an echo pin, not I2C, so this site doesn't read one yet. A third way, triangulation, needs no timing at all: an infrared spot seen at an angle that changes with distance.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="from-distance-to-speed" title="From distance to speed and acceleration" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">From distance to speed and acceleration</h2>
      <p class="mb-2">
        <b>Speed</b> is how fast the position changes, <b>acceleration</b> how fast the speed changes:
      </p>
      <TexMath class="mb-2 block" display :expr="DERIVATIVES" />
      <p class="mb-2">
        The simplest way takes two neighbouring readings for v, and three for a. Try it with "neighbours" above and hold the sensor still: the speed shakes by centimetres a second and the acceleration by metres a second squared, with nothing moving. Each reading is off by a millimetre or so, and dividing by 33 ms turns that millimetre into 0.03 m/s; dividing again turns it into metres a second squared. <b>Every derivative blows the noise up.</b>
      </p>
      <p class="mb-2">
        The cure is to use more readings: fit a straight line through the last 5 (its slope is v) and a parabola through the last 9 (its curve, twice its t² term, is a). With 1 mm of noise that's about 0.01 m/s and 0.1 m/s² instead of 0.04 m/s and 2.3 m/s². The price is delay and smoothing: a fit over 9 readings looks back 0.3 s, so a quick change shows late and rounded off. Measuring always trades between noise and speed of response.
      </p>
      <TexMath class="block" display :expr="PARABOLA" />
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Still.</b> Point it at a wall and keep it still. x stays put; see how much v and a shake with each choice of readings.</li>
        <li><b>Walk it.</b> Move a book slowly away from it and back, at a steady pace: v reads a flat line above zero, then below; a stays near zero except where you turn round.</li>
        <li><b>Drop it.</b> Tape the sensor to a table's edge looking down at the floor. Hold a book just under it and let go: in free fall a jumps to about {{ G }} m/s² for a moment (the fall from a metre lasts under half a second), and v climbs in a straight line. A falling book needs no spring or chip inside to show g: just its distances in time.</li>
        <li><b>Bounce.</b> Drop a ball under it instead: v flips sign at each bounce, and a spikes far past g as the floor stops it.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>See also:</b> <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink>, the same g felt by a mass on springs.
    </p>
  </main>
</template>
