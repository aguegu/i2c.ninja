// The board's colours in every drawing (3D, the glass box, the flat views):
// a neutral slate, as blue, orange and green belong to the x, y and z axes;
// light enough to stand out on a dark card too
export const BOARD = {
  top: '#64748b',
  side: '#475569',
  bottom: '#334155',
  edge: '#1e293b',
};

// The board's shape, in its own (body) axes: x the nose, y left, z up out of
// its top; units of the drawings, scaled by each
export const L = 1.1; // half length (x)
export const W = 0.65; // half width (y)
export const H = 0.07; // half thickness (z)
const corner = (sx, sy, sz) => [sx * L, sy * W, sz * H];
// faces with their outward normals, the fill from BOARD
export const FACES = [
  { name: 'top', fill: BOARD.top, n: [0, 0, 1], pts: [corner(1, 1, 1), corner(1, -1, 1), corner(-1, -1, 1), corner(-1, 1, 1)] },
  { name: 'bottom', fill: BOARD.bottom, n: [0, 0, -1], pts: [corner(1, 1, -1), corner(-1, 1, -1), corner(-1, -1, -1), corner(1, -1, -1)] },
  { name: 'nose', fill: BOARD.side, n: [1, 0, 0], pts: [corner(1, 1, 1), corner(1, 1, -1), corner(1, -1, -1), corner(1, -1, 1)] },
  { name: 'tail', fill: BOARD.side, n: [-1, 0, 0], pts: [corner(-1, 1, 1), corner(-1, -1, 1), corner(-1, -1, -1), corner(-1, 1, -1)] },
  { name: 'left', fill: BOARD.side, n: [0, 1, 0], pts: [corner(1, 1, 1), corner(-1, 1, 1), corner(-1, 1, -1), corner(1, 1, -1)] },
  { name: 'right', fill: BOARD.side, n: [0, -1, 0], pts: [corner(1, -1, 1), corner(1, -1, -1), corner(-1, -1, -1), corner(-1, -1, 1)] },
];
// the white nose arrow on the top face: its shaft, then its head
export const ARROW = [[-0.55, 0, H], [0.55, 0, H], [0.35, 0.18, H], [0.55, 0, H], [0.35, -0.18, H]];
// the board's own axes, drawn from its centre: lowercase, as printed on the chip
export const BODY_AXES = [
  { key: 'x', dir: [1, 0, 0], color: 'var(--series-1)' },
  { key: 'y', dir: [0, 1, 0], color: 'var(--series-2)' },
  { key: 'z', dir: [0, 0, 1], color: 'var(--series-3)' },
];
