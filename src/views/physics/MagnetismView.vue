<script setup>
// Physics: magnetism. Earth's field and its dip, how a magnetometer feels
// a field (the HMC5883L's datasheet: permalloy strips, anisotropic
// magneto-resistance, set/reset), a compass from it and declination, the
// board's own field (hard iron); a Live card scanning for any magnetometer,
// the magnetometer's views, and things to try
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import { reactive } from 'vue';
import SvgDrawing from '../../components/SvgDrawing.vue';
import SourceBar from '../../components/SourceBar.vue';
import MagnetometerViews from '../../components/MagnetometerViews.vue';
import { MAGNETOMETERS } from '../../lib/sources.js';
import { useSource } from '../../lib/useSource.js';
import { useHardIron } from '../../lib/useHardIron.js';

const WINDOW_MS = 30000;
const src = reactive(useSource(MAGNETOMETERS));
const cal = reactive(useHardIron(src.onReading, { windowMs: WINDOW_MS }));
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <RouterLink to="/physics" class="text-xs font-medium tracking-wide text-emerald-700 uppercase hover:underline dark:text-emerald-400">Physics</RouterLink>
      <h1 class="text-2xl font-bold">Magnetism and compass</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        The Earth is wrapped in a weak magnetic field, a few tens of microtesla, the same everywhere in a room unless iron or a magnet bends it. A magnetometer chip measures it along three axes; from its level part comes a compass, from the rest the field's dip into the ground.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
    </section>

    <MagnetometerViews :cal="cal" :running="src.state === 'running'" :window-ms="WINDOW_MS" />

    <CollapsibleCard id="earth-s-field-isn-t-level" title="Earth's field isn't level" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Earth's field isn't level</h2>
      <p class="mb-2">
        The Earth behaves roughly like a big bar magnet, its field lines leaving the southern hemisphere and diving back in the northern one. Only near the magnetic equator do they run along the ground. Everywhere else they tilt: in the northern hemisphere the field points north and down into the ground, in the southern north and up, and at the magnetic poles straight down or up. That tilt is the dip, or inclination; across China, for instance, it runs from roughly 30° in the south to 60° in the north.
      </p>
      <SvgDrawing src="/earth-field-dip.svg" alt="Left: Earth with a dipole's field lines; the field at the surface lies level at the magnetic equator (dip 0), dips 49 degrees at 30 degrees north, 74 at 60, and points straight down at the pole, north and down in the northern hemisphere, up in the southern. Right: where you stand, the field B dips below level; its level part, B cos(dip), is what the compass uses, its vertical part, B sin(dip), is read on z of a level board" class="mx-auto mb-3 w-full max-w-2xl" />
      <p>
        Its strength varies too, from about 25 µT over South America to 65 µT near the poles. A fridge magnet is a thousand times stronger close up, which is why one held near the sensor swamps everything.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="resistors-that-feel-a-field" title="Resistors that feel a field" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Resistors that feel a field</h2>
      <p class="mb-2">
        Inside a magnetometer like the HMC5883L, each axis is a bridge of thin strips of permalloy, a nickel-iron alloy, whose resistance changes with a magnetic field along the strip's direction: anisotropic magneto-resistance. A field along the axis unbalances the bridge into a small voltage, which a 12-bit converter reads.
      </p>
      <SvgDrawing src="/hmc5883l-bridge.svg" alt="One axis: a bridge of four permalloy strips from VDD to GND; a field along its axis raises two strips' resistance and lowers the other two, and the bridge's middle shows a small voltage V" class="mx-auto mb-3 w-full max-w-xs" />
      <p>
        <b>Set and reset.</b> Before each reading the chip sends a brief, strong current pulse through a strap beside the strips one way ("set"), measures, pulses it the other way ("reset"), measures again, and reports half the difference. The sensor's own offset, and its drift with temperature, cancel; the pulses also wipe out any magnetism the strips picked up.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="a-compass-and-where-north-is" title="A compass, and where north is" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">A compass, and where north is</h2>
      <p class="mb-2">
        Held level, the part of the field along the ground points to magnetic north: the heading is the angle from the board's nose (x) to it, the compass rose above. Tilted, some of the vertical field leaks into x and y and the heading drifts; an accelerometer telling the tilt fixes that (see <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink>, and sensor fusion in <RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink>).
      </p>
      <p>
        Magnetic north isn't true north: the gap, the declination, depends on where you are and creeps year by year as the field moves. Your own declination and dip are on NOAA's <a href="https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml" :class="link">magnetic field calculator</a>; compare its dip with the one measured above, once calibrated.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="the-board-s-own-field" title="The board's own field" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">The board's own field</h2>
      <p>
        Screws, pin headers, a battery, magnetised a little, ride along with the sensor and add their own field: the same, in the board's axes, whichever way it turns. That's hard iron. Turned all the way round, each axis then swings from its least to its most around a middle that isn't zero; the middle is the hard iron, and Calibrate takes it off. Nearby iron that only bends Earth's field (soft iron) stretches those swings unevenly instead, and needs more than an offset to correct.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="try-this" title="Try this" class="leading-relaxed">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Calibrate.</b> Press Start in the Calibrate card, turn the board slowly round flat, then over and round again, so each axis sees its least and its most; press Done. The span table shows each axis's swing, about twice the field along it.</li>
        <li><b>Find north.</b> Hold it level and turn until the heading reads 0: x points to magnetic north. Check it against a phone's compass, set to magnetic north.</li>
        <li><b>Measure your dip.</b> Calibrated and level, read the dip; look up yours on NOAA's calculator. Tip the board until x points along the field: |B| all lands on x.</li>
        <li><b>Bring iron near.</b> Move a screwdriver, a phone or a magnet toward it and watch the field bend; see how far away it must be before the heading stops moving.</li>
      </ol>
    </CollapsibleCard>
  </main>
</template>
