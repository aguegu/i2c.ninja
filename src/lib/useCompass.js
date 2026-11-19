// The compass, each reading, for a page: from its useSources() (accel and
// mag) and its useHardIron() (the offset taken off the field), the
// level-only and the tilt-compensated heading (lib/compass.js), the tilt and
// the dip, each kept for a chart (the last windowMs); and the latest
// reading's numbers, every step, for a page to show the calculation.
// Headings wrap at 0/360: on the chart the compensated one runs on, unwrapped,
// and the level-only one is drawn within half a turn of it, so the gap
// between the two lines is how far apart they read.
import { perFrame } from './frame.js';
import { ref, onBeforeUnmount } from 'vue';
import { makeSeries } from './series.js';
import { compass, levelHeading, apart } from './compass.js';
import { rollOf, pitchOf } from './tilt.js';

export function useCompass(src, cal, { windowMs = 30000 } = {}) {
  const latest = ref(null); // { a, raw, offset, b, level, c (compass()'s), roll, pitch }
  const publish = perFrame((v) => { latest.value = v; }); // once a frame, the newest
  const headings = makeSeries(2, windowMs); // level-only, compensated (deg, unwrapped)
  const tilts = makeSeries(2, windowMs); // roll, pitch (deg)
  const dips = makeSeries(1, windowMs); // the dip (deg)
  let run = null; // the compensated heading, unwrapped: continuous across north

  const off = src.onReading((t, v) => {
    const a = v.accel;
    const raw = v.mag;
    if (!a || !raw || raw.some((c) => c === null || Number.isNaN(c))) return;
    const o = cal.offset;
    const b = [raw[0] - o.x, raw[1] - o.y, raw[2] - o.z];
    const level = levelHeading(b);
    const c = compass(a, b);
    const roll = rollOf(...a);
    const pitch = pitchOf(...a);
    if (c.heading !== null) {
      run = run === null ? c.heading : run + apart(c.heading, run);
      headings.push(t, [run + apart(level, c.heading), run]);
    }
    tilts.push(t, [roll, pitch]);
    if (c.dip !== null) dips.push(t, [c.dip]);
    publish.push({ a, raw, offset: { ...o }, b, level, c, roll, pitch });
  });
  onBeforeUnmount(off);

  return { latest, headingSource: headings.source, tiltSource: tilts.source, dipSource: dips.source };
}
