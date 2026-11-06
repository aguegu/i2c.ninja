// Accelerometer and gyro fused into an attitude, by Mahony's filter (lib/
// fusion.js), with each sensor's own idea of roll and pitch alongside to
// compare: gravity's tilt, and the gyro alone added up from where gravity
// put it. Fed by any stream: subscribe(fn(t ms, accel [x y z] g, gyro
// [x y z] deg/s)) -> unsubscribe. zero(): the gyro held still ZERO_MS, its
// average (b0) taken off every reading from then on, and the filter started
// again. The last windowMs of roll and pitch, three ways each, and yaw two
// ways, kept for charts.
import { ref, onBeforeUnmount } from 'vue';
import { Mahony } from './fusion.js';
import { rollOf, pitchOf } from './tilt.js';
import { makeSeries } from './series.js';

const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated
const ZERO_MS = 2000; // held still this long to measure b0, as the gyro pages' Zero

// an angle in -180..180, as the fused yaw
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

export function useFusion(subscribe, { windowMs = 10000 } = {}) {
  const mahony = new Mahony();
  const input = ref(null); // the latest reading: { accel [x y z] g, gyro [x y z] deg/s, dt s }
  const fused = ref(null); // { q, held: { q, up } from the reading before (up: the room's z in the board's axes), roll, pitch, yaw } degrees
  const gravity = ref(null); // { roll, pitch }
  const gyroAlone = ref(null); // { roll, pitch, yaw }
  const b0 = ref([0, 0, 0]); // deg/s, Zero's offset, taken off the gyro
  const zeroing = ref(false);
  const zeroed = ref(false);
  let sum = null; // while zeroing: { v [x y z], n, since }
  const learned = ref(null); // the gyro offset Mahony's integral learned, deg/s [x y z]
  const rollSeries = makeSeries(3, windowMs); // gravity's, the gyro alone, fused: the formulas' order
  const pitchSeries = makeSeries(3, windowMs);
  const yawSeries = makeSeries(2, windowMs); // the gyro alone, fused: gravity can't see yaw
  let lastT = null;
  let alone = null;

  const off = subscribe((t, accel, raw) => {
    if (zeroing.value) {
      sum ??= { v: [0, 0, 0], n: 0, since: t };
      sum.v = sum.v.map((s, k) => s + raw[k]);
      sum.n++;
      if (t - sum.since >= ZERO_MS) {
        b0.value = sum.v.map((s) => s / sum.n);
        zeroing.value = false;
        zeroed.value = true;
        sum = null;
        restart();
        return;
      }
    }
    const gyro = raw.map((g, k) => g - b0.value[k]);
    const dt = lastT === null ? 0 : (t - lastT) / 1000;
    lastT = t;
    const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
    // the attitude held from the reading before, and its up: what this reading is compared with
    const held = mahony.q ? { q: mahony.q, up: mahony.up() } : null;
    mahony.update(accel, gyro, step);
    const g = { roll: rollOf(...accel), pitch: pitchOf(...accel) };
    if (!alone) alone = { ...g, yaw: 0 };
    alone.roll += gyro[0] * step; // roll turns about +x
    alone.pitch -= gyro[1] * step; // nose up is about -y
    alone.yaw = wrap180(alone.yaw - gyro[2] * step); // turning right is about -z
    const m = mahony.angles();
    input.value = { accel, gyro, dt: step };
    fused.value = { q: mahony.q, held, ...m };
    gravity.value = g;
    gyroAlone.value = { ...alone };
    learned.value = mahony.learnedOffset();
    rollSeries.push(t, [g.roll, alone.roll, m.roll]);
    pitchSeries.push(t, [g.pitch, alone.pitch, m.pitch]);
    yawSeries.push(t, [alone.yaw, m.yaw]);
  });
  onBeforeUnmount(off);

  // start again: level by gravity, heading 0 (the nose's way now)
  function restart() {
    mahony.q = null;
    mahony.integral = [0, 0, 0];
    lastT = null;
    alone = null;
    rollSeries.clear();
    pitchSeries.clear();
    yawSeries.clear();
  }

  // the gyro's offset, measured held still
  function zero() {
    if (zeroing.value) return;
    sum = null;
    zeroing.value = true;
  }

  return { b0, zeroing, zeroed, zero, input, kp: mahony.kp, ki: mahony.ki, fused, gravity, gyroAlone, learned, rollSource: rollSeries.source, pitchSource: pitchSeries.source, yawSource: yawSeries.source, restart };
}
