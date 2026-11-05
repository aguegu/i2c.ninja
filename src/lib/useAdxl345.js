// An ADXL345 on the CH341 dongle, for a page: found at 0x53 or 0x1D by its
// DEVID, set up by atiic's driver (full resolution, +/-16 g, 100 Hz), read
// once a sample period; its self test run on request, the reading paused
// meanwhile. The last windowMs kept for the chart.
import { ref, onBeforeUnmount } from 'vue';
import { Adxl345 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its fast mode
const READ_MS = 10; // its 100 Hz: reading faster repeats the sample
const REG_DEVID = 0x00;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAdxl345({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running, testing
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { x, y, z } g
  const selfTest = ref(null); // atiic's result: { change, limits, pass }
  const series = makeSeries(3, windowMs);

  let bus = null;
  let adxl = null;
  let generation = 0;
  let running = null; // the loop's promise, awaited before the self test

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { accelerometers: a } = await adxl.measure();
        series.push(t0, [a.x, a.y, a.z]);
        latest.value = a;
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the ADXL345 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      address.value = null;
      for (const a of Adxl345.addresses) {
        if (!(await bus.acks(a))) continue;
        const [id] = await bus.writeRead(a, [REG_DEVID], 1);
        if (id === Adxl345.chip.whoAmI) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: 'No ADXL345 answers', detail: `Nothing at ${Adxl345.addresses.map(hex).join(' or ')} reads its DEVID (0xE5): check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      adxl = new Adxl345(bus, address.value);
      await adxl.init();
      series.clear();
      start();
    } catch (e) {
      failure.value = { title: 'The ADXL345 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the datasheet's self test, the board held still: about half a second
  async function runSelfTest() {
    if (state.value !== 'running') return;
    generation++;
    await running;
    state.value = 'testing';
    try {
      selfTest.value = await adxl.selfTest();
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
    adxl = null;
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

  return { state, failure, address, latest, selfTest, source: series.source, connect, disconnect, runSelfTest };
}
