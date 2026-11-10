// speed and acceleration fitted from distances: exact on lines and
// parabolas, a free fall's g back from its readings, and the noise each
// fit leaves
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitPolynomial, makeMotion } from '../src/lib/motion.js';

const G = 9.81;
const DT_MS = 33;

test('a line: its slope, at the middle', () => {
  const ts = [0, 1, 2, 3, 4];
  const f = fitPolynomial(ts, ts.map((t) => 3 + 2 * t), 1);
  assert.equal(f.tm, 2);
  assert.ok(Math.abs(f.c[0] - 7) < 1e-9 && Math.abs(f.c[1] - 2) < 1e-9);
});

test('a parabola: its x² term', () => {
  const ts = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
  const f = fitPolynomial(ts, ts.map((t) => 1 - 0.5 * t + 4 * t * t), 2);
  assert.ok(Math.abs(f.c[2] - 4) < 1e-9, `${f.c[2]}`);
});

test('too few points: null', () => {
  assert.equal(fitPolynomial([0, 1], [0, 1], 2), null);
});

test('a free fall in mm every 33 ms: g and the speed back', () => {
  const m = makeMotion();
  let out;
  for (let i = 0; i < 12; i++) {
    const t = i * DT_MS;
    out = m.push(t, 200 + 0.5 * G * (t / 1000) ** 2 * 1000);
  }
  assert.ok(Math.abs(out.acceleration.a - G) < 1e-6, `${out.acceleration.a}`);
  const tv = out.speed.t / 1000;
  assert.ok(Math.abs(out.speed.v - G * tv) < 1e-6, `${out.speed.v} at ${tv} s`);
});

test('noise: 1 mm on still readings leaves under 0.1 m/s and under 3 m/s² (5 and 9 points, 33 ms)', () => {
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand());
  const m = makeMotion();
  const vs = [], as = [];
  for (let i = 0; i < 2000; i++) {
    const o = m.push(i * DT_MS, 1000 + gauss());
    if (o.speed) vs.push(o.speed.v);
    if (o.acceleration) as.push(o.acceleration.a);
  }
  const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length);
  assert.ok(rms(vs) < 0.1, `speed rms ${rms(vs)}`);
  assert.ok(rms(as) < 3, `acceleration rms ${rms(as)}`);
});
