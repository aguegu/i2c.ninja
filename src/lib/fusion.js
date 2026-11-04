// Learn the IMU, step 4: the gyro and gravity combined. In step 2's frame
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
export const INTEGRAL_MAX_DPS = 10;

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

  // straight to gravity's tilt, heading 0
  level(accel) {
    const r = rollOf(...accel) * RAD, p = pitchOf(...accel) * RAD;
    // roll about x, then pitch about -y (nose up), applied as q = qPitch * qRoll
    const cr = Math.cos(r / 2), sr = Math.sin(r / 2), cp = Math.cos(p / 2), sp = Math.sin(-p / 2);
    this.q = [cp * cr, cp * sr, sp * cr, -sp * sr];
    return this;
  }

  update(accel, gyro, dt) {
    if (!this.q) return this.level(accel);
    if (!(dt > 0)) return this;
    let [gx, gy, gz] = gyro.map((g) => g * RAD);
    const m = Math.hypot(...accel);
    if (m > 0) {
      const a = accel.map((v) => v / m), v = this.up();
      const e = [a[1] * v[2] - a[2] * v[1], a[2] * v[0] - a[0] * v[2], a[0] * v[1] - a[1] * v[0]]; // a x v
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
