// An LM75 on a bridge, for a page: found at 0x48-0x4F (no ID register:
// atiic's range check, the CHT8305C and INA231 asked first there as they
// carry IDs), its power-up state written back (it has no reset command), read
// every CONVERSION_MS (it converts on its own, a read gives the last), its
// watchdog limits read once; the last windowMs kept.
import { ref, onBeforeUnmount } from 'vue';
import { Lm75, Cht8305, Ina231 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000;
const OTHERS = [Cht8305, Ina231]; // chips with an ID at these addresses: not taken for an LM75

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useLm75({ windowMs = 120000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // C
  const limits = ref(null); // { hysteresis, overtemperature } C
  const series = makeSeries(1, windowMs);

  let bus = null;
  let lm = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const c = await lm.temperature();
        series.push(t0, [c]);
        latest.value = c;
        await delay(Math.max(0, Lm75.CONVERSION_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the LM75 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function find() {
    for (const a of Lm75.addresses) {
      if (!(await bus.acks(a))) continue;
      let other = false;
      for (const D of OTHERS) if (D.addresses.includes(a) && (await D.chip.identify(bus, a))) other = true;
      if (!other && (await Lm75.chip.identify(bus, a))) return a;
    }
    return null;
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
        failure.value = { title: 'No LM75 answers', detail: `Nothing at ${Lm75.addresses.map(hex).join(', ')} answers as an LM75: check the four wires, the module's power, and its A0-A2 pins (tied to GND or VCC, not left open).`, error: '' };
        await disconnect();
        return;
      }
      lm = new Lm75(bus, address.value);
      await lm.init();
      limits.value = await lm.limits();
      series.clear();
      latest.value = null;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The LM75 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    lm = null;
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

  return { state, failure, address, latest, limits, source: series.source, connect, disconnect };
}
