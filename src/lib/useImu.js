// An MPU-6050 or MPU-6500 on the CH341 dongle, for a page: connect, pick
// atiic's driver by WHO_AM_I, set the scales, read it once a sample period,
// keep the last windowMs for the charts. Each reading keeps every stage:
// the 14 bytes the chip sent, the counts they hold, and the counts in g,
// deg/s and degrees C (by the driver's own sensitivities and formula).
//
// Read once a sample period: the chip refreshes its data registers at its
// sample rate (62.5 Hz with atiic's settings), so reading faster only
// repeats the last sample.
import { ref, onBeforeUnmount } from 'vue';
import { Mpu6050, Mpu6500 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';

export const DRIVERS = [Mpu6050, Mpu6500];
export const SCALES = { gyroscope: Mpu6050.gyroscopeScales, accelerometer: Mpu6050.accelerometerScales };
export const ADDRESSES = Mpu6050.addresses;
export const REG_DATA = 0x3b; // ACCEL_XOUT_H: accel x y z, temp, gyro x y z, each 2 bytes, high first
export const DATA_BYTES = 14;
const SCL_HZ = 400000; // fast mode, both chips' rated top on I2C
const REG_WHO_AM_I = 0x75;
const SAMPLE_MS = 16; // atiic's sample rate, 62.5 Hz
const RATE_EVERY_MS = 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useImu({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null); // { title, detail, error }
  const address = ref(ADDRESSES[0]);
  const chipName = ref(null); // the chip found, by its WHO_AM_I
  const chip = ref(null); // its facts (atiic's Driver.chip): tempLsb, tempOffset, ...
  const found = ref([]);
  const gyroscopeScale = ref('500');
  const accelerometerScale = ref('4');
  // { bytes, counts: [ax, ay, az, t, gx, gy, gz], accel: [x, y, z] g,
  //   gyro: [x, y, z] deg/s, temperature C, accelLsb: counts a g,
  //   gyroLsb: counts a deg/s }
  const latest = ref(null);
  const rate = ref(0);

  let bus = null;
  let mpu = null;
  let generation = 0; // a new one stops the loop running before it
  let reads = 0;
  let rateFrom = 0;

  // the charts' buffers: plain arrays, read each frame, not reactive
  const buf = { t: [], accel: [[], [], []], gyro: [[], [], []] };
  // called on each reading as it comes, (t ms, accel g, gyro deg/s): for a
  // page that works per reading (integrating, filtering), not per frame
  const listeners = new Set();
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  function push(bytes) {
    const now = performance.now();
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const counts = Array.from({ length: DATA_BYTES / 2 }, (_, i) => v.getInt16(2 * i)); // big-endian
    const accel = counts.slice(0, 3).map((c) => c / mpu.accelerometerSensitivity);
    const gyro = counts.slice(4, 7).map((c) => c / mpu.gyroscopeSensitivity);
    buf.t.push(now);
    accel.forEach((a, k) => buf.accel[k].push(a));
    gyro.forEach((g, k) => buf.gyro[k].push(g));
    let old = 0;
    while (old < buf.t.length && buf.t[old] < now - windowMs - RATE_EVERY_MS) old++;
    if (old) {
      buf.t.splice(0, old);
      for (const y of [...buf.accel, ...buf.gyro]) y.splice(0, old);
    }
    for (const fn of listeners) fn(now, accel, gyro);
    latest.value = {
      bytes, counts, accel, gyro, temperature: mpu.temperature(counts[3]),
      accelLsb: mpu.accelerometerSensitivity, gyroLsb: mpu.gyroscopeSensitivity,
    };
    reads++;
    if (now - rateFrom >= RATE_EVERY_MS) {
      rate.value = (reads * 1000) / (now - rateFrom);
      reads = 0;
      rateFrom = now;
    }
  }

  async function loop(gen) {
    rateFrom = performance.now();
    reads = 0;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        push(await bus.writeRead(mpu.address, [REG_DATA], DATA_BYTES));
        await delay(Math.max(0, SAMPLE_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${chipName.value} failed`, detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function start() {
    generation++;
    await mpu.init(gyroscopeScale.value, accelerometerScale.value);
    loop(generation);
  }

  // the driver for the chip at addr, by its WHO_AM_I
  async function attach(addr) {
    const [who] = await bus.writeRead(addr, [REG_WHO_AM_I], 1);
    const Driver = DRIVERS.find((D) => D.chip.whoAmI === who);
    if (!Driver) {
      throw new Error(`${hex(addr)} reads WHO_AM_I ${hex(who)}: ${DRIVERS.map((D) => `an ${D.chip.name} reads ${hex(D.chip.whoAmI)}`).join(', ')}`);
    }
    chipName.value = Driver.chip.name;
    chip.value = Driver.chip;
    return new Driver(bus, addr);
  }

  async function connect() {
    failure.value = null;
    state.value = 'connecting';
    try {
      bus = await openDongle(SCL_HZ);
    } catch (e) {
      failure.value = { ...explain(e, platform), error: e.message };
      state.value = 'idle';
      return;
    }
    try {
      found.value = (await bus.scan()).filter((a) => ADDRESSES.includes(a));
      if (!found.value.length) {
        failure.value = { title: 'No MPU-6050 or MPU-6500 answers', detail: 'Nothing at 0x68 or 0x69: check the four wires and that the board has power (the dongle\'s green jumper on 3V3).', error: '' };
        await disconnect();
        return;
      }
      if (!found.value.includes(address.value)) address.value = found.value[0];
      mpu = await attach(address.value);
      await start();
      state.value = 'running';
    } catch (e) {
      failure.value = { title: `The ${chipName.value ?? 'chip'} didn't start`, detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    state.value = 'idle';
    try {
      await mpu?.sleep();
    } catch {
      // gone already
    }
    mpu = null;
    try {
      await b?.close();
    } catch {
      // gone already
    }
  }

  // a new address or scale: the chip set up again, the charts kept
  async function reconfigure() {
    if (state.value !== 'running') return;
    try {
      if (mpu.address !== address.value) mpu = await attach(address.value);
      await start();
    } catch (e) {
      failure.value = { title: `The ${chipName.value ?? 'chip'} didn't take the new settings`, detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // a setting changed from a page: { address, gyroscopeScale, accelerometerScale }
  async function configure(change) {
    if ('address' in change) address.value = change.address;
    if ('gyroscopeScale' in change) gyroscopeScale.value = change.gyroscopeScale;
    if ('accelerometerScale' in change) accelerometerScale.value = change.accelerometerScale;
    await reconfigure();
  }

  function onUsbDisconnect(e) {
    if (bus && e.device === bus.device) {
      failure.value = { title: 'The dongle was unplugged', detail: '', error: '' };
      disconnect();
    }
  }
  if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
  onBeforeUnmount(() => {
    if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
    disconnect();
  });

  return {
    state, failure, address, chipName, chip, found, gyroscopeScale, accelerometerScale, latest, rate,
    accelSource: () => ({ t: buf.t, ys: buf.accel }),
    gyroSource: () => ({ t: buf.t, ys: buf.gyro }),
    connect, disconnect, configure, onReading,
  };
}
