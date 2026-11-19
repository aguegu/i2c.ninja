// A compass from a magnetometer, with and without an accelerometer, in the
// board's axes as printed (x the nose, y left, z up; [x, y, z] arrays).
// levelHeading(b): the board taken as level (as the magnetometer views
// read it). compass(up, b): up (a still accelerometer's reading) gives the
// vertical; the field's vertical part is taken off, leaving the level part,
// which points to magnetic north whatever the tilt: a tilt-compensated
// heading, and the field's dip below level on the way.
import { DEG } from './tilt.js';

const MIN_UP_G = 0.2; // an up weaker than this (free fall, a hard push) gives no vertical
const MIN_LEVEL_UT = 1; // a level part weaker than this (at a magnetic pole) gives no north

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const along = (v, u) => v.map((c, i) => c - dot(v, u) * u[i]); // v with its part along u (unit) taken off
const deg360 = (rad) => ((rad * DEG) % 360 + 360) % 360;

// degrees clockwise from magnetic north to the nose (x), seen from above,
// the board taken as level: only x and y used
export function levelHeading(b) {
  return deg360(Math.atan2(b[1], b[0]));
}

// { heading (degrees, as levelHeading's, or null), dip (degrees below level,
// or null), level (the field's level part, its unit) } from up and b; and
// the steps on the way, for a page to show: U (up, unit), vertical (B.U),
// flat (B_h), north, east, nose (x_h)
export function compass(up, b) {
  const n = Math.hypot(...up);
  if (n < MIN_UP_G) return { heading: null, dip: null, level: null, U: null, vertical: null, flat: null, north: null, east: null, nose: null };
  const U = up.map((c) => c / n); // the vertical, up, in the board's axes
  const vertical = dot(b, U);
  const flat = along(b, U); // the field's level part: points to magnetic north
  const level = Math.hypot(...flat);
  const dip = Math.atan2(-vertical, level) * DEG; // + : the field dips into the ground
  const nose = along([1, 0, 0], U); // the nose laid level
  const steps = { U, vertical, flat, nose };
  if (level < MIN_LEVEL_UT) return { heading: null, dip, level, ...steps, north: null, east: null };
  const north = flat.map((c) => c / level);
  const east = cross(north, U);
  if (Math.hypot(...nose) < 1e-3) return { heading: null, dip, level, ...steps, north, east }; // pointing straight up or down
  return { heading: deg360(Math.atan2(dot(nose, east), dot(nose, north))), dip, level, ...steps, north, east };
}

// a's angle to b, -180 to 180 degrees: how far apart two headings are, signed
export const apart = (a, b) => ((((a - b) % 360) + 540) % 360) - 180; // any a and b, even unwrapped past 360
