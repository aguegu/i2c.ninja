// Learn the IMU, step 6: calibration. The accelerometer from six still
// positions, one face down each (each axis once at +1 g, once at -1 g):
// per axis, the offset is the middle of its two readings and the scale half
// their span. Corrected: (raw - offset) / scale. The gyro's offset: its mean
// at rest (step 3's).
export const AXES = ['x', 'y', 'z'];
const FACE_MIN_G = 0.8; // the axis pointing up reads at least this
const FACE_OFF_G = 0.3; // the other two at most this: square enough on a face

// which face a still reading says is up: { axis 0..2, sign +1/-1 } or null
// when the board isn't lying square on a face
export function faceUp(mean) {
  const k = [0, 1, 2].reduce((best, i) => (Math.abs(mean[i]) > Math.abs(mean[best]) ? i : best), 0);
  if (Math.abs(mean[k]) < FACE_MIN_G) return null;
  if ([0, 1, 2].some((i) => i !== k && Math.abs(mean[i]) > FACE_OFF_G)) return null;
  return { axis: k, sign: Math.sign(mean[k]) };
}

export const faceKey = ({ axis, sign }) => `${sign > 0 ? '+' : '-'}${AXES[axis]}`;

// from the six faces' means, { '+x': [ax, ay, az], '-x': ..., ... }:
// { offset [3] g, scale [3] (1 is perfect) }, or null until all six are in
export function fitAccel(faces) {
  const offset = [], scale = [];
  for (let k = 0; k < 3; k++) {
    const plus = faces[`+${AXES[k]}`], minus = faces[`-${AXES[k]}`];
    if (!plus || !minus) return null;
    offset.push((plus[k] + minus[k]) / 2);
    scale.push((plus[k] - minus[k]) / 2);
  }
  return { offset, scale };
}

export const correct = (raw, { offset, scale }) => raw.map((v, k) => (v - offset[k]) / scale[k]);

// the tilt a constant accelerometer offset of `g` across the 1 g fakes,
// degrees (step 2's angles lean by this much)
export const tiltError = (g) => Math.asin(Math.min(1, Math.abs(g))) * (180 / Math.PI);
