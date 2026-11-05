<script setup>
// The ITG-3200 live on the CH341 dongle: its three rates, the turn they
// add up to, its bias zeroed out, and how a vibrating mass feels a turn
import { reactive, computed } from 'vue';
import LiveChart from '../components/LiveChart.vue';
import GyroBall from '../components/GyroBall.vue';
import Board3D from '../components/Board3D.vue';
import TurnViews from '../components/TurnViews.vue';
import SpinGauge from '../components/SpinGauge.vue';
import SvgDrawing from '../components/SvgDrawing.vue';
import { hasWebUsb, hex } from '../lib/dongle.js';
import { useItg3200 } from '../lib/useItg3200.js';

const WINDOW_MS = 10000;
const FLOOR_DPS = 10; // the chart's least half-range: the noise at rest stays small
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
const AXES = ['x', 'y', 'z'];

const gyro = reactive(useItg3200({ windowMs: WINDOW_MS }));
const g = computed(() => gyro.latest);
const rates = computed(() => (g.value ? [g.value.x, g.value.y, g.value.z] : [0, 0, 0]));
const phases = computed(() => [gyro.angles.x, gyro.angles.y, gyro.angles.z]);
const fmt = (v, d = 1) => (v === undefined || v === null ? '—' : v.toFixed(d));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">ITG-3200</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        InvenSense's 3-axis gyroscope: how fast it's turning, in degrees a second, about three axes, and its own temperature. Live over the CH341 dongle, 100 readings a second.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
        New to these numbers? <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn the IMU</RouterLink>.
      </p>
    </div>

    <figure :class="card">
      <SvgDrawing src="/setup-itg3200.svg" alt="A CH341T dongle wired to an ITG-3200 breakout whose pins run SCL, SDA, CLK, INT, GND, VIO, VCC: VCC to VCC, GND to GND, SCL to SCL, SDA to SDA, a short jumper from VIO to VCC; INT and CLK free" class="mx-auto w-full lg:w-3/5" />
      <figcaption class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Four wires: VCC, GND, SCL and SDA. VIO sets the chip's I/O voltage and must be powered: tie it to VCC unless the board's jumper already does. INT and CLK stay free; AD0 as shipped picks 0x68. The axes printed on it are the ones read below.
      </figcaption>
    </figure>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>
    <section v-else class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <button v-if="gyro.state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="gyro.state === 'connecting'" @click="gyro.connect">
        {{ gyro.state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="gyro.disconnect">Stop</button>
      <span v-if="gyro.state === 'running'" class="ml-auto font-mono text-sm text-slate-500 dark:text-slate-400">{{ hex(gyro.address) }} · 400 kHz · ±2000 °/s · 98 Hz filter</span>
    </section>
    <div v-if="gyro.failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ gyro.failure.title }}</p>
      <p v-if="gyro.failure.detail" class="mt-1">{{ gyro.failure.detail }}</p>
      <p v-if="gyro.failure.error" class="mt-2 font-mono text-xs opacity-75">{{ gyro.failure.error }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-[1fr_auto]">
      <section :class="card">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="k in AXES" :key="k">
            <p class="text-sm text-slate-500 dark:text-slate-400">about {{ k }}</p>
            <p class="font-mono text-3xl tabular-nums">{{ fmt(g?.[k]) }} <span class="text-base">°/s</span></p>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">itself</p>
            <p class="font-mono text-3xl tabular-nums">{{ fmt(gyro.temperature) }} <span class="text-base">°C</span></p>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Held still a gyro should read 0 on every axis, but each has a small offset of its own, its zero-rate bias, which drifts with temperature. Hold it still and press Zero: two seconds' average is taken off from then on.
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="gyro.state !== 'running' || gyro.zeroing" @click="gyro.zero">{{ gyro.zeroing ? 'Hold still…' : 'Zero' }}</button>
          <span v-if="gyro.zeroed" class="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">bias {{ fmt(gyro.bias.x, 2) }}, {{ fmt(gyro.bias.y, 2) }}, {{ fmt(gyro.bias.z, 2) }} °/s</span>
        </div>
      </section>
      <section :class="[card, 'flex flex-col items-center']">
        <GyroBall :rates="rates" :phases="phases" />
        <p class="text-xs text-slate-500 dark:text-slate-400">rings turn as the board does; the arrow: its spin axis</p>
      </section>
    </div>

    <section :class="card">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 class="text-lg font-semibold">Turned so far</h2>
        <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="gyro.state !== 'running'" @click="gyro.resetAngles">Reset</button>
      </div>
      <div class="mt-3">
        <TurnViews :angles="gyro.angles" />
      </div>
      <p class="mt-3 leading-relaxed">
        A gyro tells how fast, not where: add up each reading times the time since the last, and you get how far it has turned, here about each axis on its own, drawn from three sides. Press Reset, turn the board a quarter turn about z and back, and watch. (Each axis added up alone is right for one turn at a time; mix turns and only the 3D view below keeps it right.) Then leave it still: the angles creep, because every leftover bit of bias is added up too, second after second. That drift is why a gyro alone can't keep its heading, and why it's paired with an accelerometer (for which way is down) and a compass (for north).
      </p>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
      <section :class="card">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 class="text-lg font-semibold">It follows you</h2>
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="gyro.state !== 'running'" @click="gyro.resetAngles">Reset</button>
        </div>
        <div class="flex justify-center"><Board3D :q="gyro.q" /></div>
        <p class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The rates added up into one whole turn (a quaternion, as in <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">Learn the IMU</RouterLink>), the board drawn turned by it. Hold the real board as on screen, press Reset, and turn it any way: the drawing follows. Put it down and wait: slowly the two part ways, the drift again.
        </p>
      </section>
      <section :class="card">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 class="text-lg font-semibold">How fast can you spin it?</h2>
          <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" :disabled="gyro.state !== 'running'" @click="gyro.resetPeak">Reset peak</button>
        </div>
        <SpinGauge :spin="gyro.spin" :peak="gyro.peak" />
        <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The turning rate's size, whichever way it turns, in revolutions a minute (°/s ÷ 6). Lay it flat and give it a spin, wires permitting: its full scale, 2000 °/s, is 333 rpm; past it the reading clips.
        </p>
      </section>
    </div>

    <section :class="card">
      <LiveChart title="Turning rate" unit="°/s" :series="SERIES" :values="rates" :source="gyro.source" :window-ms="WINDOW_MS" :floor="FLOOR_DPS" :digits="1" />
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">How it measures</h2>
      <p class="mb-2">
        <b>A mass kept shaking.</b> Each axis is a tiny vibrating structure: a mass driven back and forth, all the time. Not turning, it stays on its line. Turning, the Coriolis effect pushes it sideways, across its swing, flipping with each swing and growing with the rate of turn: F = 2 m v × Ω.
      </p>
      <SvgDrawing src="/itg3200-coriolis.svg" alt="Two panels: not turning, a mass driven back and forth between springs stays on its line and the sense plates above and below see equal gaps; turning, the Coriolis effect pushes it sideways toward a plate, flipping with each swing" class="mx-auto mb-3 w-full max-w-2xl" />
      <p class="mb-2">
        <b>Felt by capacitors.</b> Plates beside the mass feel the sideways push as a change in capacitance (a capacitive pickoff). The signal swings in step with the drive, so the chip amplifies it, demodulates it against the drive and filters it into a voltage proportional to the rate, then a 16-bit converter on each axis reads it.
      </p>
      <p>
        <b>The numbers:</b> ±2000 °/s, 14.375 counts a °/s; its offset can be up to ±40 °/s from the factory, noise about 0.38 °/s at the 98 Hz filter used here. It samples up to 8 kHz; its temperature reads 280 counts a degree.
      </p>
    </section>
  </main>
</template>
