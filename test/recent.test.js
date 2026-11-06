// the recent device pages: newest first, no repeats, at most four, device
// pages only; and how long ago, in words. No localStorage under node: the
// list lives for the test's life, as it would with storage blocked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recent, record, clearRecent, ago } from '../src/lib/recent.js';

test('keeps the device pages opened, newest first, each once, four at most', () => {
  clearRecent();
  for (const p of ['/adxl345', '/hmc5883l', '/itg3200', '/adxl345', '/vl53l1x', '/sht20']) record(p);
  assert.deepEqual(recent.value.map((r) => r.to), ['/sht20', '/vl53l1x', '/adxl345', '/itg3200']);
});

test('ignores pages that aren\'t device pages', () => {
  clearRecent();
  for (const p of ['/', '/about', '/get-started', '/learn/imu', '/learn/imu/tilt', '/no-such-page']) record(p);
  assert.deepEqual(recent.value, []);
});

test('clears', () => {
  record('/max30102');
  clearRecent();
  assert.deepEqual(recent.value, []);
});

test('says how long ago in words', () => {
  const now = Date.UTC(2026, 10, 6, 12);
  assert.equal(ago(now - 20e3, now), 'just now');
  assert.equal(ago(now - 5 * 60e3, now), '5 min ago');
  assert.equal(ago(now - 3 * 3600e3, now), '3 h ago');
  assert.equal(ago(now - 26 * 3600e3, now), 'yesterday');
  assert.equal(ago(now - 4 * 86400e3, now), '4 days ago');
});
