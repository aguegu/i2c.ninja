<script setup>
// Physics: acceleration and gravity. What acceleration is, why a still
// sensor reads 1 g upward, how a MEMS accelerometer feels it (the ADXL345's
// datasheet: a polysilicon proof mass on springs, a differential
// capacitor), tilt from gravity; the devices that measure it; things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import { reactive } from 'vue';
import SvgDrawing from '../../components/SvgDrawing.vue';
import AccelerometerViews from '../../components/AccelerometerViews.vue';
import SourceBar from '../../components/SourceBar.vue';
import { ACCELEROMETERS } from '../../lib/sources.js';
import { useSource } from '../../lib/useSource.js';

const src = reactive(useSource(ACCELEROMETERS));

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Acceleration and gravity</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        Acceleration is how fast a velocity changes: speeding up, slowing down, turning. Accelerometers measure it in g, the acceleration of free fall at the Earth's surface (about 9.81 m/s²). And they show something surprising: sitting still on a desk, one reads 1 g, pointing up.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
    </section>

    <AccelerometerViews :a="src.latest ? { x: src.latest[0], y: src.latest[1], z: src.latest[2] } : null" :source="src.source" />


    <CollapsibleCard id="a-mass-on-springs" title="A mass on springs" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">A mass on springs</h2>
      <p class="mb-2">
        Inside an accelerometer chip is a tiny mass hung on springs (in the ADXL345, a polysilicon proof mass on polysilicon springs, over the silicon). Push the chip and the mass lags behind until the springs pull it along: the reading points with the push.
      </p>
      <p class="mb-2">
        <b>Why 1 g up at rest?</b> Sitting still, the springs must hold the mass up against gravity, exactly as hard as if the chip were being pushed upward at 1 g. That is what it reads. <b>Falling freely</b>, nothing has to hold the mass, the springs relax, and it reads 0 g, however fast it falls. An accelerometer can't tell gravity from being pushed: to it they're the same thing.
      </p>
      <SvgDrawing src="/adxl345-mass-springs.svg" alt="Three moments of a mass on springs in a chip: held still the mass sags and it reads 1 g up; pushed to the right (seen from above) the mass lags left and it reads the push to the right; falling, the springs relax and it reads 0 g" class="mx-auto mb-3 w-full max-w-2xl" />
      <p class="mb-2">
        <b>Read by capacitors.</b> Plates on the mass sit between fixed plates: a differential capacitor. Centred, both gaps and both capacitances are equal; when the mass moves, one gap narrows and the other widens. How much tells the size of the acceleration; which side, its direction. A chip has such a sensor for each of its three axes.
      </p>
      <SvgDrawing src="/adxl345-capacitor.svg" alt="A finger on the mass between two fixed plates, C1 and C2: centred, equal gaps, C1 equals C2 and it reads 0; moved toward C1, C1 grows and C2 shrinks: the difference is how much, the bigger one which way" class="mx-auto w-full max-w-2xl" />
    </CollapsibleCard>

    <CollapsibleCard id="tilt-from-gravity" title="Tilt from gravity" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Tilt from gravity</h2>
      <p class="mb-2">
        Held still, the 1 g is shared among the three axes by how the chip is tilted. Flat, it is all on z. Tip the nose up by an angle θ and x reads 1 g × sin θ while z reads 1 g × cos θ: at 30°, x reads 0.5 g. From the shares the tilt comes back: roll and pitch, the way a phone knows which way is up.
      </p>
      <p>
        It works only while the sensor is still: a push adds to gravity and reads as a tilt. And it can't tell the heading (a turn about the vertical changes nothing in how gravity falls on the axes). A gyroscope covers both, which is why phones and drones carry both. Step by step: <RouterLink to="/learn/motion" :class="link">the Motion course</RouterLink>.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Flat and upside down.</b> Lay the board flat: z reads about +1 g, x and y near 0. Turn it over: z reads −1 g. Gravity didn't change; which way the chip faces did.</li>
        <li><b>Find 30°.</b> Raise its nose until x reads 0.5 g: that's 30° (sin 30° = 0.5). Check with a protractor, or a phone's level app.</li>
        <li><b>Drop it.</b> Hold it over a cushion and let go: for that moment |a| falls toward 0 g. In free fall, an accelerometer feels nothing.</li>
        <li><b>Shake and slide.</b> Shake it and |a| jumps past 1 g; slide it across the desk and the push shows on x or y, on top of gravity's share. A push and a tilt look alike to it.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>See also:</b> <RouterLink to="/algorithms/attitude" class="text-emerald-700 underline dark:text-emerald-400">Attitude from accel and gyro</RouterLink>, the two combined.
    </p>
  </main>
</template>
