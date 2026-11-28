// Height and climb from a barometer and an accelerometer together (the
// height page, lib/useHeight.js): the barometer's height is right on
// average but noisy and late; the accelerometer's upward acceleration,
// added up twice, is quick but drifts away within seconds, more so with
// any offset. A third-order complementary filter keeps three numbers:
// the height h, the climb v and the accelerometer's offset b (learned while
// in use); each reading it integrates the acceleration less b, then steers
// all three by the gap e between the barometer's height and its own:
//   e = h_baro - h
//   h <- h + (v + k1 e) dt
//   v <- v + (a_up - b + k2 e) dt
//   b <- b - k3 e dt
// With k1 = 3/tau, k2 = 3/tau^2, k3 = 1/tau^3 the gaps die away as
// (s + 1/tau)^3: no overshoot, one time constant tau. Over less than tau
// the accelerometer leads; over more, the barometer.
// a_up (m/s^2): the reading turned into the room's frame (by the attitude,
// lib/fusion.js), its vertical part less gravity.
import { rotate } from './quaternion.js';
import { G } from './pressure.js';

const MAX_STEP_S = 0.1; // a longer gap between readings: not integrated

// the upward acceleration, m/s^2: the accelerometer [x y z] (g, the board's
// axes) through the attitude q (board to room), its Z less 1 g
export const upward = (q, accel) => (rotate(q, accel)[2] - 1) * G;

export class HeightFilter {
  constructor(tau = 1) {
    this.tau = tau;
    this.reset();
  }

  get gains() {
    return { k1: 3 / this.tau, k2: 3 / this.tau ** 2, k3: 1 / this.tau ** 3 };
  }

  // started again at the barometer's height (h, v and b from scratch)
  reset(h = null) {
    this.h = h;
    this.v = 0;
    this.b = 0;
    this.e = 0;
  }

  // a_up m/s^2, h_baro m, dt s: { h, v, b, e }
  update(aUp, hBaro, dt) {
    if (this.h === null) this.h = hBaro;
    const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
    const { k1, k2, k3 } = this.gains;
    const e = hBaro - this.h;
    this.e = e;
    this.h += (this.v + k1 * e) * step;
    this.v += (aUp - this.b + k2 * e) * step;
    this.b -= k3 * e * step;
    return { h: this.h, v: this.v, b: this.b, e };
  }
}

// the accelerometer alone: a_up added up twice from rest, no barometer, no
// offset learned: the drift the filter saves you from
export class DeadReckoning {
  constructor() {
    this.reset();
  }

  reset() {
    this.h = 0;
    this.v = 0;
  }

  update(aUp, dt) {
    const step = dt > 0 && dt <= MAX_STEP_S ? dt : 0;
    this.v += aUp * step;
    this.h += this.v * step;
    return { h: this.h, v: this.v };
  }
}
