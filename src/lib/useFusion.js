// Accelerometer and gyro fused into an attitude, by Mahony's filter (lib/
// fusion.js), with each sensor's own idea of roll and pitch alongside to
// compare: gravity's tilt, and the gyro alone added up from where gravity
// put it. Fed by any stream: subscribe(fn(t ms, accel [x y z] g, gyro
// [x y z] deg/s)) -> unsubscribe. The last windowMs of roll and pitch, three
// ways each, kept for charts.
import { ref, onBeforeUnmount } from 'vue';
import { Mahony } from './fusion.js';
import { rollOf, pitchOf } from './tilt.js';
import { makeSeries } from './series.js';

const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated

export function useFusion(subscribe, { windowMs = 10000 } = {}) {
  const mahony = new Mahony();
  const input = ref(null); // the latest reading: { accel [x y z] g, gyro [x y z] deg/s, dt s }
  const fused = ref(null); // { q, held: { q, up } from the reading before (up: the room's z in the board's axes), roll, pitch, yaw } degrees
  const gravity = ref(null); // { roll, pitch }
  const gyroAlone = ref(null); // { roll, pitch }
  const learned = ref(null); // the gyro offset Mahony's integral learned, deg/s [x y z]
  const rollSeries = makeSeries(3, windowMs); // gravity's, the gyro alone, fused: the formulas' order
  const pitchSeries = makeSeries(3, windowMs);
  let lastT = null;
  let alone = null;

  const off = subscribe((t, accel, gyro) => {
    const dt = lastT === null ? 0 : (t - lastT) / 1000;
    lastT = t;
    const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
    // the attitude held from the reading before, and its up: what this reading is compared with
    const held = mahony.q ? { q: mahony.q, up: mahony.up() } : null;
    mahony.update(accel, gyro, step);
    const g = { roll: rollOf(...accel), pitch: pitchOf(...accel) };
    if (!alone) alone = { ...g };
    alone.roll += gyro[0] * step; // roll turns about +x
    alone.pitch -= gyro[1] * step; // nose up is about -y
    const m = mahony.angles();
    input.value = { accel, gyro, dt: step };
    fused.value = { q: mahony.q, held, ...m };
    gravity.value = g;
    gyroAlone.value = { ...alone };
    learned.value = mahony.learnedOffset();
    rollSeries.push(t, [g.roll, alone.roll, m.roll]);
    pitchSeries.push(t, [g.pitch, alone.pitch, m.pitch]);
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
  }

  return { input, kp: mahony.kp, ki: mahony.ki, fused, gravity, gyroAlone, learned, rollSource: rollSeries.source, pitchSource: pitchSeries.source, restart };
}
