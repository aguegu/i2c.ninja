// A VL6180X on a bridge, for a page: found at 0x29 by its model ID (the
// TCS3472 asked first there, as atiic's bench does: this one's check writes a
// 16-bit register address), set up by atiic's driver (ST's AN4545 settings
// when fresh out of reset), then a range and an ambient light reading back
// to back; the last windowMs kept for the chart. 'max convergence' and 'no
// target' both mean nothing in reach.
import { ref, onBeforeUnmount } from 'vue';
import { Vl6180x, Tcs34725 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const ADDRESS = Vl6180x.addresses[0];
const RATE_EVERY_MS = 1000;

export function useVl6180x({ windowMs = 15000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { mm, error, near, lux }
  const rate = ref(0);
  const series = makeSeries(1, windowMs);

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    let reads = 0, rateFrom = performance.now();
    try {
      while (gen === generation) {
        const m = await dev.measure();
        if (gen !== generation) return;
        const t = performance.now();
        if (m.near) series.push(t, [m.mm]);
        latest.value = m;
        reads++;
        if (t - rateFrom >= RATE_EVERY_MS) { rate.value = (reads * 1000) / (t - rateFrom); reads = 0; rateFrom = t; }
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the VL6180X failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      const acks = await bus.acks(ADDRESS);
      if (acks && (await Tcs34725.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'A TCS34725 answers at 0x29, not a VL6180X', detail: 'Its own page reads it.', error: '' };
        await disconnect();
        return;
      }
      if (!acks || !(await Vl6180x.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No VL6180X answers', detail: 'Nothing at 0x29 reads its model ID (0xB4): check the wires and the module\'s power, and that its SHDN pin isn\'t held low. (A VL53L1X shares 0x29: its own page reads it.)', error: '' };
        await disconnect();
        return;
      }
      dev = new Vl6180x(bus, ADDRESS);
      await dev.init();
      series.clear();
      latest.value = null;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The VL6180X didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    dev = null;
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

  return { state, failure, latest, rate, source: series.source, connect, disconnect };
}
