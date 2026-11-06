// Tilt from gravity (Acceleration and gravity, the attitude page), the board held like a plane:
// its x arrow the nose, face up (so y points left, z up). Degrees.
export const DEG = 180 / Math.PI;

// turning about the nose, right side down +
export const rollOf = (ax, ay, az) => Math.atan2(ay, az) * DEG;

// nose up +
export const pitchOf = (ax, ay, az) => Math.atan2(ax, Math.hypot(ay, az)) * DEG;
