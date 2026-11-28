// lib/height.js: the upward acceleration through the attitude, and the
// third-order complementary filter: a still board with an accelerometer
// offset (the filter learns it, the accelerometer alone drifts away), and
// a 1 m lift with a barometer's noise (the fused height quieter than the
// barometer, and on the lift within a few centimetres)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upward, HeightFilter, DeadReckoning } from '../src/lib/height.js';
import { fromAxisAngle, rotate } from '../src/lib/quaternion.js';
import { G } from '../src/lib/pressure.js';

const DT = 0.02; // the pages' 50 readings a second
const conj = ([w, x, y, z]) => [w, -x, -y, -z];
// a repeatable noise, uniform in -1..1
const noise = (seed) => { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2147483648; return (s / 1073741824) - 1; }; };
const rms = (a) => Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length);

test('upward: the room\'s up through q; at rest 0 however the board is turned, a lift its m/s^2', () => {
  for (const q of [[1, 0, 0, 0], fromAxisAngle([1, 0, 0], 90), fromAxisAngle([0.6, 0.8, 0], 135)]) {
    // what the accelerometer reads in the board's axes: the room's [0 0 1 g] turned back by q
    assert.ok(Math.abs(upward(q, rotate(conj(q), [0, 0, 1]))) < 1e-12);
    assert.ok(Math.abs(upward(q, rotate(conj(q), [0, 0, 1.1])) - 0.1 * G) < 1e-9);
  }
});

test('still, an accelerometer offset of 0.087 g: the filter learns it and holds the height; alone it drifts', () => {
  const bias = 0.087 * G; // the user's MPU-6500 module read |a| 1.087 g at rest
  const f = new HeightFilter(1);
  const alone = new DeadReckoning();
  let r;
  for (let i = 0; i < 30 / DT; i++) {
    r = f.update(bias, 0, DT);
    alone.update(bias, DT);
  }
  assert.ok(Math.abs(r.b - bias) < 0.01, `learned b ${r.b} of ${bias}`);
  assert.ok(Math.abs(r.h) < 0.01, `h ${r.h} m after 30 s`);
  assert.ok(Math.abs(r.v) < 0.01, `v ${r.v} m/s`);
  assert.ok(alone.h > 300, `the accelerometer alone ${alone.h} m after 30 s (1/2 b t^2: ${0.5 * bias * 900})`);
});

test('a 1 m lift, the barometer noisy (0.13 m, as a BMP280 at x8): fused quieter, and on the lift', () => {
  const f = new HeightFilter(1);
  const rnd = noise(7);
  const BARO_NOISE_M = 0.13; // Table 8: 1.6 Pa RMS at x8, about 0.13 m
  const lift = (s) => (s < 10 ? 0 : s < 11 ? 0.5 * (1 - Math.cos(Math.PI * (s - 10))) : 1); // 0 to 1 m in a second
  const accel = (s) => (s >= 10 && s < 11 ? 0.5 * Math.PI ** 2 * Math.cos(Math.PI * (s - 10)) : 0); // its second derivative
  const bias = 0.2;
  const baroErr = [], fusedErr = [];
  let worstOnLift = 0;
  for (let i = 0; i < 20 / DT; i++) {
    const s = i * DT;
    const hb = lift(s) + BARO_NOISE_M * Math.sqrt(3) * rnd(); // uniform with that RMS
    const r = f.update(accel(s) + bias, hb, DT);
    if (s > 5) { baroErr.push(hb - lift(s)); fusedErr.push(r.h - lift(s)); }
    if (s >= 10 && s < 12) worstOnLift = Math.max(worstOnLift, Math.abs(r.h - lift(s)));
  }
  assert.ok(rms(fusedErr) < rms(baroErr) / 2, `fused RMS ${rms(fusedErr)} m vs the barometer's ${rms(baroErr)} m`);
  assert.ok(worstOnLift < 0.1, `fused ${worstOnLift} m off the lift at worst`);
  assert.ok(Math.abs(f.b - bias) < 0.05, `learned b ${f.b} of ${bias}`);
});

test('reset: back to the barometer\'s height, no speed or offset kept', () => {
  const f = new HeightFilter(2);
  for (let i = 0; i < 100; i++) f.update(1, 5, DT);
  f.reset();
  const r = f.update(0, 3, DT);
  assert.equal(r.h, 3);
  assert.equal(r.v, 0);
  assert.equal(r.b, 0);
  assert.deepEqual(new HeightFilter(2).gains, { k1: 1.5, k2: 0.75, k3: 0.125 });
});
