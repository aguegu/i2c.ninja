// lib/fakeBmp280.js on the fake bridge (lib/fakeDongle.js): atiic's Bmp280
// driver, unchanged, reads it in normal mode: the reference pressure at
// height 0, 25.08 C; the raw count it makes maps back to the pressure asked
// within a fraction of a pascal, across the BMP280's room-air range
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bmp280 } from 'atiic';
import { FakeDongle } from '../src/lib/fakeDongle.js';
import { FakeBmp280 } from '../src/lib/fakeBmp280.js';

test('atiic\'s Bmp280 on the fake bridge: found at 0x76, normal mode, 1010 hPa and 25.08 C at rest', async () => {
  const bus = new FakeDongle('still');
  assert.ok(await Bmp280.chip.identify(bus, 0x76));
  const s = new Bmp280(bus, 0x76);
  await s.init({ pressure: 8, temperature: 1, mode: 'normal', standbyMs: 0.5 });
  const r = [];
  for (let i = 0; i < 20; i++) r.push(await s.measure());
  const mean = r.reduce((x, y) => x + y.pressure, 0) / r.length;
  assert.ok(Math.abs(mean - 101000) < 3, `${mean} Pa`);
  assert.equal(r[0].temperature, 25.08);
});

test('countFor: the raw count compensates back to the pressure within 0.3 Pa, 950 to 1050 hPa', () => {
  const f = new FakeBmp280();
  for (let pa = 95000; pa <= 105000; pa += 1250) {
    const back = Bmp280.compensate(Bmp280.calibration(f.regs.slice(0x88, 0x88 + 24)), f.countFor(pa), 519888).pressure;
    assert.ok(Math.abs(back - pa) < 0.3, `${pa} Pa -> ${back} Pa`);
  }
});
