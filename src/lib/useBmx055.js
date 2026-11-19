// A Bosch BMX055 on the bridge, for a page: three chips in one package, each
// found by its chip ID — the accelerometer at 0x18 or 0x19, the gyro at 0x68
// or 0x69 (an MPU-6050 there is told apart), the magnetometer at 0x10-0x13
// (asleep, its chip ID reads only once woken) — and set up by atiic's
// drivers: +/-4 g, +/-500 deg/s, the field at its 10 Hz. The accelerometer
// and the gyro read every READ_MS, the magnetometer every MAG_MS; each gyro
// reading to onGyro's listeners (a page adds the turns up: lib/useTurned.js),
// each field to onMag's (the board's own field taken off: lib/useHardIron.js),
// turned into the accelerometer's axes, as the package's three share none.
// The module's PS pin must be high, or it isn't on I2C at all.
import { perFrame } from './frame.js';
import { ref, onBeforeUnmount } from 'vue';
import { Bmx055Accel, Bmx055Gyro, Bmx055Mag } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';
import { bmx055Field } from './sources.js';

const SCL_HZ = 400000; // all three chips' fast mode
const READ_MS = 10; // accelerometer and gyro: 100 reads a second
const MAG_MS = 100; // the magnetometer's 10 Hz: reading faster repeats the sample
const ACCEL_SCALE = '4'; // +/-4 g
const GYRO_SCALE = '500'; // +/-500 deg/s

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useBmx055({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const addresses = ref(null); // { accel, gyro, mag }
  const latest = ref(null); // { accel: {x,y,z} g, gyro: {x,y,z} deg/s, temperature C }
  const publish = perFrame((v) => { latest.value = v; }); // once a frame, the newest
  const accelSeries = makeSeries(3, windowMs);
  const gyroSeries = makeSeries(3, windowMs);
  const gyroListeners = new Set();
  const magListeners = new Set();
  // fn(t ms, [x, y, z]) on each reading: deg/s, uT
  const onGyro = (fn) => { gyroListeners.add(fn); return () => gyroListeners.delete(fn); };
  const onMag = (fn) => { magListeners.add(fn); return () => magListeners.delete(fn); };

  let bus = null;
  let accel = null;
  let gyro = null;
  let mag = null;
  let generation = 0;

  // the first of a chip's addresses that answers with its chip ID
  async function find(Chip) {
    const { chip } = Chip;
    for (const a of Chip.addresses) {
      if (!(await bus.acks(a))) continue;
      if (chip.idWake) {
        await bus.write(a, chip.idWake);
        await delay(chip.idWakeMs);
      }
      const [id] = await bus.writeRead(a, [chip.idRegister], 1);
      if (id === chip.whoAmI) return a;
    }
    return null;
  }

  async function loop(gen) {
    let magDue = 0;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { accelerometers: a, temperature } = await accel.measure();
        const { gyroscopes: g } = await gyro.measure();
        accelSeries.push(t0, [a.x, a.y, a.z]);
        gyroSeries.push(t0, [g.x, g.y, g.z]);
        for (const fn of gyroListeners) fn(t0, [g.x, g.y, g.z]);
        publish.push({ accel: a, gyro: g, temperature });
        if (t0 >= magDue) {
          magDue = t0 + MAG_MS;
          const { magnetometers: m } = await mag.measure();
          // an axis that overflowed reads null: that sample is left out. The
          // field turned into the accelerometer's and gyro's axes (sources.js)
          if (m.x !== null && m.y !== null && m.z !== null) {
            const f = bmx055Field(m);
            for (const fn of magListeners) fn(t0, f);
          }
        }
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the BMX055 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function connect(via = 'usb') {
    failure.value = null;
    state.value = 'connecting';
    try {
      bus = await openDongle(SCL_HZ, via);
    } catch (e) {
      failure.value = { ...explain(e, platform), error: e.message };
      state.value = 'idle';
      return;
    }
    try {
      const found = { accel: await find(Bmx055Accel), gyro: await find(Bmx055Gyro), mag: await find(Bmx055Mag) };
      const missing = Object.entries(found).filter(([, a]) => a === null).map(([k]) => k);
      if (missing.length === 3) {
        failure.value = { title: 'No BMX055 answers', detail: 'None of its three chips reads its ID. Is its PS pin high (to 3V3, or a Dart\'s IO2)? Floating or low, the module is on SPI and answers nothing on I2C. Then the four wires and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      if (missing.length) {
        const where = { accel: Bmx055Accel, gyro: Bmx055Gyro, mag: Bmx055Mag };
        failure.value = { title: `The BMX055's ${missing.join(' and ')} didn't answer`, detail: `${missing.map((k) => `${k} at ${where[k].addresses.map(hex).join(', ')}`).join('; ')}. If its PS pin was low or floating while it powered up, the accelerometer stays on SPI: tie PS high and power the module off and on.`, error: '' };
        await disconnect();
        return;
      }
      addresses.value = found;
      accel = new Bmx055Accel(bus, found.accel);
      gyro = new Bmx055Gyro(bus, found.gyro);
      mag = new Bmx055Mag(bus, found.mag);
      await accel.init(ACCEL_SCALE);
      await gyro.init(GYRO_SCALE);
      await mag.init();
      accelSeries.clear();
      gyroSeries.clear();
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The BMX055 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    accel = null;
    gyro = null;
    mag = null;
    state.value = 'idle';
    try {
      await b?.close();
    } catch {
      // gone already
    }
  }

  function onUsbDisconnect(e) {
    if (bus && e.device === bus.device) {
      failure.value = { title: 'The bridge was unplugged', detail: '', error: '' };
      disconnect();
    }
  }
  if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
  onBeforeUnmount(() => {
    if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
    disconnect();
  });

  return {
    state, failure, addresses, latest,
    accelSource: accelSeries.source, gyroSource: gyroSeries.source,
    onGyro, onMag, connect, disconnect,
  };
}
