// A VL53L1X on the CH341 dongle, for a page: found by its model ID at
// 0x29, started by atiic's driver (ST's Ultra Lite Driver sequence: long
// distance mode, a reading every ~100 ms), each reading kept with its
// status; the last windowMs kept for the chart.
import { ref, onBeforeUnmount } from 'vue';
import { Vl53l1x } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const ADDRESS = 0x29;
const RATE_EVERY_MS = 1000;
// the ULD's range status codes (VL53L1X_GetRangeStatus: 0 no error, 1
// sigma failed, 2 signal failed, 7 wrap-around), for people
export const STATUS = {
  0: 'valid',
  1: 'too uncertain (sigma)',
  2: 'too little light back (signal)',
  4: 'out of bounds',
  7: 'wrap-around: past its range',
};

export function useVl53l1x({ windowMs = 15000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { distance mm, status, valid }
  const rate = ref(0);
  const span = ref({ min: null, max: null }); // the valid readings' range, since connecting
  const series = makeSeries(1, windowMs);

  let bus = null;
  let tof = null;
  let generation = 0;

  async function loop(gen) {
    let reads = 0, rateFrom = performance.now();
    try {
      while (gen === generation) {
        const r = await tof.measure(); // waits for the next ranging
        const t = performance.now();
        const valid = r.status === 0;
        if (valid) {
          series.push(t, [r.distance]);
          span.value = { min: Math.min(span.value.min ?? Infinity, r.distance), max: Math.max(span.value.max ?? -Infinity, r.distance) };
        }
        latest.value = { ...r, valid };
        reads++;
        if (t - rateFrom >= RATE_EVERY_MS) {
          rate.value = (reads * 1000) / (t - rateFrom);
          reads = 0;
          rateFrom = t;
        }
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the VL53L1X failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS)) || !(await Vl53l1x.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No VL53L1X answers', detail: 'Nothing at 0x29 reads its model ID: check the four wires (VIN, GND, SCL, SDA) and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      tof = new Vl53l1x(bus, ADDRESS);
      await tof.init();
      series.clear();
      span.value = { min: null, max: null };
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The VL53L1X didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    state.value = 'idle';
    try {
      await tof?.sleep();
    } catch {
      // gone already
    }
    tof = null;
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

  return { state, failure, latest, rate, span, source: series.source, connect, disconnect };
}
