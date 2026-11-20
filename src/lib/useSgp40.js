// An SGP40 on a bridge, for a page: found at 0x59 by its serial number's
// CRCs (atiic's Sgp40.chip.identify), its self test run on connecting, then a
// raw signal every READ_MS (its sampling interval, 1 s, keeps the hotplate's
// temperature steady); the first after the hotplate comes on reads 0 (ours):
// dropped. The hotplate off on stopping.
import { ref, onBeforeUnmount } from 'vue';
import { Sgp40 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

export const SCL_HZ = 100000;
export const READ_MS = 1000; // Table 1: 1 s
const ADDRESS = Sgp40.addresses[0];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSgp40({ windowMs = 600000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // raw ticks
  const serial = ref(null);
  const selfTest = ref(null); // { passed, result }
  const series = makeSeries(1, windowMs);

  let bus = null;
  let s = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { raw } = await s.measure();
        if (gen !== generation) return;
        if (raw > 0) {
          series.push(t0, [raw]);
          latest.value = raw;
        }
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the SGP40 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS)) || !(await Sgp40.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No SGP40 answers', detail: 'Nothing at 0x59 reads its serial number: check the four wires and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      s = new Sgp40(bus, ADDRESS);
      serial.value = await s.serial();
      selfTest.value = await s.selfTest();
      series.clear();
      latest.value = null;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The SGP40 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    const d = s;
    bus = null;
    s = null;
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

  return { state, failure, latest, serial, selfTest, source: series.source, connect, disconnect };
}
