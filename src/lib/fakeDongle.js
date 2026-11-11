// A bridge that isn't there, to drive the live pages without hardware (the
// ?perf meter and bench/ measure them so): ?fake (a calm sway) or ?fake=kid
// (shaken hard, as a child would), never on i2c.ninja (lib/dongle.js). It
// answers as atiic's bus does, with an MPU-6050 at 0x68 on it: WHO_AM_I,
// the config writes kept (so the ranges the driver sets are the ones it
// encodes with), and the 14 data bytes made from a motion: the gyro its
// rates, the accelerometer gravity in the board's axes plus, shaken, the
// shake. Each bus call takes about a USB round trip.
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
};

const wave = (terms, s, phase) => terms.reduce((v, [amp, hz], i) => v + amp * Math.sin(2 * Math.PI * hz * s + phase + i), 0);
const rateOf = (terms, s, phase) => terms.reduce((v, [amp, hz], i) => v + amp * 2 * Math.PI * hz * Math.cos(2 * Math.PI * hz * s + phase + i), 0);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class FakeDongle {
  constructor(mode = 'calm') {
    this.motion = MOTIONS[mode] ?? MOTIONS.calm;
    this.regs = new Uint8Array(128);
    this.regs[REG_WHO_AM_I] = WHO_AM_I;
    this.device = { fake: true };
    this.t0 = performance.now();
  }

  async close() {}
  async scan() { await delay(ROUND_TRIP_MS); return [ADDRESS]; }
  async acks(address) { await delay(ROUND_TRIP_MS); return address === ADDRESS; }

  async write(address, bytes) {
    await delay(ROUND_TRIP_MS);
    if (address !== ADDRESS) throw new Error(`no ack from 0x${address.toString(16)}`);
    const [reg, ...data] = bytes;
    data.forEach((b, i) => { this.regs[reg + i] = b; }); // auto-increment, as the chip
  }

  async read(address, n) { return this.writeRead(address, [], n); }

  async writeRead(address, bytes, n) {
    await delay(ROUND_TRIP_MS);
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
    const accel = [-Math.sin(pitch) + jolt(), Math.sin(roll) * Math.cos(pitch) + jolt(), Math.cos(roll) * Math.cos(pitch) + jolt()];
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
