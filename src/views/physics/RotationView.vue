<script setup>
// Physics: rotation. Angular velocity and its sign (the right-hand rule),
// how a MEMS gyro feels a turn (the ITG-3200's datasheet, 5.3: a vibratory
// mass, the Coriolis effect, a capacitive pickoff), from rate to angle and
// its drift; a Live card scanning for any gyroscope, the gyro's views, and
// things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import { reactive, computed } from 'vue';
import SvgDrawing from '../../components/SvgDrawing.vue';
import SourceBar from '../../components/SourceBar.vue';
import GyroViews from '../../components/GyroViews.vue';
import { GYROSCOPES } from '../../lib/sources.js';
import { useSource } from '../../lib/useSource.js';
import { useTurned } from '../../lib/useTurned.js';

const src = reactive(useSource(GYROSCOPES));
const turned = reactive(useTurned(src.onReading));
const g = computed(() => (src.latest ? { x: src.latest[0], y: src.latest[1], z: src.latest[2] } : null));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Rotation and gyroscope</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        How fast something turns: its angular velocity, in degrees a second. A gyroscope chip measures it about three axes at once, with no spinning wheel inside, just a tiny mass kept shaking. Added up, the rates tell how far it has turned, for a while.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
    </section>

    <GyroViews :g="g" :turned="turned" :source="src.source" :running="src.state === 'running'" />

    <CollapsibleCard id="angular-velocity-and-which-way-is-positi" title="Angular velocity, and which way is positive" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Angular velocity, and which way is positive</h2>
      <p class="mb-2">
        A turn has a size and an axis. Its size is a rate, degrees a second (360 °/s is a turn a second, 60 rpm); its axis is the line it turns about. A 3-axis gyro splits any turn into three: about x, about y and about z, each measured on its own.
      </p>
      <p>
        <b>The sign: the right-hand rule.</b> Point your right thumb along an axis's arrow; your fingers curl the positive way. Flat on a desk with z up, a turn anticlockwise seen from above is a positive rate about z. The gyro ball above marks each ring's positive way with a small arrow, and its big arrow points along the axis the board is spinning about, by the same rule.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="a-mass-kept-shaking" title="A mass kept shaking" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">A mass kept shaking</h2>
      <p class="mb-2">
        Inside a MEMS gyro (in the ITG-3200, one for each axis) a tiny mass is driven back and forth, all the time. Not turning, it stays on its line. Turning, the Coriolis effect pushes it sideways, across its swing: F = 2 m v × Ω, flipping with each swing and growing with the rate of turn. Plates beside it feel the push as a change in capacitance; the chip amplifies that, demodulates it against the drive, and turns it into a number proportional to the rate.
      </p>
      <SvgDrawing src="/itg3200-coriolis.svg" alt="Two panels: not turning, a mass driven back and forth between springs stays on its line and the sense plates above and below see equal gaps; turning, the Coriolis effect pushes it sideways toward a plate, flipping with each swing" class="mx-auto w-full max-w-2xl" />
    </CollapsibleCard>

    <CollapsibleCard id="from-rate-to-angle-and-the-drift" title="From rate to angle, and the drift" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">From rate to angle, and the drift</h2>
      <p class="mb-2">
        A gyro tells how fast, not where. Add up each reading times the time since the last and you get how far it has turned: that's "Turned so far" above. But every gyro reads a little even when still (its zero-rate bias), and that is added up too, second after second: the angle creeps away. Zeroing takes most of it off; what is left still drifts, more as the chip warms or cools.
      </p>
      <p>
        So a gyro alone can't keep an orientation for long. Phones and drones pair it with an accelerometer, which knows which way is down (see <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink>), and a compass for north; combining them is sensor fusion (<RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink>). And the Earth itself turns, 15° an hour (0.004 °/s): far below what such a chip can tell from its own offset. Navigation gyros, ring-laser or fibre-optic, do feel it, and find true north by it.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Find the positive way.</b> Lay the board flat and turn it slowly anticlockwise, seen from above: the rate about z goes positive. Clockwise, negative. Check it with your right hand.</li>
        <li><b>A quarter turn.</b> Hold it still, press Zero, then Reset. Turn it a quarter turn about z and stop: "about z" in Turned so far should read close to 90°. Turn it back: close to 0°.</li>
        <li><b>Watch it drift.</b> Leave it still for a minute without zeroing, then with: see how far the angles creep each way.</li>
        <li><b>Spin it.</b> Lay it flat and give it a spin, wires permitting: the rate about z jumps; divide by 6 for revolutions a minute.</li>
      </ol>
    </CollapsibleCard>
    <p class="text-sm">
      <b>See also:</b> <RouterLink to="/algorithms/attitude" class="text-emerald-700 underline dark:text-emerald-400">Attitude from accel and gyro</RouterLink>, the two combined.
    </p>
  </main>
</template>
