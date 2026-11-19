// lib/fusion.js's Mahony with a magnetometer: the board turned by yaw,
// pitch and roll in a room (X north, Y west, Z up; the field north, dipping
// DIP), read in its own axes, as test/compass.test.js. The compass steers
// the heading to north, and only the heading; and the integral learns the
// gyro's offset about the vertical too
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mahony } from '../src/lib/fusion.js';

const R = Math.PI / 180;
const DIP = 55;
const FIELD = [50 * Math.cos(DIP * R), 0, -50 * Math.sin(DIP * R)];
const UP = [0, 0, 1];
const rx = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const ry = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const rz = (a) => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const inBoard = (M, v) => [0, 1, 2].map((j) => M[0][j] * v[0] + M[1][j] * v[1] + M[2][j] * v[2]);
const board = (heading, pitch = 0, roll = 0) => mul(mul(rz(-heading * R), ry(pitch * R)), rx(roll * R));
const read = (M) => ({ up: inBoard(M, UP), b: inBoard(M, FIELD) });
const angleApart = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
const DT = 0.02;

test('started with the field: the yaw is the heading at once, tilted or not', () => {
  for (const h of [0, 40, 135, 200, 300]) {
    for (const [pitch, roll] of [[0, 0], [20, -15], [-35, 30]]) {
      const { up, b } = read(board(h, pitch, roll));
      const m = new Mahony().level(up, b);
      assert.ok(angleApart(m.angles().yaw, h) < 1e-6, `heading ${h}, pitch ${pitch}, roll ${roll}: yaw ${m.angles().yaw}`);
    }
  }
});

test('started without it, the compass pulls the yaw round to the heading, roll and pitch untouched', () => {
  const { up, b } = read(board(120, 15, -20));
  const m = new Mahony().level(up); // heading 0: 120 degrees out
  const { roll, pitch } = m.angles();
  for (let i = 0; i < 3000; i++) m.update(up, [0, 0, 0], DT, b); // a minute
  const a = m.angles();
  assert.ok(angleApart(a.yaw, 120) < 0.5, `yaw ${a.yaw}`);
  assert.ok(Math.abs(a.roll - roll) < 1e-6 && Math.abs(a.pitch - pitch) < 1e-6, 'roll and pitch moved');
});

test('a gyro reading 1 deg/s about z while still: with the compass the yaw holds and the offset is learned', () => {
  const { up, b } = read(board(70));
  const m = new Mahony().level(up, b);
  for (let i = 0; i < 6000; i++) m.update(up, [0, 0, 1], DT, b); // 2 minutes
  assert.ok(angleApart(m.angles().yaw, 70) < 0.5, `yaw ${m.angles().yaw}`);
  assert.ok(Math.abs(m.learnedOffset()[2] - 1) < 0.05, `learned ${m.learnedOffset()}`);
});

test('without the compass the same offset walks the yaw away', () => {
  const { up } = read(board(70));
  const m = new Mahony().level(up);
  for (let i = 0; i < 6000; i++) m.update(up, [0, 0, 1], DT);
  assert.ok(angleApart(m.angles().yaw, 0) > 60, `yaw ${m.angles().yaw}`);
});
