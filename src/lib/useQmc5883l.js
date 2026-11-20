// A QMC5883L on a bridge, for a page: found at 0x0D (its only ID, 0xFF at
// 0x0D), set up by atiic's driver (its continuous-mode example: OSR 512,
// +/-2 G, 50 Hz), read once a sample period, each reading to onReading's
// listeners (a page calibrates them: lib/useHardIron.js). It has no self test.
import { ref, onBeforeUnmount } from 'vue';
import { Qmc5883l } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';

const SCL_HZ = 400000; // its fast mode
export const RANGE = '2G'; // 12000 counts a gauss: Earth's field is under 0.65
export const RATE_HZ = 50;
const READ_MS = 1000 / RATE_HZ; // reading faster repeats the sample
const ADDRESS = 0x0d;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useQmc5883l() {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const latest = ref(null); // { x, y, z } uT as read (null: an axis overflowed)
  const listeners = new Set();
  // fn(t ms, [x, y, z] uT) on each reading (null: an axis overflowed)
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let bus = null;
  let mag = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { magnetometers: m } = await mag.measure();
        latest.value = m;
        for (const fn of listeners) fn(t0, [m.x, m.y, m.z]);
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the QMC5883L failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  function start() {
    generation++;
    loop(generation);
    state.value = 'running';
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
      if (!(await bus.acks(ADDRESS)) || !(await Qmc5883l.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No QMC5883L answers', detail: 'Nothing answers at 0x0D: check the four wires and the module\'s power. (A module answering at 0x1E carries a real HMC5883L: its own page reads it.)', error: '' };
        await disconnect();
        return;
      }
      mag = new Qmc5883l(bus, ADDRESS, { range: RANGE, rate: RATE_HZ });
      await mag.init();
      start();
    } catch (e) {
      failure.value = { title: 'The QMC5883L didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
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
    state, failure, latest,
    onReading, connect, disconnect,
  };
}
