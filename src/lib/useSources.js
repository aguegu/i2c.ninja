// A page's live readings of one or more quantities: connect the dongle,
// scan the bus for every chip of each (lib/sources.js), read the chosen
// ones in turn every READ_MS (or the slowest chosen chip's readMs), each as
// [x, y, z] in its unit, the last windowMs kept for a chart each. kinds:
// { key: ACCELEROMETERS, ... }. Several found for a quantity: choose(key, i).
// Two quantities found on one module (lib/sources.js family) are taken
// together first, their axes being the same.
import { perFrame } from './frame.js';
import { noteReading } from './perf.js';
import { ref, computed, onBeforeUnmount } from 'vue';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
export const READ_MS = 20; // 50 a second: smooth enough to see a shake (a chip's readMs if slower)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const perSecond = (c) => Math.round(1000 / (c.readMs ?? READ_MS));

// the same board: one family, and for an MPU one address
const together = (f, g) => f.chip.family && f.chip.family === g.chip.family && (!f.chip.sameAddress || f.address === g.address);

export function useSources(kinds, { windowMs = 10000 } = {}) {
  const keys = Object.keys(kinds);
  const parts = keys.map((key) => ({ key, noun: kinds[key].noun, unit: kinds[key].unit, chips: kinds[key].chips }));
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const found = ref(Object.fromEntries(keys.map((k) => [k, []]))); // key: [{ name, address, chip }]
  const chosen = ref(Object.fromEntries(keys.map((k) => [k, -1])));
  const latest = ref(null); // { key: [x, y, z] }
  const publish = perFrame((v) => { latest.value = v; }); // once a frame, the newest
  const series = Object.fromEntries(keys.map((k) => [k, makeSeries(3, windowMs)]));
  const sources = Object.fromEntries(keys.map((k) => [k, series[k].source]));
  const pick = (k) => found.value[k][chosen.value[k]];
  // readings a second: the slowest chosen chip's, else the fastest each may find
  const rate = computed(() => Math.min(...keys.map((k) => (pick(k) ? perSecond(pick(k).chip) : Math.max(...kinds[k].chips.map(perSecond))))));
  // the chosen chips on separate boards: their axes must be lined up by hand
  const apart = computed(() => keys.length > 1 && keys.every((k) => pick(k)) && !keys.slice(1).every((k) => together(pick(keys[0]), pick(k))));

  const listeners = new Set();
  // fn(t ms, { key: [x, y, z] }) on each round of readings
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let bus = null;
  let sensors = {};
  let generation = 0;
  let running = null;

  async function loop(gen) {
    const readMs = Math.max(...keys.map((k) => pick(k).chip.readMs ?? READ_MS));
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const v = {};
        for (const k of keys) v[k] = await sensors[k].read();
        publish.push(v);
        noteReading();
        for (const k of keys) series[k].push(t0, v[k]);
        for (const fn of listeners) fn(t0, v);
        await delay(Math.max(0, readMs - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the sensor failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // (re)open the chosen chips and read them
  async function start() {
    generation++;
    await running;
    for (const k of keys) series[k].clear();
    publish.cancel();
    latest.value = null;
    try {
      sensors = {};
      for (const k of keys) sensors[k] = await pick(k).chip.open(bus, pick(k).address);
      generation++;
      running = loop(generation);
    } catch (e) {
      failure.value = { title: 'The sensor didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function choose(key, i) {
    if (!found.value[key][i] || !bus) return;
    chosen.value = { ...chosen.value, [key]: i };
    await start();
  }

  // the first quantity's first chip, the others from its board if there
  function defaults() {
    const [k0, ...rest] = keys;
    const firsts = found.value[k0];
    const i0 = Math.max(0, firsts.findIndex((f) => rest.every((k) => found.value[k].some((g) => together(f, g)))));
    const c = { [k0]: i0 };
    for (const k of rest) c[k] = Math.max(0, found.value[k].findIndex((g) => together(firsts[i0], g)));
    chosen.value = c;
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
      const all = {};
      for (const k of keys) {
        const list = [];
        for (const chip of kinds[k].chips) {
          for (const a of chip.addresses) {
            if (list.some((f) => f.address === a) || !(await bus.acks(a))) continue;
            if (await chip.detect(bus, a)) list.push({ name: chip.name, address: a, chip });
          }
        }
        all[k] = list;
      }
      found.value = all;
      const missing = parts.filter((p) => !all[p.key].length);
      if (missing.length) {
        const names = [...new Set(missing.flatMap((p) => p.chips.map((c) => c.name)))].join(', ');
        failure.value = { title: `No ${missing.map((p) => p.noun).join(' or ')} found`, detail: `None of ${names} answers on the bus: check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      defaults();
      state.value = 'running';
      await start();
    } catch (e) {
      failure.value = { title: 'Scanning the bus failed', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    sensors = {};
    state.value = 'idle';
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

  return { state, failure, parts, found, chosen, latest, rate, apart, sources, onReading, connect, disconnect, choose };
}
