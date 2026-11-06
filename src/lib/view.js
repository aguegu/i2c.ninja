// The 3D view the drawings share: a camera behind the board and to its
// right, 25 degrees up, looking at it (in the board's frame: x the nose,
// y left, z up). project() gives screen x, y (y down) and depth (larger is
// nearer the camera). A true rotation, so right-handed.
const VIEW_AZ_DEG = -140; // from the nose, about z
const VIEW_EL_DEG = 25;
const RAD = Math.PI / 180;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// a camera az degrees round from the nose (about z, anticlockwise from
// above), el degrees up, looking at the centre: v -> [screen x, y, depth]
export function camera(azDeg, elDeg) {
  const az = azDeg * RAD, el = elDeg * RAD;
  const back = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)]; // toward the camera
  const f = back.map((v) => -v);
  const rl = Math.hypot(f[0], f[1]);
  const right = [f[1] / rl, -f[0] / rl, 0]; // f x up
  const up = [right[1] * f[2] - right[2] * f[1], right[2] * f[0] - right[0] * f[2], right[0] * f[1] - right[1] * f[0]];
  return (v, scale = 1) => [scale * dot(v, right), -scale * dot(v, up), dot(v, back)];
}

export const project = camera(VIEW_AZ_DEG, VIEW_EL_DEG);
