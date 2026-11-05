// An HMC5883L on the CH341 dongle, for a page: found at 0x1E by its ID
// ("H43"), set up by atiic's driver (15 Hz, 8 samples averaged, +/-1.3 Ga),
// read once a sample period; its self test on request, the reading paused
// meanwhile. A hard-iron calibration: turned round, each axis's min and max
// kept, their middle taken off every reading after. The last windowMs kept
// for the chart.
import { ref, onBeforeUnmount } from 'vue';
import { Hmc5883l } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its fast mode
const READ_MS = 67; // its 15 Hz: reading faster repeats the sample
const ADDRESS = 0x1e;
const AXES = ['x', 'y', 'z'];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useHmc5883l({ windowMs = 30000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running, testing
  const failure = ref(null);
  const raw = ref(null); // { x, y, z } uT as read (null: an axis overflowed)
  const latest = ref(null); // the same, the calibration's offset taken off
  const selfTest = ref(null); // atiic's result: { positive, negative, pass }
  const calibrating = ref(false);
  const span = ref(null); // while calibrating: { min: {x,y,z}, max: {x,y,z} }
  const offset = ref({ x: 0, y: 0, z: 0 }); // uT, the hard iron
  const calibrated = ref(false);
  const series = makeSeries(3, windowMs);

  let bus = null;
  let mag = null;
  let generation = 0;
  let running = null;

  function track(m) {
    if (!calibrating.value || AXES.some((k) => m[k] === null)) return;
    const s = span.value ?? { min: { ...m }, max: { ...m } };
    for (const k of AXES) { s.min[k] = Math.min(s.min[k], m[k]); s.max[k] = Math.max(s.max[k], m[k]); }
    span.value = { min: { ...s.min }, max: { ...s.max } };
  }

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { magnetometers: m } = await mag.measure();
        raw.value = m;
        track(m);
        const c = Object.fromEntries(AXES.map((k) => [k, m[k] === null ? null : m[k] - offset.value[k]]));
        latest.value = c;
        series.push(t0, AXES.map((k) => c[k] ?? 0));
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the HMC5883L failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      series.clear();
      start();
    } catch (e) {
      failure.value = { title: 'The HMC5883L didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // turn it round (flat, then over): each axis's extremes collected
  function startCalibration() {
    span.value = null;
    calibrating.value = true;
  }

  // the middle of each axis's extremes: the board's own field, taken off
  function finishCalibration() {
    calibrating.value = false;
    const s = span.value;
    if (!s) return;
    offset.value = Object.fromEntries(AXES.map((k) => [k, (s.min[k] + s.max[k]) / 2]));
    calibrated.value = true;
  }

  function clearCalibration() {
    calibrating.value = false;
    span.value = null;
    offset.value = { x: 0, y: 0, z: 0 };
    calibrated.value = false;
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
    state, failure, raw, latest, selfTest, calibrating, span, offset, calibrated,
    source: series.source, connect, disconnect, runSelfTest, startCalibration, finishCalibration, clearCalibration,
  };
}
