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
  assert.deepEqual(find('sht41'), ['/sht4x']);
  assert.deepEqual(find('htu21'), ['/htu21d']);
  assert.deepEqual(find('gy-271'), ['/qmc5883l']);
});

test('by type, group, maker, what it measures', () => {
  assert.deepEqual(find('humidity'), ['/sht20', '/sht3x', '/aht21', '/sht4x', '/htu21d', '/hdc1080', '/cht8305']);
  assert.ok(find('motion').includes('/hmc5883l'));
  assert.deepEqual(find('magnetometer'), ['/hmc5883l', '/qmc5883l']);
  assert.deepEqual(find('lux'), ['/opt3001']);
  assert.deepEqual(find('proximity'), ['/ap3216c']);
  assert.deepEqual(find('sensirion'), ['/sht20', '/sht3x', '/sht4x', '/sgp40']);
  assert.deepEqual(find('pulse'), ['/max30102', '/max30100']);
  assert.deepEqual(find('heartbeat'), ['/max30102', '/max30100']);
});

test('by I2C address, a range counting each in it', () => {
  assert.deepEqual(addressesOf('I2C 0x68 / 0x69'), [0x68, 0x69]);
  assert.equal(addressesOf('I2C 0x40-0x4F').length, 16);
  assert.deepEqual(find('0x38'), ['/aht21', '/bh1745']);
  assert.deepEqual(find('0x44'), ['/sht3x', '/sht4x', '/cht8305', '/opt3001', '/ina231']);
  assert.deepEqual(find('0x0D'), ['/qmc5883l']);
  assert.deepEqual(find('0x40'), ['/sht20', '/htu21d', '/hdc1080', '/cht8305', '/ina231']);
  assert.deepEqual(find('0x48'), ['/cht8305', '/lm75', '/ina231']);
});

test('every word must match', () => {
  assert.deepEqual(find('humidity 0x44'), ['/sht3x', '/sht4x', '/cht8305']);
  assert.deepEqual(find('humidity zzz'), []);
});
