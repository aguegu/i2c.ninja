// An OPT3001 on a bridge, for a page: found at 0x44-0x47 by its two IDs (TI's
// 0x5449 and its 0x3001: the SHT3x, SHT4x, CHT8305C and INA231 share these
// addresses, none carries both), set up by atiic's driver (automatic range,
// continuous, 800 or 100 ms a conversion), read once a conversion (a read
// gives the last); the last windowMs kept.
import { ref, onBeforeUnmount } from 'vue';
import { Opt3001 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its fast mode (it takes up to 2.6 MHz)
export const CONVERSIONS_MS = [800, 100]; // CT: its full resolution, or quicker

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useOpt3001({ windowMs = 60000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { lux, overflow }
  const conversionMs = ref(CONVERSIONS_MS[0]);
  const series = makeSeries(1, windowMs);

  let bus = null;
  let light = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const m = await light.measure();
        series.push(t0, [m.lux]);
        latest.value = m;
        await delay(Math.max(0, conversionMs.value - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the OPT3001 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function find() {
    for (const a of Opt3001.addresses) {
      if ((await bus.acks(a)) && (await Opt3001.chip.identify(bus, a))) return a;
    }
    return null;
  }

  // set up for conversionMs, the first conversion waited for, then read on
  async function start() {
    light = new Opt3001(bus, address.value, { conversionMs: conversionMs.value });
    await light.init();
    series.clear();
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
      address.value = await find();
      if (address.value === null) {
        failure.value = { title: 'No OPT3001 answers', detail: `Nothing at ${Opt3001.addresses.map(hex).join(', ')} reads its IDs: check the four wires, the module's power, and its ADDR pin (tied to GND, VDD, SDA or SCL).`, error: '' };
        await disconnect();
        return;
      }
      await start();
    } catch (e) {
      failure.value = { title: 'The OPT3001 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the conversion time, from now on (set up again if running)
  async function setConversion(ms) {
    conversionMs.value = ms;
    if (state.value !== 'running') return;
    generation++;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The OPT3001 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    const l = light;
    bus = null;
    light = null;
    state.value = 'idle';
    try {
      await l?.sleep();
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

  return { state, failure, address, latest, conversionMs, setConversion, source: series.source, connect, disconnect };
}
