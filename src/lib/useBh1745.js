// A BH1745NUC on the bridge, for a page: found by its part and maker IDs at
// 0x38 or 0x39, started by atiic's driver at a measurement time and gain,
// read as each measurement ends (its VALID bit): red, green, blue and clear
// counts; the last windowMs kept for the chart. A failed reading now and then
// is skipped and counted; FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Bh1745 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its datasheet's fSCL max
const FAILS_IN_A_ROW = 3;
export const TIMES_MS = [160, 320, 640, 1280, 2560, 5120];
export const GAINS = [1, 2, 16];
export const COUNT_MAX = 0xffff; // 16 bits: a channel at it is saturated

export function useBh1745({ windowMs = 60000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { red, green, blue, clear, gain, timeMs }
  const failed = ref({ count: 0, of: 0, last: null });
  const settings = ref({ timeMs: 160, gain: 1 });
  const series = makeSeries(4, windowMs);

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        let r;
        try {
          r = await dev.measure();
          inARow = 0;
        } catch (e) {
          if (gen !== generation) return;
          inARow++;
          failed.value = { count: failed.value.count + 1, of: failed.value.of + 1, last: e.message };
          if (inARow >= FAILS_IN_A_ROW) throw e;
          continue;
        }
        failed.value = { ...failed.value, of: failed.value.of + 1 };
        series.push(performance.now(), [r.red, r.green, r.blue, r.clear]);
        latest.value = r;
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the BH1745NUC failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
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
      address.value = null;
      for (const a of Bh1745.addresses) {
        if ((await bus.acks(a)) && (await Bh1745.chip.identify(bus, a))) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: 'No BH1745NUC answers', detail: `Nothing at ${Bh1745.addresses.map(hex).join(' or ')} reads as one (part ID 0x0B, ROHM's 0xE0): check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      dev = new Bh1745(bus, address.value);
      await dev.init(settings.value);
      series.clear();
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The BH1745NUC didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // a measurement time or gain: the measurement restarts with it (the
  // chart keeps its history: counts at another setting, drawn on)
  async function configure(change) {
    settings.value = { ...settings.value, ...change };
    if (dev) await dev.configure(settings.value);
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

  return { state, failure, failed, address, latest, settings, source: series.source, connect, disconnect, configure };
}
