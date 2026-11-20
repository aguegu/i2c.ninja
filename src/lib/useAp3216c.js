// An AP3216C on a bridge, for a page: found at 0x1E by its reserved bits
// (atiic's check, which an HMC5883L there fails), set up by atiic's driver (a reset, the ALS range, then ALS
// and PS+IR alternately, 112.5 ms a round), read every READ_MS; the last
// windowMs kept. Lux is a level here, not an exact figure (its datasheet
// disagrees with itself on the scale: atiic's devices/ap3216c.js).
import { ref, onBeforeUnmount } from 'vue';
import { Ap3216c } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

export const SCL_HZ = 400000; // its fast mode
export const READ_MS = 150; // a round of ALS and PS+IR: 112.5 ms
export const RANGES = Ap3216c.FULL_SCALE_LUX; // by range: its full scale, lux
const ADDRESS = Ap3216c.addresses[0];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAp3216c({ windowMs = 60000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { lux, als, ir, proximity, near, irOverflow }
  const range = ref(0);
  const series = { lux: makeSeries(1, windowMs), proximity: makeSeries(1, windowMs) };

  let bus = null;
  let a = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const m = await a.measure();
        if (gen !== generation) return;
        series.lux.push(t0, [m.lux]);
        series.proximity.push(t0, [m.proximity]);
        latest.value = m;
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the AP3216C failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // set up at the range, then read on
  async function start() {
    a = new Ap3216c(bus, ADDRESS, { range: range.value });
    await a.init();
    Object.values(series).forEach((s) => s.clear());
    latest.value = null;
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
      if (!(await bus.acks(ADDRESS)) || !(await Ap3216c.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No AP3216C answers', detail: 'Nothing at 0x1E answers as an AP3216C: check the four wires and the module\'s power. (An HMC5883L there is read on its own page.)', error: '' };
        await disconnect();
        return;
      }
      await start();
    } catch (e) {
      failure.value = { title: 'The AP3216C didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the ALS range, from now on (set up again if running)
  async function setRange(r) {
    range.value = r;
    if (state.value !== 'running') return;
    generation++;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The AP3216C didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    const d = a;
    bus = null;
    a = null;
    state.value = 'idle';
    try {
      await d?.sleep();
    } catch {
      // gone already
    }
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

  return { state, failure, latest, range, setRange, luxSource: series.lux.source, proximitySource: series.proximity.source, connect, disconnect };
}
