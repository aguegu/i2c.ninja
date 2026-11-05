// Quaternions as [w, x, y, z], turning the board's axes into the room's.
// Learn the IMU, step 5.
const DEG = 180 / Math.PI;

// v turned by q
export function rotate([w, x, y, z], [vx, vy, vz]) {
  // t = 2 (q.xyz x v); v' = v + w t + q.xyz x t
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}

// the one turn that gives q: { angle degrees 0..360, axis unit [x y z] }
// (no turn: angle 0, axis along z by convention)
export function axisAngle([w, x, y, z]) {
  const s = Math.hypot(x, y, z);
  if (s < 1e-9) return { angle: 0, axis: [0, 0, 1] };
  return { angle: 2 * Math.atan2(s, w) * DEG, axis: [x / s, y / s, z / s] };
}

// a turn of angle degrees about a unit axis
export function fromAxisAngle(axis, angle) {
  const h = (angle / DEG) / 2, s = Math.sin(h);
  return [Math.cos(h), axis[0] * s, axis[1] * s, axis[2] * s];
}
