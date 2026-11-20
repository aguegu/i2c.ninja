// A TCS3472 (a TCS34725 or TCS34727) on a bridge, for a page: found at 0x29
// by its ID, started by atiic's driver at an integration and gain, read once
// an integration: clear, red, green and blue counts; the last windowMs kept
// for the chart. Its status bit says only that one integration has ended
// since starting, so each reading waits the integration out.
import { ref, onBeforeUnmount } from 'vue';
import { Tcs34725 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const ADDRESS = Tcs34725.addresses[0];
// its datasheet's integrations (Figure 27), as 2.4 ms steps: 2.4, 24, 101, 154, 614 ms
export const STEPS = [1, 10, 42, 64, 256];
export const GAINS = Tcs34725.GAINS;
const STEP_MS = 2.4;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTcs34725({ windowMs = 60000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const part = ref(null);
  const latest = ref(null); // { clear, red, green, blue, saturated }
  const settings = ref({ steps: 42, gain: 4 });
  const series = makeSeries(4, windowMs);

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const r = await dev.measure();
        if (gen !== generation) return;
        series.push(performance.now(), [r.red, r.green, r.blue, r.clear]);
        latest.value = r;
        await delay(dev.integrationMs);
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${part.value ?? 'TCS3472'} failed`, detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // set up at the settings, then read on
  async function start() {
    dev = new Tcs34725(bus, ADDRESS, settings.value);
    await dev.init();
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
      if (!(await bus.acks(ADDRESS)) || !(await Tcs34725.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No TCS34725 answers', detail: 'Nothing at 0x29 reads its ID (0x44, or 0x4D for a TCS34727): check the four wires and the module\'s power. (A VL53L1X shares 0x29: its own page reads it.)', error: '' };
        await disconnect();
        return;
      }
      part.value = await new Tcs34725(bus, ADDRESS).part();
      series.clear();
      latest.value = null;
      await start();
    } catch (e) {
      failure.value = { title: 'The TCS3472 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // an integration or gain: set up again with it (the chart keeps its
  // history: counts at another setting, drawn on)
  async function configure(change) {
    settings.value = { ...settings.value, ...change };
    if (state.value !== 'running') return;
    generation++;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The TCS3472 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    const d = dev;
    bus = null;
    dev = null;
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

  return { state, failure, part, latest, settings, source: series.source, connect, disconnect, configure, stepMs: STEP_MS };
}
