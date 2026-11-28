// A bridge that isn't there, to drive the live pages without hardware (the
// ?perf meter and bench/ measure them so): ?fake (a calm sway), ?fake=kid
// (shaken hard, as a child would) ?fake=still (flat, not moving), ?fake=drop (dropped about 1 m every 5 s, a second still after each landing for the barometer) or ?fake=lift (lifted 1 m and back every 6 s), never on i2c.ninja (lib/dongle.js). It
// answers as atiic's bus does, with an MPU-6050 at 0x68 and a BMP280 at 0x76
// (lib/fakeBmp280.js: the pressure from the motion's height) on it: the MPU's WHO_AM_I,
// the config writes kept (so the ranges the driver sets are the ones it
// encodes with), and the 14 data bytes made from a motion: the gyro its
// rates, the accelerometer gravity in the board's axes plus, shaken, the
// shake. Each bus call takes about a USB round trip.
import { FakeBmp280, ADDRESS as BMP280_ADDRESS } from './fakeBmp280.js';
import { G } from './pressure.js';

const ADDRESS = 0x68;
const WHO_AM_I = 0x68;
const REG_GYRO_CONFIG = 0x1b, REG_ACCEL_CONFIG = 0x1c, REG_DATA = 0x3b, REG_WHO_AM_I = 0x75;
const ROUND_TRIP_MS = 1;
const ACCEL_LSB_2G = 16384, GYRO_LSB_250 = 131;
const D2R = Math.PI / 180;

// the motions: roll, pitch, yaw (degrees) as sums of sines, and a shake
const MOTIONS = {
  calm: { roll: [[25, 0.15]], pitch: [[15, 0.11]], yaw: [[40, 0.07]], shake: 0 },
  kid: { roll: [[70, 2.1], [20, 5.3]], pitch: [[50, 1.7], [15, 4.1]], yaw: [[120, 1.3], [30, 3.7]], shake: 0.8 },
  still: { roll: [], pitch: [], yaw: [], shake: 0 }, // flat and still: for the calibration's tests
  // flat, every 5 s: picked up over 1 s, held 1.5 s, 0.45 s of free fall (0
  // g, ½ g t² about 1 m), a 50 ms landing at 3 g, then lying there 2 s (so a
  // barometer sees the drop): for the drop timer's tests
  drop: { roll: [], pitch: [], yaw: [], shake: 0, drop: { every: 5, pick: 1, hold: 1.5, fall: 0.45, land: 0.05, peak: 3 } },
  // flat, lifted 1 m over 1 s, held 2 s, lowered over 1 s, held 2 s, again:
  // the accelerometer its upward acceleration plus an offset of 0.02 g (as a
  // module not calibrated), for the height page's tests
  lift: { roll: [], pitch: [], yaw: [], shake: 0, lift: { every: 6, move: 1, hold: 2, height: 1, offset: 0.02 } },
};

// the drop's phase at s, and its height (m, 0 held up, the fall's ½ g t²
// below once dropped) and upward acceleration (m/s^2) while picked up
function dropAt(d, s) {
  const u = s % d.every;
  const low = -0.5 * G * d.fall ** 2;
  if (u < d.pick) { // picked up from low, half a cosine
    const x = Math.PI * u / d.pick;
    return { phase: 'pick', h: low + 0.5 * -low * (1 - Math.cos(x)), a: 0.5 * -low * (Math.PI / d.pick) ** 2 * Math.cos(x) };
  }
  const f = u - d.pick - d.hold;
  if (f < 0) return { phase: 'hold', h: 0, a: 0 };
  if (f < d.fall) return { phase: 'fall', h: -0.5 * G * f ** 2, a: 0 };
  if (f < d.fall + d.land) return { phase: 'land', h: low, a: 0 };
  return { phase: 'low', h: low, a: 0 };
}

// the lift's height (m) and upward acceleration (m/s^2) at s: smooth moves
// (half a cosine) up and down, held between
function liftAt(l, s) {
  const u = s % l.every;
  const up = u < l.move, down = u >= l.move + l.hold && u < 2 * l.move + l.hold;
  if (!up && !down) return { h: u < l.move + l.hold ? l.height : 0, a: 0 };
  const x = Math.PI * (up ? u : u - l.move - l.hold) / l.move;
  const sign = up ? 1 : -1;
  return {
    h: up ? 0.5 * l.height * (1 - Math.cos(x)) : 0.5 * l.height * (1 + Math.cos(x)),
    a: sign * 0.5 * l.height * (Math.PI / l.move) ** 2 * Math.cos(x),
  };
}

const wave = (terms, s, phase) => terms.reduce((v, [amp, hz], i) => v + amp * Math.sin(2 * Math.PI * hz * s + phase + i), 0);
const rateOf = (terms, s, phase) => terms.reduce((v, [amp, hz], i) => v + amp * 2 * Math.PI * hz * Math.cos(2 * Math.PI * hz * s + phase + i), 0);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class FakeDongle {
  constructor(mode = 'calm') {
    this.isFake = true; // lib/bridge.js: the fake bridge
    this.motion = MOTIONS[mode] ?? MOTIONS.calm;
    this.regs = new Uint8Array(128);
    this.regs[REG_WHO_AM_I] = WHO_AM_I;
    this.device = { fake: true };
    this.t0 = performance.now();
    this.bmp280 = new FakeBmp280();
  }

  // the motion's height now, m (0 but on the lift)
  height() {
    const s = (performance.now() - this.t0) / 1000, m = this.motion;
    if (m.lift) return liftAt(m.lift, s).h;
    if (m.drop) return dropAt(m.drop, s).h;
    return 0;
  }

  async close() {}
  async scan() { await delay(ROUND_TRIP_MS); return [ADDRESS, BMP280_ADDRESS]; }
  async acks(address) { await delay(ROUND_TRIP_MS); return address === ADDRESS || address === BMP280_ADDRESS; }

  async write(address, bytes) {
    await delay(ROUND_TRIP_MS);
    if (address === BMP280_ADDRESS) { this.bmp280.write(bytes); return; }
    if (address !== ADDRESS) throw new Error(`no ack from 0x${address.toString(16)}`);
    const [reg, ...data] = bytes;
    data.forEach((b, i) => { this.regs[reg + i] = b; }); // auto-increment, as the chip
  }

  async read(address, n) { return this.writeRead(address, [], n); }

  async writeRead(address, bytes, n) {
    await delay(ROUND_TRIP_MS);
    if (address === BMP280_ADDRESS) return this.bmp280.read(bytes[0] ?? 0, n, this.height());
    if (address !== ADDRESS) throw new Error(`no ack from 0x${address.toString(16)}`);
    const reg = bytes[0] ?? 0;
    if (reg === REG_DATA) return this.data(n);
    return this.regs.slice(reg, reg + n);
  }

  // accel x y z, temperature, gyro x y z: int16 big-endian, at the set ranges
  data(n) {
    const s = (performance.now() - this.t0) / 1000, m = this.motion;
    const roll = wave(m.roll, s, 0) * D2R, pitch = wave(m.pitch, s, 1) * D2R;
    const rates = [rateOf(m.roll, s, 0), -rateOf(m.pitch, s, 1), -rateOf(m.yaw, s, 2)]; // deg/s about x, y, z
    const jolt = () => (Math.random() - 0.5) * 2 * m.shake;
    let accel = [-Math.sin(pitch) + jolt(), Math.sin(roll) * Math.cos(pitch) + jolt(), Math.cos(roll) * Math.cos(pitch) + jolt()];
    if (m.drop) {
      const d = dropAt(m.drop, s);
      if (d.phase === 'fall') accel = [0, 0, 0];
      else if (d.phase === 'land') accel = accel.map((a) => a * m.drop.peak);
      else accel[2] += d.a / G; // picked up: flat, the board's z is up
    }
    if (m.lift) accel[2] += liftAt(m.lift, s).a / G + m.lift.offset; // flat: the board's z is up
    const aLsb = ACCEL_LSB_2G >> ((this.regs[REG_ACCEL_CONFIG] >> 3) & 3);
    const gLsb = GYRO_LSB_250 / (1 << ((this.regs[REG_GYRO_CONFIG] >> 3) & 3));
    const clamp = (v) => Math.max(-32768, Math.min(32767, Math.round(v)));
    const words = [...accel.map((a) => a * aLsb), 0, ...rates.map((r) => r * gLsb)].map(clamp);
    const out = new Uint8Array(n);
    const v = new DataView(out.buffer);
    words.forEach((w, i) => { if (2 * i + 1 < n) v.setInt16(2 * i, w); });
    return out;
  }
}
