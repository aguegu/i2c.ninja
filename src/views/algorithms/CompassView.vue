<script setup>
// Algorithm: a tilt-compensated compass. A magnetometer alone gives a heading
// only held level; an accelerometer's gravity gives the vertical, the
// field's vertical part is taken off, and its level part points to north
// whatever the tilt (lib/compass.js). A Live card scanning for an
// accelerometer and a magnetometer (one module, a BMX055, or two boards), the
// hard iron calibrated, the level-only and the compensated heading side by
// side with the tilt and the dip; why a tilted compass lies, the maths, when
// it can't work, one set of axes, things to try
import HardIronGauge from '../../components/HardIronGauge.vue';
import { reactive, computed, ref, onBeforeUnmount } from 'vue';
import SourceBar from '../../components/SourceBar.vue';
import CollapsibleCard from '../../components/CollapsibleCard.vue';
import LiveChart from '../../components/LiveChart.vue';
import InfoTip from '../../components/InfoTip.vue';
import HintNote from '../../components/HintNote.vue';
import CompassRose from '../../components/CompassRose.vue';
import CompassScene from '../../components/CompassScene.vue';
import TexMath from '../../components/TexMath.vue';
import { ACCELEROMETERS, MAGNETOMETERS } from '../../lib/sources.js';
import { useSources } from '../../lib/useSources.js';
import { useHardIron } from '../../lib/useHardIron.js';
import { compass, levelHeading, apart } from '../../lib/compass.js';
import { rollOf, pitchOf } from '../../lib/tilt.js';
import { useCompass } from '../../lib/useCompass.js';

const WINDOW_MS = 30000;
const src = reactive(useSources({ accel: ACCELEROMETERS, mag: MAGNETOMETERS }, { windowMs: WINDOW_MS }));
const cal = reactive(useHardIron((fn) => src.onReading((t, v) => fn(t, v.mag)), { windowMs: WINDOW_MS }));
const running = computed(() => src.state === 'running');
const live = reactive(useCompass(src, cal, { windowMs: WINDOW_MS }));

const up = computed(() => src.latest?.accel ?? null);
const field = computed(() => (cal.latest ? [cal.latest.x, cal.latest.y, cal.latest.z] : null));
const level = computed(() => (field.value ? levelHeading(field.value) : null));
const comp = computed(() => (up.value && field.value ? compass(up.value, field.value) : null));
const roll = computed(() => (up.value ? rollOf(...up.value) : null));
const pitch = computed(() => (up.value ? pitchOf(...up.value) : null));
const apartBy = computed(() => (level.value === null || comp.value?.heading == null ? null : Math.abs(apart(level.value, comp.value.heading))));
const fmt = (v, d = 0) => (v === undefined || v === null ? '—' : v.toFixed(d));

// the charts: each heading two ways, the tilt, the dip
const HEADINGS = [{ label: 'ψ', sub: 'level', color: '--series-2' }, { label: 'ψ', color: '--series-3' }];
const TILTS = [{ label: 'φ', color: '--series-1' }, { label: 'θ', color: '--series-2' }];
const DIPS = [{ label: 'δ', color: '--series-magnitude' }];
const HEADING_SPAN_DEG = 60; // the heading chart's least span
const TILT_FLOOR_DEG = 45; // the tilt chart's least half-range
const DIP_SPAN_DEG = 10; // the dip chart's least span: a steady dip shows flat

// the numbers card: the latest reading's, taken a few times a second so they
// can be read; each value's cell keeps its widest so far (a monospaced font),
// so a growing digit or sign doesn't shift the rows
const NUMBERS_MS = 250;
const snap = ref(null);
const timer = setInterval(() => { snap.value = live.latest; }, NUMBERS_MS);
onBeforeUnmount(() => clearInterval(timer));
const widths = new Map();
const widest = (key, text) => { const w = Math.max(widths.get(key) ?? 0, [...text].length); widths.set(key, w); return w; };
const num = (v, d = 3) => (v === undefined || v === null ? '—' : v.toFixed(d));
const sgn = (v, d = 1) => (v === undefined || v === null ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d));
const vec = (v, d = 3) => (v ? `(${v.map((c) => num(c, d)).join(', ')})` : '—');
const blocks = computed(() => {
  const u = snap.value;
  const c = u?.c;
  const o = u?.offset;
  return [
    { title: 'From the sensors, every reading', rows: [
      { tex: String.raw`\mathbf{a} = (a_x,\ a_y,\ a_z) =`, value: `${vec(u?.a, 3)} g`, term: 'the accelerometer', note: 'The accelerometer\'s reading, in g, along the board\'s x, y and z: at rest, about 1 g up' },
      { tex: String.raw`\mathbf{B}_{\text{raw}} =`, value: `${vec(u?.raw, 1)} µT`, term: 'the magnetometer', note: 'The magnetometer\'s reading, in microtesla, in the same axes (a BMX055\'s turned into its accelerometer\'s first): Earth\'s field plus the board\'s own' },
      { tex: String.raw`\mathbf{B}_0 =`, value: `${vec(o ? [o.x, o.y, o.z] : null, 1)} µT`, term: 'Calibrate\'s offset', note: cal.calibrated ? 'The board\'s own field (hard iron): the middle of each axis\'s swing while you turned it round, taken off every reading since' : 'The board\'s own field (hard iron): not measured yet, so 0. Press Calibrate and turn the board every way round' },
      { tex: String.raw`\mathbf{B} = \mathbf{B}_{\text{raw}} - \mathbf{B}_0 =`, value: `${vec(u?.b, 1)} µT`, term: 'the field', note: 'Earth\'s field alone, in the board\'s axes: what the rest is worked out from' },
    ] },
    { title: 'Level only: the board taken as flat', rows: [
      { tex: String.raw`\psi_{\text{level}} = \operatorname{atan2}(B_y,\ B_x) =`, value: `${num(u?.level, 1)}°`, term: 'level-only heading', note: 'The heading as if the board lay flat: right when it does, off by more than the tilt when it doesn\'t' },
    ] },
    { title: 'Up, from gravity', rows: [
      { tex: String.raw`\hat{\mathbf{u}} = \mathbf{a} \,/\, |\mathbf{a}| =`, value: vec(c?.U, 3), term: 'up', note: 'Up in the board\'s axes: the accelerometer\'s reading, only its direction kept. Right while the board is still: a push reads as a tilt' },
      { tex: String.raw`\varphi = \operatorname{atan2}(a_y,\ a_z),\ \ \theta = \operatorname{atan2}\!\left(a_x,\ \sqrt{a_y^2 + a_z^2}\right) =`, value: `${sgn(u?.roll)}°, ${sgn(u?.pitch)}°`, wide: true, term: 'the tilt', note: 'Roll and pitch, for reference: the compass doesn\'t need them, û does the levelling' },
    ] },
    { title: 'The field, levelled', rows: [
      { tex: String.raw`\mathbf{B}\cdot\hat{\mathbf{u}} =`, value: `${sgn(c?.vertical, 1)} µT`, term: 'its vertical part', note: 'The field along up: negative where it dips into the ground (the northern hemisphere)' },
      { tex: String.raw`\mathbf{B}_h = \mathbf{B} - (\mathbf{B}\cdot\hat{\mathbf{u}})\,\hat{\mathbf{u}} =`, value: `${vec(c?.flat, 1)} µT`, term: 'its level part', note: 'The field with its vertical part taken off: it lies level and points to magnetic north, however the board is tilted' },
      { tex: String.raw`|\mathbf{B}_h| =`, value: `${num(c?.level, 1)} µT`, term: 'how strong, level', note: 'The level part\'s strength: what a compass needle feels. Near the magnetic poles it gets small and the heading noisy' },
      { tex: String.raw`\mathbf{x}_h = \hat{\mathbf{x}} - (\hat{\mathbf{x}}\cdot\hat{\mathbf{u}})\,\hat{\mathbf{u}} =`, value: vec(c?.nose, 3), term: 'the nose laid level', note: 'The board\'s nose, x, with its vertical part taken off: the direction the board faces, on the ground' },
    ] },
    { title: 'North, east, and the heading', rows: [
      { tex: String.raw`\hat{\mathbf{n}} = \mathbf{B}_h \,/\, |\mathbf{B}_h| =`, value: vec(c?.north, 3), term: 'north', note: 'Magnetic north, level, as a unit direction in the board\'s axes' },
      { tex: String.raw`\hat{\mathbf{e}} = \hat{\mathbf{n}} \times \hat{\mathbf{u}} =`, value: vec(c?.east, 3), term: 'east', note: 'East: a quarter turn clockwise from north about up, seen from above' },
      { tex: String.raw`\psi = \operatorname{atan2}(\mathbf{x}_h\cdot\hat{\mathbf{e}},\ \mathbf{x}_h\cdot\hat{\mathbf{n}}) =`, value: `${num(c?.heading, 1)}°`, term: 'the heading', note: 'The nose\'s angle from magnetic north, clockwise seen from above: the tilt-compensated heading' },
      { tex: String.raw`\delta = \operatorname{atan2}(-\mathbf{B}\cdot\hat{\mathbf{u}},\ |\mathbf{B}_h|) =`, value: `${sgn(c?.dip, 1)}°`, term: 'the dip', note: 'The field\'s angle below level: where you are, not how the board is held. It should stay put as you tilt' },
      { tex: String.raw`\psi_{\text{level}} - \psi =`, value: u && c?.heading != null ? `${sgn(apart(u.level, c.heading), 1)}°` : '—', term: 'how far apart', note: 'The level-only heading\'s error: about 0 held level, more than the tilt when tipped sideways' },
    ] },
  ];
});
const formula = 'grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm leading-6 whitespace-nowrap dark:bg-slate-900';
const valueClass = 'text-emerald-700 dark:text-emerald-400';

const LEVEL = String.raw`\psi_{\text{level}} = \operatorname{atan2}(B_y,\ B_x)`;
const UP = String.raw`\hat{\mathbf{u}} = \frac{\mathbf{a}}{|\mathbf{a}|}, \qquad \mathbf{B}_h = \mathbf{B} - (\mathbf{B}\cdot\hat{\mathbf{u}})\,\hat{\mathbf{u}}, \qquad \mathbf{x}_h = \hat{\mathbf{x}} - (\hat{\mathbf{x}}\cdot\hat{\mathbf{u}})\,\hat{\mathbf{u}}`;
const NORTH = String.raw`\hat{\mathbf{n}} = \frac{\mathbf{B}_h}{|\mathbf{B}_h|}, \qquad \hat{\mathbf{e}} = \hat{\mathbf{n}} \times \hat{\mathbf{u}}, \qquad \psi = \operatorname{atan2}(\mathbf{x}_h\cdot\hat{\mathbf{e}},\ \mathbf{x}_h\cdot\hat{\mathbf{n}}), \qquad \delta = \operatorname{atan2}(-\mathbf{B}\cdot\hat{\mathbf{u}},\ |\mathbf{B}_h|)`;
const BMX055_AXES = String.raw`\mathbf{B}_{\text{board}} = (-B_y,\ B_x,\ B_z)_{\text{magnetometer}}`;

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const link = 'text-emerald-700 underline dark:text-emerald-400';
const button = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700';
const WIKI = 'https://en.wikipedia.org/wiki/';
const READING = [
  { href: `${WIKI}Magnetic_dip`, title: 'Magnetic dip', note: 'Wikipedia: the field\'s angle below level, δ' },
  { href: `${WIKI}Magnetic_declination`, title: 'Magnetic declination', note: 'Wikipedia: magnetic north against true north' },
  { href: 'https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml', title: 'NOAA\'s magnetic field calculator', note: 'your own dip and declination' },
  { href: `${WIKI}Vector_projection`, title: 'Vector projection', note: 'Wikipedia: taking a vector\'s part along a direction off, as B_h' },
  { href: `${WIKI}Atan2`, title: 'atan2', note: 'Wikipedia: the angle from two numbers, ψ and δ' },
  { href: `${WIKI}Attitude_and_heading_reference_system`, title: 'Attitude and heading reference system', note: 'Wikipedia: a compass fused with a gyro and an accelerometer' },
];
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">Algorithm</p>
      <h1 class="text-2xl font-bold">A tilt-compensated compass</h1>
      <p class="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
        A magnetometer gives a heading only while it's held level: tip it and part of Earth's steeply dipping field leaks into its x and y, and the heading swings. An accelerometer knows which way is down; with it, the field's vertical part is taken off and what's left, its level part, points to magnetic north however the board is tilted. On one module that has both (a BMX055) or two boards side by side.
      </p>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Combines <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink> + <RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink>.
      </p>
    </div>

    <section :class="card">
      <SourceBar :src="src" />
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button v-if="!cal.calibrating" :class="button" :disabled="!running" @click="cal.start">{{ cal.calibrated ? 'Calibrate again' : 'Calibrate' }}</button>
        <button v-else class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700" @click="cal.finish">Done</button>
        <button v-if="cal.calibrated" class="text-sm text-slate-500 underline dark:text-slate-400" @click="cal.clear">Clear</button>
        <HintNote>Press Calibrate, turn the board slowly all the way round, flat, then on its edges and upside down, and press Done: the board's own field (hard iron) is taken off. Without it the heading is off, both of them.</HintNote>
      </div>
      <HardIronGauge v-if="cal.calibrating" :span="cal.span" />
      <HintNote v-if="src.apart" class="mt-3">
        Two boards: line them up so their printed x, y and z arrows point the same ways, and fix them together. The compass takes them as one board; an axis turned the other way is a wrong heading.
      </HintNote>
    </section>

    <section :class="card">
      <div class="grid gap-6 sm:grid-cols-2">
        <figure class="flex flex-col items-center gap-2">
          <figcaption class="text-sm font-semibold">Level only (tilt ignored)</figcaption>
          <CompassRose :heading="level" size="h-48 w-48" />
          <p class="font-mono text-lg tabular-nums">{{ fmt(level) }}°</p>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <figcaption class="text-sm font-semibold">Tilt-compensated</figcaption>
          <CompassRose :heading="comp?.heading ?? null" size="h-48 w-48" />
          <p class="font-mono text-lg tabular-nums">{{ fmt(comp?.heading) }}°</p>
        </figure>
      </div>
      <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm tabular-nums sm:grid-cols-4">
        <div><dt class="text-slate-500 dark:text-slate-400">roll φ</dt><dd>{{ fmt(roll) }}°</dd></div>
        <div><dt class="text-slate-500 dark:text-slate-400">pitch θ</dt><dd>{{ fmt(pitch) }}°</dd></div>
        <div><dt class="text-slate-500 dark:text-slate-400">dip δ</dt><dd>{{ fmt(comp?.dip, 1) }}°</dd></div>
        <div><dt class="text-slate-500 dark:text-slate-400">apart</dt><dd>{{ fmt(apartBy) }}°</dd></div>
      </dl>
      <p class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Held level the two agree. Tip the board and the left one swings while the right one holds; "apart" is how far they disagree. The dip, the field's angle below level, should stay put however you hold it{{ cal.calibrated ? '' : ' (once calibrated)' }}: it's a property of where you are, not of the board.
      </p>
    </section>

    <CollapsibleCard id="in-3d" title="In 3D: the board in the room">
      <h2 class="mb-2 text-lg font-semibold">In 3D: the board in the room</h2>
      <CompassScene class="mx-auto" :steps="live.latest?.c ?? null" :b="live.latest?.b ?? null" />
      <p class="mt-3 text-sm leading-relaxed">
        The room stays put, the floor marked with magnetic north, east, south and west; the board is drawn as you hold it. <b class="text-[var(--series-magnitude)]">Violet</b>: the field B, dipping δ into the floor, and its level part B<sub>h</sub> along the floor to north; the dotted drop between their tips is the field's vertical part. <b class="text-[var(--series-2)]">Orange</b>: the field as the board's own plane sees it, what the level-only heading uses: on north while the board lies flat, swung off it once the board tilts. <b class="text-[var(--series-3)]">Green</b>: the nose laid level, x<sub>h</sub>, and the heading ψ from north to it, clockwise seen from above.
      </p>
    </CollapsibleCard>

    <CollapsibleCard id="numbers" title="The numbers, and what's done with them" class="live-view">
      <h2 class="mb-2 text-lg font-semibold">The numbers, and what's done with them</h2>
      <div class="flex flex-col gap-3">
        <div v-for="blk in blocks" :key="blk.title">
          <p class="mb-1 text-sm font-semibold">{{ blk.title }}</p>
          <div :class="formula">
            <template v-for="r in blk.rows" :key="r.tex">
              <span v-if="r.wide" class="col-span-2"><TexMath :expr="r.tex" /> <span class="inline-block" :class="valueClass" :style="{ minWidth: `${widest(r.tex, r.value)}ch` }">{{ r.value }}</span></span>
              <template v-else>
                <TexMath :expr="r.tex" /><span :class="valueClass" :style="{ minWidth: `${widest(r.tex, r.value)}ch` }">{{ r.value }}</span>
              </template>
              <InfoTip :text="r.note" class="cursor-help justify-self-end text-right font-sans text-xs text-slate-500 underline decoration-dotted underline-offset-2 dark:text-slate-400">{{ r.term }}</InfoTip>
            </template>
          </div>
        </div>
      </div>
    </CollapsibleCard>

    <CollapsibleCard id="heading" title="ψ, the heading two ways">
      <LiveChart title="ψ, the heading two ways" unit="°" :series="HEADINGS" :values="live.latest && live.latest.c.heading !== null ? [live.latest.level, live.latest.c.heading] : []" :source="live.headingSource" :window-ms="WINDOW_MS" :floor="HEADING_SPAN_DEG" :digits="0" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Level, the two lines lie on one another; tip the board and they part, the gap the level-only heading's error. Past north the lines run on (370° is 10°) instead of jumping back; the legend reads as a compass does.
      </p>
    </CollapsibleCard>
    <CollapsibleCard id="tilt" title="φ and θ, the tilt">
      <LiveChart title="φ and θ, the tilt" unit="°" :series="TILTS" :values="live.latest ? [live.latest.roll, live.latest.pitch] : []" :source="live.tiltSource" :window-ms="WINDOW_MS" :floor="TILT_FLOOR_DEG" :digits="1" />
    </CollapsibleCard>
    <CollapsibleCard id="dip" title="δ, the dip">
      <LiveChart title="δ, the dip" unit="°" :series="DIPS" :values="live.latest && live.latest.c.dip !== null ? [live.latest.c.dip] : []" :source="live.dipSource" :window-ms="WINDOW_MS" :floor="DIP_SPAN_DEG" :digits="1" fit />
      <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The dip belongs to the place, not the board: calibrated, it stays flat however the board is tilted or turned. A line that moves with the tilt means the calibration, or the axes, are off.
      </p>
    </CollapsibleCard>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Why a tilted compass lies</h2>
      <p class="mb-2">
        Held level, the field's level part lies along the board's x and y, so the heading is just the angle in that plane, the one the <RouterLink to="/physics/magnetism" :class="link">magnetometer pages</RouterLink> read:
      </p>
      <TexMath class="mb-2 block" display :expr="LEVEL" />
      <p>
        But Earth's field isn't level: across China it dips 30° to 60° into the ground, so its vertical part is as large as its level part or larger. Tip the board and some of that vertical part lands on x and y and reads as a turn. Facing north with the field dipping 55°, tipping the board 10° sideways moves the level-only heading by about 14°: more than the tilt itself.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Levelling the field with gravity</h2>
      <p class="mb-2">
        A still accelerometer reads up, a (see <RouterLink to="/physics/acceleration" :class="link">Acceleration and gravity</RouterLink>), in the same axes as the field B. Its direction is the vertical, û. Take the field's part along û off, and what's left, B<sub>h</sub>, is the field's level part; do the same to the board's nose, x̂, and x<sub>h</sub> is the nose laid level:
      </p>
      <TexMath class="mb-2 block" display :expr="UP" />
      <p class="mb-2">
        B<sub>h</sub> points to magnetic north, n̂; east, ê, is a quarter turn round from it about up. The heading ψ is the nose's angle from north, clockwise seen from above; the dip δ comes out on the way, the field's vertical part against its level part:
      </p>
      <TexMath class="mb-2 block" display :expr="NORTH" />
      <p>
        No angles of roll and pitch are needed: the vectors do the turning. Level (û along z) it gives back ψ<sub>level</sub> exactly.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">When it can't work</h2>
      <ul class="list-disc space-y-2 pl-5">
        <li><b>A push.</b> The accelerometer can't tell gravity from a push: while the board moves, û is wrong and so is the heading. Held still, or moving smoothly, it's right; a gyro fused in keeps it right through shakes (<RouterLink to="/algorithms/attitude" :class="link">Attitude from accel and gyro</RouterLink> does that for roll and pitch).</li>
        <li><b>The nose straight up or down.</b> Laid level the nose is nothing: no heading to speak of. Near it, the heading turns quickly with small moves.</li>
        <li><b>Iron nearby, or not calibrated.</b> The board's own field (hard iron) and nearby steel bend the field it reads; calibrate, and keep it away from laptops, magnets and steel tables. A heading that only rocks back and forth as you turn the board, never going round, is a board whose own field outweighs Earth's level part (a BMX055 module's can be twice it): calibrated, it goes round.</li>
        <li><b>Magnetic north isn't true north.</b> The gap, the declination, depends on where you are; <a href="https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml" :class="link">NOAA's calculator</a> gives yours, and your dip to compare with δ above.</li>
      </ul>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">One set of axes</h2>
      <p class="mb-2">
        The formulas take a and B in the same axes. On two boards that's up to you: line their printed arrows up. Inside a BMX055 it's Bosch's choice, and they turned the magnetometer a quarter turn against the accelerometer and gyro: its datasheet (Figure 41) has the accelerometer's x along the magnetometer's −y, its y along the magnetometer's x. So this site turns the field back before using it:
      </p>
      <TexMath class="mb-2 block" display :expr="BMX055_AXES" />
      <p>
        Left unturned, the module still reads a field of the right strength, but its heading is off by a quarter turn and its dip is wrong, and both change as it tilts: the check above (a dip that stays put) is how you'd find out.
      </p>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol class="list-decimal space-y-2 pl-5">
        <li><b>Calibrate.</b> Press Calibrate and turn the board slowly every way round, then Done.</li>
        <li><b>Hold it level, face north.</b> Turn until both read 0. Check against a phone's compass, set to magnetic north.</li>
        <li><b>Tip it sideways, still facing north.</b> The level-only heading swings by more than the tilt; the compensated one stays near 0. Then tip it nose up a little: facing north, that one hardly moves either. Why? (Hint: which axis does the vertical field leak into?)</li>
        <li><b>Measure your dip.</b> Read δ held level, on its edge, upside down: about the same each time (within a few degrees, calibrated well). Compare with NOAA's figure for where you are.</li>
        <li><b>Shake it.</b> The compensated heading jumps: the accelerometer took the push for gravity. Hold still and it settles.</li>
      </ol>
    </section>

    <section :class="[card, 'leading-relaxed']">
      <h2 class="mb-2 text-lg font-semibold">More to read</h2>
      <ul class="space-y-1 text-sm">
        <li v-for="r in READING" :key="r.href">
          <a :href="r.href" :class="link">{{ r.title }}</a>
          <span class="text-slate-500 dark:text-slate-400"> · {{ r.note }}</span>
        </li>
        <li><RouterLink to="/physics/magnetism" :class="link">Magnetism and compass</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the field and its dip, on its own</span></li>
        <li><RouterLink to="/bmx055" :class="link">BMX055</RouterLink><span class="text-slate-500 dark:text-slate-400"> · the module with all three: accelerometer, gyro, magnetometer</span></li>
      </ul>
    </section>
  </main>
</template>
