// The 3D view the drawings share: a camera behind the board and to its
// right, 25 degrees up, looking at it (in the board's frame: x the nose,
// y left, z up). project() gives screen x, y (y down) and depth (larger is
// nearer the camera). A true rotation, so right-handed.
const VIEW_AZ = -140 * (Math.PI / 180); // from the nose, about z
const VIEW_EL = 25 * (Math.PI / 180);

const back = [Math.cos(VIEW_EL) * Math.cos(VIEW_AZ), Math.cos(VIEW_EL) * Math.sin(VIEW_AZ), Math.sin(VIEW_EL)]; // toward the camera
const f = back.map((v) => -v);
const rl = Math.hypot(f[0], f[1]);
const right = [f[1] / rl, -f[0] / rl, 0]; // f x up
const up = [right[1] * f[2] - right[2] * f[1], right[2] * f[0] - right[0] * f[2], right[0] * f[1] - right[1] * f[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function project(v, scale = 1) {
  return [scale * dot(v, right), -scale * dot(v, up), dot(v, back)];
}
