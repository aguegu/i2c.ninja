// A magnetometer's readings with the board's own field ("hard iron") taken
// off: calibrating, turned round, each axis's smallest and largest kept;
// done, their middle is the offset, taken off every reading from then on.
// Fed by any stream of readings: subscribe(fn(t ms, [x, y, z] uT)) ->
// unsubscribe (an axis that overflowed: null, the reading skipped). Keeps
// the calibrated readings for a chart (the last windowMs).
import { ref, onBeforeUnmount } from 'vue';
import { makeSeries } from './series.js';

const AXES = ['x', 'y', 'z'];

export function useHardIron(subscribe, { windowMs = 30000 } = {}) {
  const latest = ref(null); // { x, y, z } uT, the offset taken off
  const offset = ref({ x: 0, y: 0, z: 0 }); // uT
  const calibrating = ref(false);
  const calibrated = ref(false);
  const span = ref(null); // while calibrating: { min: {x,y,z}, max: {x,y,z} }
  const series = makeSeries(3, windowMs);

  const off = subscribe((t, v) => {
    if (!v || v.some((c) => c === null || Number.isNaN(c))) return;
    const m = { x: v[0], y: v[1], z: v[2] };
    if (calibrating.value) {
      const s = span.value ?? { min: { ...m }, max: { ...m } };
      for (const k of AXES) { s.min[k] = Math.min(s.min[k], m[k]); s.max[k] = Math.max(s.max[k], m[k]); }
      span.value = { min: { ...s.min }, max: { ...s.max } };
    }
    const c = Object.fromEntries(AXES.map((k) => [k, m[k] - offset.value[k]]));
    latest.value = c;
    series.push(t, [c.x, c.y, c.z]);
  });
  onBeforeUnmount(off);

  function start() {
    span.value = null;
    calibrating.value = true;
  }

  // the middle of each axis's extremes: the board's own field, taken off
  function finish() {
    calibrating.value = false;
    const s = span.value;
    if (!s) return;
    offset.value = Object.fromEntries(AXES.map((k) => [k, (s.min[k] + s.max[k]) / 2]));
    calibrated.value = true;
  }

  function clear() {
    calibrating.value = false;
    span.value = null;
    offset.value = { x: 0, y: 0, z: 0 };
    calibrated.value = false;
  }

  return { latest, offset, calibrating, calibrated, span, source: series.source, start, finish, clear };
}
