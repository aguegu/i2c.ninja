// the filters of Learn the IMU step 4, against made-up motion
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Complementary, Mahony } from '../src/lib/fusion.js';

const RAD = Math.PI / 180;
const DT = 0.004; // 250 Hz
// at rest, tilted: the accelerometer's 1 g up, in the board's axes, for a
// roll (right side down) and pitch (nose up) as step 2 defines them
function gravity(rollDeg, pitchDeg) {
  const r = rollDeg * RAD, p = pitchDeg * RAD;
  return [Math.sin(p), Math.cos(p) * Math.sin(r), Math.cos(p) * Math.cos(r)];
}
const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);

describe('complementary filter', () => {
  it('starts at gravity\'s tilt', () => {
    const f = new Complementary().update(gravity(20, -10), [0, 0, 0], DT);
    near(f.roll, 20, 1e-9, 'roll');
    near(f.pitch, -10, 1e-9, 'pitch');
  });

  it('follows a turn by the gyro: right side down, then nose up', () => {
    const f = new Complementary(1).update(gravity(0, 0), [0, 0, 0], DT);
    for (let i = 0; i < 250; i++) f.update(gravity((i + 1) * 0.12, 0), [30, 0, 0], DT); // 30 deg/s for 1 s about +x
    near(f.roll, 30, 1, 'roll');
    for (let i = 0; i < 250; i++) f.update(gravity(30, (i + 1) * 0.08), [0, -20, 0], DT); // nose up 20 deg/s: about -y
    near(f.pitch, 20, 1, 'pitch');
  });

  it('holds still under a biased gyro: the bias over tau, not drift', () => {
    const f = new Complementary(0.5).update(gravity(0, 0), [0, 0, 0], DT);
    for (let i = 0; i < 250 * 60; i++) f.update(gravity(0, 0), [-4.4, 2, 0], DT); // a minute
    near(f.roll, -4.4 * 0.5, 0.05, 'roll'); // settles at bias x tau, not -264 degrees
    near(f.pitch, -2 * 0.5, 0.05, 'pitch');
  });
});

describe('mahony filter', () => {
  it('levels to gravity\'s tilt, step 2\'s signs', () => {
    for (const [r, p] of [[20, 0], [0, 20], [-30, 15], [45, -30]]) {
      const a = new Mahony().update(gravity(r, p), [0, 0, 0], DT).angles();
      near(a.roll, r, 1e-6, `roll ${r} ${p}`);
      near(a.pitch, p, 1e-6, `pitch ${r} ${p}`);
      near(a.yaw, 0, 1e-6, 'yaw');
    }
  });

  it('turns with the gyro: roll about +x, nose up about -y, right about -z', () => {
    const turn = (gyro, accelAt) => {
      const m = new Mahony(0, 0).update(gravity(0, 0), [0, 0, 0], DT);
      for (let i = 0; i < 250; i++) m.update(accelAt(i), gyro, DT); // 1 s
      return m.angles();
    };
    near(turn([30, 0, 0], () => gravity(0, 0)).roll, 30, 0.5, 'roll');
    near(turn([0, -30, 0], () => gravity(0, 0)).pitch, 30, 0.5, 'pitch');
    near(turn([0, 0, -30], () => gravity(0, 0)).yaw, 30, 0.5, 'yaw');
  });

  it('pulls a gyro-only tilt back to gravity', () => {
    const m = new Mahony(2, 0).update(gravity(0, 0), [0, 0, 0], DT);
    for (let i = 0; i < 250 * 5; i++) m.update(gravity(0, 0), [5, 0, 0], DT); // a 5 deg/s bias, 5 s
    // held off by about bias / kp: 5 deg/s over 2 /s is 2.5 degrees, not the 25 the gyro alone would give
    assert.ok(Math.abs(m.angles().roll) < 3, `roll ${m.angles().roll}`);
  });

  it('the integral learns the offset on x and y (not z: gravity can\'t see yaw)', () => {
    const m = new Mahony(1, 0.3).update(gravity(0, 0), [0, 0, 0], DT);
    for (let i = 0; i < 250 * 60; i++) m.update(gravity(0, 0), [-4.4, 2, 0.5], DT);
    const o = m.learnedOffset();
    near(o[0], -4.4, 0.1, 'offset x');
    near(o[1], 2, 0.1, 'offset y');
    near(m.angles().roll, 0, 0.1, 'roll');
    near(m.angles().pitch, 0, 0.1, 'pitch');
  });
});
