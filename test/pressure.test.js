// the pressure formulas against the standard atmosphere's table values
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isaHeight, isaPressure, heightAbove, density, pascalsPerMetre, P0_PA } from '../src/lib/pressure.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);

// the formula's heights are geopotential, the tables' geometric: they part
// by gravity's fall with height, a few metres at 5 km (540.20 against the
// table's 540.48 hPa there), under 0.2 m at 1 km
test('ISA: 1013.25 hPa at sea level, 898.76 hPa at 1000 m (the ISA table), and back', () => {
  near(isaHeight(P0_PA), 0, 1e-9);
  near(isaPressure(1000), 89876, 5);
  near(isaHeight(isaPressure(3000)), 3000, 1e-6);
});

test('sea-level air: 1.225 kg/m3, 12.0 Pa a metre', () => {
  near(density(P0_PA, 15), 1.225, 0.001);
  near(pascalsPerMetre(P0_PA, 15), 12.01, 0.01);
});

test('a height difference: 11.8 Pa less is a metre up at 20 C; none for the same pressure', () => {
  near(heightAbove(P0_PA - 11.81, P0_PA, 20), 1, 0.01);
  near(heightAbove(P0_PA, P0_PA, 20), 0, 1e-12);
  assert.ok(heightAbove(P0_PA + 10, P0_PA, 20) < 0);
});
