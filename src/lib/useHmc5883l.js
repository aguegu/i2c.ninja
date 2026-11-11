// An HMC5883L on the CH341 bridge, for a page: found at 0x1E by its ID
// ("H43"), set up by atiic's driver (15 Hz, 8 samples averaged, +/-1.3 Ga),
// read once a sample period, each reading to onReading's listeners (a page
// calibrates them: lib/useHardIron.js); its self test on request, the
// reading paused meanwhile.
import { ref, onBeforeUnmount } from 'vue';
import { Hmc5883l } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';

const SCL_HZ = 400000; // its fast mode
const READ_MS = 67; // its 15 Hz: reading faster repeats the sample
const ADDRESS = 0x1e;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useHmc5883l() {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running, testing
  const failure = ref(null);
  const latest = ref(null); // { x, y, z } uT as read (null: an axis overflowed)
  const selfTest = ref(null); // atiic's result: { positive, negative, pass }
  const listeners = new Set();
  // fn(t ms, [x, y, z] uT) on each reading (null: an axis overflowed)
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let bus = null;
  let mag = null;
  let generation = 0;
  let running = null;

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
      failure.value = { title: 'Reading the HMC5883L failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  function start() {
    generation++;
    running = loop(generation);
    state.value = 'running';
  }

  async function connect() {
    failure.value = null;
    selfTest.value = null;
    state.value = 'connecting';
    try {
      bus = await openDongle(SCL_HZ);
    } catch (e) {
      failure.value = { ...explain(e, platform), error: e.message };
      state.value = 'idle';
      return;
    }
    try {
      if (!(await bus.acks(ADDRESS)) || !(await Hmc5883l.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No HMC5883L answers', detail: 'Nothing at 0x1E reads its ID ("H43"): check the four wires and the module\'s power. (A QMC5883L, a common stand-in sold under the same name, answers at 0x0D instead.)', error: '' };
        await disconnect();
        return;
      }
      mag = new Hmc5883l(bus, ADDRESS);
      await mag.init();
      start();
    } catch (e) {
      failure.value = { title: 'The HMC5883L didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the datasheet's self test, both biases: about a second
  async function runSelfTest() {
    if (state.value !== 'running') return;
    generation++;
    await running;
    state.value = 'testing';
    try {
      selfTest.value = await mag.selfTest();
      start();
    } catch (e) {
      failure.value = { title: 'The self test failed to run', detail: '', error: `${e.name}: ${e.message}` };
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
    state, failure, latest, selfTest,
    onReading, connect, disconnect, runSelfTest,
  };
}
