// Height and climb from a barometer and an accelerometer (the height page):
// the attitude by Mahony's filter (lib/fusion.js, accelerometer and gyro)
// turns each accelerometer reading into the room's frame, its vertical part
// less gravity the upward acceleration (lib/height.js); the barometer's
// height above the pressure at the start (the hypsometric equation, at the
// air's own temperature: lib/pressure.js); the two fused by the third-order
// complementary filter, the accelerometer alone added up twice beside it.
// subscribe(fn(t ms, accel [x y z] g, gyro [x y z] deg/s, baro [Pa, C, 0]))
// -> unsubscribe. restart(): the reference pressure taken again (height 0
// here), every filter from scratch. The last windowMs kept for charts.
import { perFrame } from './frame.js';
import { ref, watch, onBeforeUnmount } from 'vue';
import { Mahony } from './fusion.js';
import { upward, HeightFilter, DeadReckoning } from './height.js';
import { heightAbove } from './pressure.js';
import { makeSeries } from './series.js';

const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated
export const DEFAULT_TAU_S = 1; // the filter's time constant: best of 0.5, 1 and 2 s on a simulated lift (test/height.test.js)

export function useHeight(subscribe, { windowMs = 20000 } = {}) {
  const mahony = new Mahony();
  const filter = new HeightFilter(DEFAULT_TAU_S);
  const alone = new DeadReckoning();
  const tau = ref(DEFAULT_TAU_S);
  watch(tau, (t) => { filter.tau = t; });
  const now = ref(null); // the newest: { aUp, hBaro, h, v, b, e, hAlone, vAlone, dt, p, p0, c }
  const heightSeries = makeSeries(2, windowMs); // the barometer's, fused (m)
  const aloneSeries = makeSeries(1, windowMs); // the accelerometer alone (m): its own chart, it runs away
  const climbSeries = makeSeries(1, windowMs); // fused (m/s)
  const publish = perFrame((s) => { now.value = s; });
  let p0 = null; // Pa, the reference: height 0
  let lastT = null;

  const off = subscribe((t, accel, gyro, baro) => {
    const [p, c] = baro;
    if (!(p > 0)) return; // no barometer reading yet
    const dt = lastT === null ? 0 : (t - lastT) / 1000;
    lastT = t;
    const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
    mahony.update(accel, gyro, step);
    if (p0 === null) p0 = p;
    const aUp = mahony.q ? upward(mahony.q, accel) : 0;
    const hBaro = heightAbove(p, p0, c);
    const r = filter.update(aUp, hBaro, step);
    const a = alone.update(aUp, step);
    publish.push({ aUp, hBaro, ...r, hAlone: a.h, vAlone: a.v, dt: step, p, p0, c, gains: filter.gains });
    heightSeries.push(t, [hBaro, r.h]);
    aloneSeries.push(t, [a.h]);
    climbSeries.push(t, [r.v]);
  });
  onBeforeUnmount(() => { off(); publish.cancel(); });

  // height 0 here: the reference pressure taken again, every filter from scratch
  function restart() {
    publish.cancel();
    p0 = null;
    lastT = null;
    mahony.q = null;
    mahony.integral = [0, 0, 0];
    filter.reset();
    alone.reset();
    heightSeries.clear();
    aloneSeries.clear();
    climbSeries.clear();
    now.value = null;
  }

  return { tau, now, restart, heightSource: heightSeries.source, aloneSource: aloneSeries.source, climbSource: climbSeries.source };
}
