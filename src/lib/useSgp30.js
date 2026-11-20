// An SGP30 on a bridge, for a page: found at 0x58 by its feature set
// (atiic's Sgp30.chip.identify), its self test run on connecting (before
// iaq_init: its datasheet's order), then CO2eq and TVOC every READ_MS (its
// baseline algorithm wants once a second) and its raw H2 and ethanol signals
// beside them; 400 ppm and 0 ppb for its first INIT_S. Stopping leaves it
// measuring: it has no stop command but the bus-wide general-call reset.
import { ref, onBeforeUnmount } from 'vue';
import { Sgp30 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

export const SCL_HZ = 100000;
export const READ_MS = 1000; // its datasheet: measure_iaq once a second
export const INIT_S = Sgp30.INIT_S;
const ADDRESS = Sgp30.addresses[0];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSgp30({ windowMs = 600000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { co2eq, tvoc, h2, ethanol }
  const serial = ref(null);
  const featureSet = ref(null);
  const selfTest = ref(null); // { passed, result }
  const since = ref(null); // performance.now() at its iaq_init
  const series = { air: makeSeries(2, windowMs), raw: makeSeries(2, windowMs) };

  let bus = null;
  let s = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { co2eq, tvoc } = await s.measure();
        const { h2, ethanol } = await s.raw();
        if (gen !== generation) return;
        series.air.push(t0, [co2eq, tvoc]);
        series.raw.push(t0, [h2, ethanol]);
        latest.value = { co2eq, tvoc, h2, ethanol };
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the SGP30 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS)) || !(await Sgp30.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No SGP30 answers', detail: 'Nothing at 0x58 reads its feature set: check the four wires and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      s = new Sgp30(bus, ADDRESS);
      serial.value = await s.serial();
      featureSet.value = await s.featureSet();
      selfTest.value = await s.selfTest();
      await s.init();
      since.value = performance.now();
      Object.values(series).forEach((x) => x.clear());
      latest.value = null;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The SGP30 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    s = null;
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
    state, failure, latest, serial, featureSet, selfTest, since,
    airSource: series.air.source, rawSource: series.raw.source, connect, disconnect,
  };
}
