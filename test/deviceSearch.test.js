// /devices' quick filter (lib/deviceSearch.js), on the real device list
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEVICES } from '../src/lib/devices.js';
import { matches, addressesOf } from '../src/lib/deviceSearch.js';

const find = (q) => DEVICES.filter((d) => matches(d, q)).map((d) => d.to);

test('an empty query shows them all', () => {
  assert.equal(find('').length, DEVICES.length);
  assert.equal(find('   ').length, DEVICES.length);
});

test('by name, ignoring case, spaces and dashes', () => {
  assert.deepEqual(find('mpu 6050'), ['/mpu6050']);
  assert.deepEqual(find('MPU-6500'), ['/mpu6050']);
  assert.deepEqual(find('bh1745'), ['/bh1745']);
});

test('by a short address (alias)', () => {
  assert.deepEqual(find('sht31'), ['/sht3x']);
  assert.deepEqual(find('AHT30'), ['/aht21']);
  assert.deepEqual(find('spl06-001'), ['/spl06']);
});

test('by type, group, maker, what it measures', () => {
  assert.deepEqual(find('humidity'), ['/sht20', '/sht3x', '/aht21']);
  assert.ok(find('motion').includes('/hmc5883l'));
  assert.deepEqual(find('sensirion'), ['/sht20', '/sht3x']);
  assert.deepEqual(find('heartbeat'), ['/max30102']);
});

test('by I2C address, a range counting each in it', () => {
  assert.deepEqual(addressesOf('I2C 0x68 / 0x69'), [0x68, 0x69]);
  assert.equal(addressesOf('I2C 0x40-0x4F').length, 16);
  assert.deepEqual(find('0x38'), ['/aht21', '/bh1745']);
  assert.deepEqual(find('0x44'), ['/sht3x', '/ina231']);
  assert.deepEqual(find('0x40'), ['/sht20', '/ina231']);
});

test('every word must match', () => {
  assert.deepEqual(find('humidity 0x44'), ['/sht3x']);
  assert.deepEqual(find('humidity zzz'), []);
});
