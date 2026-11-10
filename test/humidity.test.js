// the humidity formulas against textbook values: the saturation vapour
// pressure at 20 C (steam tables: 2.3392 kPa), saturated air's water at
// 20 C (17.3 g/m3), the dew point of 20 C at 50 % (9.3 C). The Magnus
// formula is an approximation: 23.33 hPa at 20 C, 0.3 % under the tables
const MAGNUS = 0.004; // its error here, as a fraction
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saturation, vapourPressure, absoluteHumidity, dewPoint } from '../src/lib/humidity.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);

test('saturation: 6.112 hPa at 0 C; 23.39 at 20 C and 42.47 at 30 C, within Magnus\'s error', () => {
  near(saturation(0), 6.112, 1e-9);
  near(saturation(20), 23.39, 23.39 * MAGNUS);
  near(saturation(30), 42.47, 42.47 * MAGNUS);
});

test('vapour pressure: rh % of the saturation', () => {
  near(vapourPressure(20, 50), saturation(20) / 2, 1e-9);
});

test('absolute humidity: 17.3 g/m3 in saturated air at 20 C, half at 50 %', () => {
  near(absoluteHumidity(20, 100), 17.3, 17.3 * MAGNUS);
  near(absoluteHumidity(20, 50), absoluteHumidity(20, 100) / 2, 1e-9);
});

test('dew point: 9.3 C for 20 C at 50 %; the air temperature at 100 %; the same water warmed keeps it', () => {
  near(dewPoint(20, 50), 9.3, 0.05);
  near(dewPoint(25, 100), 25, 1e-9);
  // 20 C at 50 % warmed to 25 C: the same vapour pressure, a lower rh, the same dew point
  const rh25 = (vapourPressure(20, 50) / saturation(25)) * 100;
  near(dewPoint(25, rh25), dewPoint(20, 50), 1e-9);
});
