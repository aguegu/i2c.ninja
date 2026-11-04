// the quaternion helpers of Learn the IMU step 5, and Mahony's q against them
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rotate, axisAngle, fromAxisAngle } from '../src/lib/quaternion.js';
import { Mahony } from '../src/lib/fusion.js';

const near = (a, b, tol = 1e-9) => a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) <= tol, `${a} vs ${b}`));

describe('quaternions', () => {
  it('turn vectors by the right-hand rule', () => {
    near(rotate(fromAxisAngle([0, 0, 1], 90), [1, 0, 0]), [0, 1, 0]); // about z: x to y
    near(rotate(fromAxisAngle([1, 0, 0], 90), [0, 1, 0]), [0, 0, 1]); // about x: y to z
    near(rotate(fromAxisAngle([0, 1, 0], 90), [0, 0, 1]), [1, 0, 0]); // about y: z to x
  });

  it('give back their axis and angle; a full turn is -q, the same orientation', () => {
    const axis = [1, 2, 2].map((v) => v / 3);
    const { angle, axis: a } = axisAngle(fromAxisAngle(axis, 70));
    near([angle], [70]);
    near(a, axis);
    const full = fromAxisAngle([0, 0, 1], 360);
    near(full, [-1, 0, 0, 0]);
    near(rotate(full, [1, 0, 0]), [1, 0, 0]);
  });

  it('Mahony\'s q turns the board\'s up into the room\'s: up() is the room\'s z seen from the board', () => {
    const m = new Mahony().level([0, Math.sin(0.3), Math.cos(0.3)]); // rolled right 0.3 rad
    near(rotate(m.q, m.up()), [0, 0, 1], 1e-9);
  });
});
