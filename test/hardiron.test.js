// useHardIron's swingProgress: each axis's swing against the widest, floored
// at twice Earth's weakest field
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { swingProgress } from '../src/lib/useHardIron.js';

const span = (lo, hi) => ({ min: { x: lo[0], y: lo[1], z: lo[2] }, max: { x: hi[0], y: hi[1], z: hi[2] } });

test('nothing yet: all zero', () => {
  assert.deepEqual(swingProgress(null), { x: 0, y: 0, z: 0, all: 0 });
});

test('barely moved: low, not full, though the swings are equal', () => {
  const p = swingProgress(span([-1, -1, -1], [1, 1, 1]));
  assert.ok(Math.abs(p.all - 2 / (0.7 * 50)) < 1e-9);
});

test('turned flat only: x and y full, z behind', () => {
  const p = swingProgress(span([-71, 30, -20], [6, 106, 10])); // the BMX055 capture, chip axes
  assert.equal(p.x, 1);
  assert.equal(p.y, 1);
  assert.ok(p.z < 0.6);
  assert.equal(p.all, p.z);
});

test('every way round, or tilted about 45 degrees each way: all full', () => {
  assert.equal(swingProgress(span([-80, -30, -40], [0, 50, 40])).all, 1);
  assert.equal(swingProgress(span([-80, -30, -28], [0, 50, 28])).all, 1); // z 56 of 80: 70 %
});
