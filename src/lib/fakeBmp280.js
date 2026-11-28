// The fake bridge's BMP280 (lib/fakeDongle.js), at 0x76: its chip ID, a
// calibration (the example values widely quoted from Bosch, atiic's host
// test's), status always idle, and its 6 result bytes made from a height:
// the pressure that far above REFERENCE_PA (the hypsometric equation at its
// temperature, lib/pressure.js), with a BMP280's noise at 8 times
// oversampling (1.6 Pa RMS, Bosch's Table 8), turned into the raw count
// Bosch's compensation (atiic's) maps to it: the driver's whole path runs.
import { Bmp280 } from 'atiic';
import { M_AIR, G, R_GAS, KELVIN } from './pressure.js';

export const ADDRESS = 0x76;
const CHIP_ID = 0x58;
const REG_CALIB = 0x88, REG_ID = 0xd0, REG_DATA = 0xf7;
const CALIB = { t1: 27504, t2: 26435, t3: -1000, p1: 36477, p2: -10685, p3: 3024, p4: 2855, p5: 140, p6: -7, p7: 15500, p8: -14600, p9: 6000 };
const ADC_T = 519888; // 25.08 C with CALIB
const REFERENCE_PA = 101000; // at height 0
const NOISE_PA = 1.6;
const ADC_MAX = (1 << 20) - 1;

const calibBytes = (c) => [c.t1, c.t2, c.t3, c.p1, c.p2, c.p3, c.p4, c.p5, c.p6, c.p7, c.p8, c.p9]
  .flatMap((v) => { const u = v < 0 ? v + 0x10000 : v; return [u & 0xff, u >> 8]; });
// a normal-ish noise, RMS 1: the sum of four uniforms, scaled
const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) * Math.sqrt(3);

export class FakeBmp280 {
  constructor() {
    this.regs = new Uint8Array(0x100);
    this.regs[REG_ID] = CHIP_ID;
    this.regs.set(calibBytes(CALIB), REG_CALIB);
    this.temperature = Bmp280.compensate(CALIB, 0, ADC_T).temperature;
  }

  write([reg, ...data]) {
    data.forEach((b, i) => { this.regs[reg + i] = b; });
  }

  // n bytes from reg; the results from the height h (m) now
  read(reg, n, h) {
    if (reg === REG_DATA) return this.data(n, h);
    return this.regs.slice(reg, reg + n);
  }

  // the raw pressure count for pa: compensation falls as the count rises,
  // so halved down to the count
  countFor(pa) {
    let lo = 0, hi = ADC_MAX;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (Bmp280.compensate(CALIB, mid, ADC_T).pressure > pa) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  data(n, h) {
    const pa = REFERENCE_PA * Math.exp((-h * M_AIR * G) / (R_GAS * (this.temperature + KELVIN))) + NOISE_PA * gauss();
    const p = this.countFor(pa), t = ADC_T;
    const out = new Uint8Array([p >> 12, (p >> 4) & 0xff, (p & 0x0f) << 4, t >> 12, (t >> 4) & 0xff, (t & 0x0f) << 4]);
    return out.slice(0, n);
  }
}
