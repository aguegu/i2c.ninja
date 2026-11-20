// Whichever colour sensor is on the bridge, for a page that needs only red,
// green, blue and clear counts (/physics/colour): the BH1745NUC (0x38, 0x39)
// or the TCS3472 (TCS34725, TCS34727; 0x29), each found by its own ID, set
// up by atiic's driver at its own pace and a gain from its own list, read
// as each measurement ends. A failed reading now and then is skipped and
// counted; FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Bh1745, Tcs34725 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // both chips' top
const FAILS_IN_A_ROW = 3;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// each chip: its addresses, how to know it there, its gains and the one to
// start at, its time between readings, ms, and how to open and read it
const CHIPS = [
  {
    name: 'BH1745NUC',
    to: '/bh1745',
    Driver: Bh1745,
    gains: [1, 2, 16],
    gain: 1,
    readMs: 160, // its measurement time (atiic's default); measure() waits for it
    open: async (bus, a, gain) => {
      const d = new Bh1745(bus, a);
      await d.init({ timeMs: 160, gain });
      return { read: () => d.measure(), sleep: () => d.sleep(), wait: 0 };
    },
  },
  {
    name: 'TCS34725',
    to: '/tcs34725',
    Driver: Tcs34725,
    gains: Tcs34725.GAINS,
    gain: 4,
    readMs: 101, // 42 steps of 2.4 ms (atiic's default); one integration between readings
    open: async (bus, a, gain) => {
      const d = new Tcs34725(bus, a, { gain });
      const part = await d.part();
      await d.init();
      return { read: () => d.measure(), sleep: () => d.sleep(), wait: d.integrationMs, part };
    },
  },
];

export function useColourSensor({ windowMs = 60000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const chip = ref(null); // { name, to, gains, readMs, address, part }
  const latest = ref(null); // { red, green, blue, clear }
  const gain = ref(null);
  const failed = ref({ count: 0, of: 0, last: null });
  const series = makeSeries(4, windowMs);

  let bus = null;
  let dev = null;
  let found = null;
  let generation = 0;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        let r;
        try {
          r = await dev.read();
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
        series.push(performance.now(), [r.red, r.green, r.blue, r.clear]);
        latest.value = { red: r.red, green: r.green, blue: r.blue, clear: r.clear };
        if (dev.wait) await delay(dev.wait);
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${chip.value?.name ?? 'colour sensor'} failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function start() {
    dev = await found.spec.open(bus, found.address, gain.value);
    chip.value = { ...chip.value, part: dev.part ?? null };
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
      found = null;
      for (const spec of CHIPS) {
        for (const a of spec.Driver.addresses) {
          if ((await bus.acks(a)) && (await spec.Driver.chip.identify(bus, a))) { found = { spec, address: a }; break; }
        }
        if (found) break;
      }
      if (!found) {
        const where = CHIPS.map((s) => `a ${s.name} at ${s.Driver.addresses.map(hex).join(' or ')}`).join(', ');
        failure.value = { title: 'No colour sensor answers', detail: `Nothing reads as ${where}: check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      const { spec, address } = found;
      chip.value = { name: spec.name, to: spec.to, gains: spec.gains, readMs: spec.readMs, address, part: null };
      gain.value = spec.gain;
      series.clear();
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      await start();
    } catch (e) {
      failure.value = { title: 'The colour sensor didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // a gain from the chip's list: set up again with it (the chart keeps its
  // history: counts at another gain, drawn on)
  async function setGain(g) {
    gain.value = g;
    if (state.value !== 'running') return;
    generation++;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The colour sensor didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
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

  return { state, failure, failed, chip, latest, gain, setGain, source: series.source, connect, disconnect };
}
