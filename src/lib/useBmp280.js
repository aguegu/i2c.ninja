// A BMP280 on the bridge, for a page: found by its chip ID (0x58) at 0x76
// or 0x77, started by atiic's driver at one of its datasheet's oversampling
// settings, measured one at a time (forced mode) every READ_MS: pressure
// (Pa) and temperature (C); the last windowMs kept for the charts. A failed
// reading now and then is skipped and counted; FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Bmp280 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const FAILS_IN_A_ROW = 3;
const READ_MS = 250; // 4 readings a second; a measurement takes 5.5-37.5 ms (Table 13)
// Bosch's datasheet (BST-BMP280-DS001, revision 1.26), Table 4's settings
// with the temperature oversampling it recommends for each, their
// resolution (Table 4), RMS noise with no filter (Table 8) and typical
// measurement time (Table 13)
export const SETTINGS = [
  ['ultra-low-power', 'ultra low power: ×1, 2.62 Pa steps, 3.3 Pa noise, 5.5 ms', { pressure: 1, temperature: 1 }],
  ['low-power', 'low power: ×2, 1.31 Pa steps, 2.6 Pa noise, 7.5 ms', { pressure: 2, temperature: 1 }],
  ['standard', 'standard: ×4, 0.66 Pa steps, 2.1 Pa noise, 11.5 ms', { pressure: 4, temperature: 1 }],
  ['high', 'high resolution: ×8, 0.33 Pa steps, 1.6 Pa noise, 19.5 ms', { pressure: 8, temperature: 1 }],
  ['ultra-high', 'ultra high resolution: ×16, 0.16 Pa steps, 1.3 Pa noise, 37.5 ms', { pressure: 16, temperature: 2 }],
];
const oversamplingOf = (s) => SETTINGS.find(([k]) => k === s)[2];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useBmp280({ windowMs = 120000, setting: firstSetting = 'ultra-high', onReading = null } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { pressure Pa, temperature C }
  const failed = ref({ count: 0, of: 0, last: null });
  const setting = ref(firstSetting);
  const series = { pressure: makeSeries(1, windowMs), temperature: makeSeries(1, windowMs) };

  let bus = null;
  let dev = null;
  let generation = 0;
  let running = null;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        const t0 = performance.now();
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
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the BMP280 failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  function resume() {
    generation++;
    running = loop(generation);
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
      address.value = null;
      for (const a of Bmp280.addresses) {
        if ((await bus.acks(a)) && (await Bmp280.chip.identify(bus, a))) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: 'No BMP280 answers', detail: `Nothing at ${Bmp280.addresses.map(hex).join(' or ')} reads as one (chip ID 0x58): check the four wires and that it has 3.3 V.`, error: '' };
        await disconnect();
        return;
      }
      dev = new Bmp280(bus, address.value);
      await dev.init(oversamplingOf(setting.value));
      Object.values(series).forEach((s) => s.clear());
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      resume();
    } catch (e) {
      failure.value = { title: 'The BMP280 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // another oversampling setting: the readings paused, the sensor reset
  // and set (its measurements are one at a time, so none is left running),
  // on again
  async function setSetting(s) {
    setting.value = s;
    if (state.value !== 'running') return;
    generation++;
    await running;
    try {
      await dev.init(oversamplingOf(s));
      resume();
    } catch (e) {
      failure.value = { title: 'Changing the BMP280\'s setting failed', detail: '', error: `${e.name}: ${e.message}` };
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
    state, failure, failed, address, latest, setting,
    pressureSource: series.pressure.source, temperatureSource: series.temperature.source,
    connect, disconnect, setSetting,
  };
}
