// the six-position accelerometer fit of Learn the IMU step 6, against a
// made-up sensor with a known offset and scale per axis
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { faceUp, faceKey, fitAccel, correct, tiltError } from '../src/lib/calibration.js';

const OFFSET = [0.04, -0.02, 0.07]; // g
const SCALE = [1.02, 0.98, 1.01];
const read = (truth) => truth.map((v, k) => v * SCALE[k] + OFFSET[k]); // what the sensor says
const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} vs ${b}`);

const FACES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

describe('calibration', () => {
  it('tells the face up, and refuses a board not lying square', () => {
    assert.equal(faceKey(faceUp(read([0, 0, 1]))), '+z');
    assert.equal(faceKey(faceUp(read([-1, 0, 0]))), '-x');
    assert.equal(faceUp(read([0.7, 0, 0.7])), null); // on an edge
  });

  it('recovers the offset and scale from the six faces', () => {
    const faces = {};
    for (const f of FACES) { const m = read(f); faces[faceKey(faceUp(m))] = m; }
    const fit = fitAccel(faces);
    fit.offset.forEach((o, k) => near(o, OFFSET[k], 1e-12, `offset ${k}`));
    fit.scale.forEach((s, k) => near(s, SCALE[k], 1e-12, `scale ${k}`));
    for (const f of FACES) near(Math.hypot(...correct(read(f), fit)), 1, 1e-12, `|a| corrected ${f}`);
  });

  it('waits for all six', () => {
    assert.equal(fitAccel({ '+x': read([1, 0, 0]) }), null);
  });

  it('an offset across gravity fakes a tilt: 0.017 g is about 1 degree', () => {
    near(tiltError(0.017), 0.974, 0.001, 'tilt');
  });
});

describe('the stored calibration applied', async () => {
  const { applyCalibration } = await import('../src/lib/calibrationStore.js');
  it('takes off what was measured, leaves the rest', () => {
    const cal = { chip: 'MPU-6500', gyroOffsetDps: [1, -2, 0.5], accelOffsetG: [0.1, 0, -0.1], accelScale: [1.1, 1, 0.9] };
    const r = applyCalibration(cal, [1.2, 0, 0.8], [1, -2, 0.5]);
    assert.deepEqual(r.gyro, [0, 0, 0]);
    near(r.accel[0], 1, 1e-12, 'x');
    near(r.accel[2], 1, 1e-12, 'z');
    assert.deepEqual(applyCalibration({ chip: 'MPU-6500', gyroOffsetDps: [1, 1, 1] }, [0, 0, 1], [1, 1, 1]).accel, [0, 0, 1]);
  });
});
