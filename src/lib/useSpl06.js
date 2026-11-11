// An SPL06 on the bridge, for a page: found by its ID (0x10) at 0x77 or
// 0x76, started by atiic's driver at one of its datasheet's use cases
// (weather, indoor, sports), read as each pressure result comes: pressure
// (Pa) and temperature (C); the last windowMs kept for the charts. A failed
// reading now and then is skipped and counted; FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Spl06 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const FAILS_IN_A_ROW = 3;
// its datasheet's Table 5, as atiic names them, with that table's precision
// (indoor's 10 cm and sports' 5 cm are Table 8's 1.2 and 0.5 Pa) and rate
export const MODES = [
  ['weather', 'weather: 5 Pa, once a second'],
  ['indoor', 'indoor: 1.2 Pa, twice a second'],
  ['sports', 'sports: 0.5 Pa, 4 a second'],
];

export function useSpl06({ windowMs = 120000, mode: firstMode = 'indoor', onReading = null } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { pressure Pa, temperature C }
  const failed = ref({ count: 0, of: 0, last: null });
  const mode = ref(firstMode);
  const series = { pressure: makeSeries(1, windowMs), temperature: makeSeries(1, windowMs) };

  let bus = null;
  let dev = null;
  let generation = 0;
  let running = null;

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
        if (gen !== generation) return;
        failed.value = { ...failed.value, of: failed.value.of + 1 };
        const t = performance.now();
        series.pressure.push(t, [r.pressure / 100]); // hPa
        series.temperature.push(t, [r.temperature]);
        latest.value = r;
        onReading?.(t, r);
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the SPL06 failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  function resume() {
    generation++;
    running = loop(generation);
    state.value = 'running';
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
      for (const a of Spl06.addresses) {
        if ((await bus.acks(a)) && (await Spl06.chip.identify(bus, a))) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: 'No SPL06 answers', detail: `Nothing at ${Spl06.addresses.map(hex).join(' or ')} reads as one (ID 0x10): check the four wires and that it has 3.3 V.`, error: '' };
        await disconnect();
        return;
      }
      dev = new Spl06(bus, address.value);
      await dev.init({ mode: mode.value });
      Object.values(series).forEach((s) => s.clear());
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      resume();
    } catch (e) {
      failure.value = { title: 'The SPL06 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // another use case: the readings paused, the sensor set (its last
  // measurement under the old mode waited out by atiic), on again
  async function setMode(m) {
    mode.value = m;
    if (state.value !== 'running') return;
    generation++;
    await running;
    try {
      await dev.configure({ mode: m });
      resume();
    } catch (e) {
      failure.value = { title: 'Changing the SPL06\'s mode failed', detail: '', error: `${e.name}: ${e.message}` };
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

  return {
    state, failure, failed, address, latest, mode,
    pressureSource: series.pressure.source, temperatureSource: series.temperature.source,
    connect, disconnect, setMode,
  };
}
