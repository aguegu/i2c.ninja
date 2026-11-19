// lib/compass.js: a known field and gravity in the room (X north, Y west, Z
// up; the field north and dipping DIP below level), the board turned by
// yaw, pitch and roll, and what it would read in its own axes: the
// tilt-compensated heading is the yaw whatever the tilt, the dip the same;
// the level-only heading isn't, once tilted
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compass, levelHeading } from '../src/lib/compass.js';

const R = Math.PI / 180;
const DIP = 55; // degrees, as across much of China
const FIELD = [50 * Math.cos(DIP * R), 0, -50 * Math.sin(DIP * R)]; // uT, room axes
const UP = [0, 0, 1]; // g, a still accelerometer's reading, room axes

const rx = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const ry = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const rz = (a) => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
// a room vector in the board's axes, the board turned by R (board to room)
const inBoard = (M, v) => [0, 1, 2].map((j) => M[0][j] * v[0] + M[1][j] * v[1] + M[2][j] * v[2]);
// heading clockwise from north (seen from above): a turn of -heading about up
const board = (heading, pitch = 0, roll = 0) => mul(mul(rz(-heading * R), ry(pitch * R)), rx(roll * R));
const read = (M) => ({ up: inBoard(M, UP), b: inBoard(M, FIELD) });
const angleApart = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

test('level, facing north: heading 0, the dip as set, both ways the same', () => {
  const { up, b } = read(board(0));
  const c = compass(up, b);
  assert.ok(angleApart(c.heading, 0) < 1e-9);
  assert.ok(Math.abs(c.dip - DIP) < 1e-9);
  assert.ok(angleApart(levelHeading(b), 0) < 1e-9);
});

test('level, turned: the heading is the turn, clockwise from north', () => {
  for (const h of [30, 90, 180, 270, 315]) {
    const { up, b } = read(board(h));
    assert.ok(angleApart(compass(up, b).heading, h) < 1e-9, `heading ${h}`);
    assert.ok(angleApart(levelHeading(b), h) < 1e-9, `level-only ${h}`);
  }
});

test('tilted every way: the compensated heading and the dip hold', () => {
  for (const h of [0, 45, 120, 250]) {
    for (const [pitch, roll] of [[20, 0], [0, 25], [-30, 15], [40, -35]]) {
      const { up, b } = read(board(h, pitch, roll));
      const c = compass(up, b);
      assert.ok(angleApart(c.heading, h) < 1e-9, `heading ${h}, pitch ${pitch}, roll ${roll}: ${c.heading}`);
      assert.ok(Math.abs(c.dip - DIP) < 1e-9, `dip at heading ${h}, pitch ${pitch}, roll ${roll}`);
    }
  }
});

test('the level-only heading goes wrong tilted: 10 degrees sideways facing north, about 14 off', () => {
  const { up, b } = read(board(0, 0, 10));
  assert.ok(angleApart(compass(up, b).heading, 0) < 1e-9);
  const off = angleApart(levelHeading(b), 0);
  assert.ok(Math.abs(off - 14) < 0.5, `off by ${off.toFixed(2)}`);
});

test('no heading with the nose straight up, or with no gravity to level by', () => {
  const { up, b } = read(board(0, 90, 0));
  assert.equal(compass(up, b).heading, null);
  assert.equal(compass([0, 0, 0.05], [30, 0, -40]).heading, null);
});

test('apart: signed, -180 to 180, for any two headings, unwrapped ones too', async () => {
  const { apart } = await import('../src/lib/compass.js');
  for (const [a, b, want] of [[10, 350, 20], [350, 10, -20], [10, 725, 5], [-700, 10, 10], [180, 0, -180], [90, 90, 0]]) {
    assert.ok(Math.abs(apart(a, b) - want) < 1e-9, `apart(${a}, ${b}) = ${apart(a, b)}, not ${want}`);
  }
});
