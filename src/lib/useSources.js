// A page's live readings of one or more quantities: connect the bridge,
// scan the bus for every chip of each (lib/sources.js), read the chosen
// ones in turn every READ_MS (or the slowest chosen chip's readMs), each as
// [x, y, z] in its unit, the last windowMs kept for a chart each. kinds:
// { key: ACCELEROMETERS, ... }. Several found for a quantity: choose(key, i).
// Two quantities found on one module (lib/sources.js family) are taken
// together first, their axes being the same. The bus is read in a worker
// (lib/sampler.worker.js), off the main thread, so a busy frame doesn't
// delay a reading: this shows the chooser, keeps the state and the charts,
// and takes each reading as the worker posts it.
import { perFrame } from './frame.js';
import { noteReading } from './perf.js';
import { ref, computed, onBeforeUnmount } from 'vue';
import { hasWebUsb, detectPlatform, chooseDongle, explain, DongleError } from './dongle.js';
import * as SOURCES from './sources.js';
import { makeSeries } from './series.js';
import { nameSeries } from './recorder.js';

const SCL_HZ = 400000;
export const READ_MS = 20; // 50 a second: smooth enough to see a shake (a chip's readMs if slower)

const perSecond = (c) => Math.round(1000 / (c.readMs ?? READ_MS));

// a kind's name in lib/sources.js, by which the worker knows it
const nameOf = (kind) => Object.keys(SOURCES).find((n) => SOURCES[n] === kind);

// the same board: one family, and for an MPU one address
const together = (f, g) => f.chip.family && f.chip.family === g.chip.family && (!f.chip.sameAddress || f.address === g.address);

export function useSources(kinds, { windowMs = 10000 } = {}) {
  const keys = Object.keys(kinds);
  const parts = keys.map((key) => ({ key, noun: kinds[key].noun, unit: kinds[key].unit, chips: kinds[key].chips }));
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const found = ref(Object.fromEntries(keys.map((k) => [k, []]))); // key: [{ name, address, chip, ci (its index in the kind) }]
  const chosen = ref(Object.fromEntries(keys.map((k) => [k, -1])));
  const latest = ref(null); // { key: [x, y, z] }
  const publish = perFrame((v) => { latest.value = v; }); // once a frame, the newest
  const series = Object.fromEntries(keys.map((k) => [k, makeSeries(3, windowMs)]));
  const sources = Object.fromEntries(keys.map((k) => [k, series[k].source]));
  const pick = (k) => found.value[k][chosen.value[k]];
  // named for the recorder, the raw readings before any chart's: the chip
  // read and its kind, "ADXL345 accelerometer x (g)"
  const unnamed = keys.map((k) => nameSeries(sources[k], () => `${pick(k)?.name ?? ''} ${kinds[k].noun}`.trim(), kinds[k].unit, ['x', 'y', 'z']));
  // readings a second: the slowest chosen chip's, else the fastest each may find
  const rate = computed(() => Math.min(...keys.map((k) => (pick(k) ? perSecond(pick(k).chip) : Math.max(...kinds[k].chips.map(perSecond))))));
  // the chosen chips on separate boards: their axes must be lined up by hand
  const apart = computed(() => keys.length > 1 && keys.every((k) => pick(k)) && !keys.slice(1).every((k) => together(pick(keys[0]), pick(k))));

  const listeners = new Set();
  // fn(t ms, { key: [x, y, z] }) on each round of readings
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let worker = null;
  let chosenDevice = null; // the page's handle of the bridge, to notice its unplugging

  // a reading posted by the worker: its time back on this page's clock
  function onReadingPosted(t, v) {
    const t0 = t - performance.timeOrigin;
    publish.push(v);
    noteReading();
    for (const k of keys) series[k].push(t0, v[k]);
    for (const fn of listeners) fn(t0, v);
  }

  // the worker's answer to a message: the next one of the types asked for
  function expect(...types) {
    return new Promise((resolve) => {
      const on = ({ data }) => {
        if (!types.includes(data.type)) return;
        worker?.removeEventListener('message', on);
        resolve(data);
      };
      worker.addEventListener('message', on);
    });
  }

  function onMessage({ data }) {
    if (data.type === 'reading') onReadingPosted(data.t, data.v);
    else if (data.type === 'failure' && state.value === 'running') {
      failure.value = { title: data.title, detail: data.detail, error: `${data.name}: ${data.message}` };
      disconnect();
    }
  }

  // (re)open the chosen chips and read them
  async function start() {
    for (const k of keys) series[k].clear();
    publish.cancel();
    latest.value = null;
    const readMs = Math.max(...keys.map((k) => pick(k).chip.readMs ?? READ_MS));
    // by the worker's index (found is reactive: its chips are proxies, not the objects)
    const chosenChips = Object.fromEntries(keys.map((k) => [k, { ci: pick(k).ci, address: pick(k).address }]));
    worker.postMessage({ type: 'start', chosen: chosenChips, readMs });
  }

  async function choose(key, i) {
    if (!found.value[key][i] || !worker) return;
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
    let picked;
    try {
      picked = await chooseDongle();
    } catch (e) {
      failure.value = { ...explain(e, platform), error: e.message };
      state.value = 'idle';
      return;
    }
    chosenDevice = picked.device ?? null;
    worker = new Worker(new URL('./sampler.worker.js', import.meta.url), { type: 'module' });
    worker.addEventListener('message', onMessage);
    const answer = expect('found', 'error', 'failure');
    worker.postMessage({ type: 'open', match: picked.match, fake: picked.fake, sclHz: SCL_HZ, kinds: Object.fromEntries(keys.map((k) => [k, nameOf(kinds[k])])) });
    const a = await answer;
    if (a.type === 'error') {
      const e = new DongleError('open', { name: a.name, message: a.message });
      failure.value = { ...explain(e, platform), error: e.message };
      await disconnect();
      return;
    }
    if (a.type === 'failure') {
      failure.value = { title: a.title, detail: a.detail, error: `${a.name}: ${a.message}` };
      await disconnect();
      return;
    }
    const all = Object.fromEntries(keys.map((k) => [k, a.found[k].map(({ ci, address }) => ({ name: kinds[k].chips[ci].name, address, chip: kinds[k].chips[ci], ci }))]));
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
  }

  async function disconnect() {
    state.value = 'idle';
    chosenDevice = null;
    const w = worker;
    worker = null;
    if (!w) return;
    const done = new Promise((resolve) => {
      w.addEventListener('message', ({ data }) => { if (data.type === 'stopped') resolve(); });
      setTimeout(resolve, 1000); // a worker that doesn't answer is ended anyway
    });
    w.postMessage({ type: 'stop' });
    await done;
    w.terminate();
  }

  function onUsbDisconnect(e) {
    if (chosenDevice && e.device === chosenDevice) {
      failure.value = { title: 'The bridge was unplugged', detail: '', error: '' };
      disconnect();
    }
  }
  if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
  onBeforeUnmount(() => {
    for (const u of unnamed) u();
    if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
    disconnect();
  });

  return { state, failure, parts, found, chosen, latest, rate, apart, sources, onReading, connect, disconnect, choose };
}
