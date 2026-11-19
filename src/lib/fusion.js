// The gyro and gravity combined (the attitude page, lib/useFusion.js). In the board's frame
// (x the nose, y left, z up; the accelerometer reading +1 g up at rest):
// roll right side down +, pitch nose up +, yaw turning right +. Degrees and
// deg/s at the edges; radians inside.
import { rollOf, pitchOf, DEG } from './tilt.js';

const RAD = 1 / DEG;

// The complementary filter, roll and pitch: each step trusts the gyro's
// turn, then leans a little toward gravity's angle. tau (s) is how long
// gravity takes to pull it back: alpha = tau / (tau + dt) of the old angle
// kept each step. (Per axis, so right while the tilts stay modest.)
export class Complementary {
  constructor(tau = 0.5) {
    this.tau = tau;
    this.roll = null;
    this.pitch = null;
  }

  // accel [x y z] g, gyro [x y z] deg/s about the board's axes, dt s
  update(accel, gyro, dt) {
    const gRoll = rollOf(...accel), gPitch = pitchOf(...accel);
    if (this.roll === null || !(dt > 0)) {
      this.roll = gRoll;
      this.pitch = gPitch;
      return this;
    }
    const alpha = this.tau / (this.tau + dt);
    this.roll = alpha * (this.roll + gyro[0] * dt) + (1 - alpha) * gRoll; // roll turns about +x
    this.pitch = alpha * (this.pitch - gyro[1] * dt) + (1 - alpha) * gPitch; // nose up is about -y
    return this;
  }
}

// Mahony's filter: the attitude as a quaternion q = [w, x, y, z] turning
// the board's axes into the room's (z up). Each step the gyro turns it; the
// error between where gravity says up is and where q says it is (their
// cross product) is added to the gyro: kp of it now (proportional), and ki
// of it summed over time (integral) - which settles where it cancels the
// gyro's offset: the offset learned while in use, on the axes gravity sees.
// The integral is capped so a long shake can't wind it up.
// With a magnetometer too (9 axes): the world's X is magnetic north (Y west,
// Z up), and a second error steers the heading: north as the field says it
// (the field's level part, in the board's axes) against north as q says it
// (the world's X turned into the board's axes). Both lie level, so their
// cross product points along up: it turns q about the vertical only, and
// leaves roll and pitch to gravity. The integral then learns the gyro's
// offset on all three axes.
export const INTEGRAL_MAX_DPS = 10;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// the field's level part in the board's axes (up a unit vector there), as a
// unit vector: north as the field says it; null with no level part to speak of
const MIN_LEVEL = 1e-6;
export function northOf(field, up) {
  const k = dot(field, up);
  const h = field.map((c, i) => c - k * up[i]);
  const n = Math.hypot(...h);
  return n > MIN_LEVEL ? h.map((c) => c / n) : null;
}

export class Mahony {
  constructor(kp = 1, ki = 0.1) {
    this.kp = kp;
    this.ki = ki;
    this.q = null;
    this.integral = [0, 0, 0]; // rad/s, added to the gyro
  }

  // up (the room's z) as the board sees it
  up() {
    const [w, x, y, z] = this.q;
    return [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)];
  }

  // north (the world's X) as the board sees it
  north() {
    const [w, x, y, z] = this.q;
    return [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)];
  }

  // straight to gravity's tilt, heading 0; with a field, the heading it gives
  level(accel, field = null) {
    const r = rollOf(...accel) * RAD, p = pitchOf(...accel) * RAD;
    // roll about x, then pitch about -y (nose up), applied as q = qPitch * qRoll
    const cr = Math.cos(r / 2), sr = Math.sin(r / 2), cp = Math.cos(p / 2), sp = Math.sin(-p / 2);
    this.q = [cp * cr, cp * sr, sp * cr, -sp * sr];
    if (field) {
      // turn about the world's vertical until q's north lies along the field's
      const n = northOf(field, this.up());
      if (n) {
        const off = -Math.atan2(dot(cross(this.north(), n), this.up()), dot(this.north(), n)); // the board turned against the gap: q's north onto n
        const [w, x, y, z] = this.q, c = Math.cos(off / 2), s = Math.sin(off / 2);
        // q * (turn by off about the board's up): the same as about the world's Z, after
        const u = this.up().map((k) => k * s);
        this.q = [w * c - x * u[0] - y * u[1] - z * u[2], w * u[0] + x * c + y * u[2] - z * u[1], w * u[1] - x * u[2] + y * c + z * u[0], w * u[2] + x * u[1] - y * u[0] + z * c];
      }
    }
    return this;
  }

  // field: the magnetometer's reading, hard iron off (any unit), or null: no compass
  update(accel, gyro, dt, field = null) {
    if (!this.q) return this.level(accel, field);
    if (!(dt > 0)) return this;
    let [gx, gy, gz] = gyro.map((g) => g * RAD);
    const m = Math.hypot(...accel);
    if (m > 0) {
      const a = accel.map((v) => v / m), v = this.up();
      const e = cross(a, v);
      const n = field ? northOf(field, v) : null;
      if (n) {
        const em = cross(n, this.north()); // along up: a turn about the vertical only
        for (let k = 0; k < 3; k++) e[k] += em[k];
      }
      const cap = INTEGRAL_MAX_DPS * RAD;
      this.integral = this.integral.map((s, k) => Math.max(-cap, Math.min(cap, s + this.ki * e[k] * dt)));
      gx += this.kp * e[0] + this.integral[0];
      gy += this.kp * e[1] + this.integral[1];
      gz += this.kp * e[2] + this.integral[2];
    }
    const [w, x, y, z] = this.q, h = dt / 2;
    const q = [w - h * (x * gx + y * gy + z * gz), x + h * (w * gx + y * gz - z * gy), y + h * (w * gy - x * gz + z * gx), z + h * (w * gz + x * gy - y * gx)];
    const n = Math.hypot(...q);
    this.q = q.map((c) => c / n);
    return this;
  }

  // degrees, as the steps before: roll and pitch from up, yaw from where the nose points
  angles() {
    const v = this.up();
    const [w, x, y, z] = this.q;
    const noseX = 1 - 2 * (y * y + z * z), noseY = 2 * (x * y + w * z); // the nose in the room
    return { roll: rollOf(...v), pitch: pitchOf(...v), yaw: -Math.atan2(noseY, noseX) * DEG };
  }

  // the gyro offset the integral has learned, deg/s (what it adds, negated)
  learnedOffset() {
    return this.integral.map((s) => -s * DEG);
  }
}
