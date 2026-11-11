// A VL53L1X on the bridge, for a page: found by its model ID at 0x29,
// started by atiic's driver (ST's Ultra Lite Driver sequence), then set to
// the page's distance mode, timing budget and region of interest; each
// reading kept with its status, its light back, the background and the
// SPADs used; the last windowMs kept for the charts (distance, signal,
// ambient a SPAD: each its own). setup() changes the settings, check() runs the module check,
// both with the readings paused.
import { ref, onBeforeUnmount } from 'vue';
import { Vl53l1x } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const ADDRESS = 0x29;
const RATE_EVERY_MS = 1000;
export const DEFAULTS = { mode: 'long', budget: 100, roi: 16 };
// the budgets per mode atiic's configure() takes (the ULD's that ST's
// datasheet, DS12385 3.5.2, allows)
export const BUDGETS = { short: [20, 33, 50, 100, 200, 500], long: [33, 50, 100, 200, 500] };
export const ROI_SIDES = [16, 12, 8, 6, 4];
// the check: readings at each ROI, largest first, at long 100 ms
const CHECK_READINGS = 10;
const CHECK_ROIS = [16, 8, 4];
const CHECK_SETTINGS = { mode: 'long', budget: 100 };
// the ULD's range status codes (VL53L1X_GetRangeStatus: 0 no error, 1
// sigma failed, 2 signal failed, 7 wrap-around), for people
export const STATUS = {
  0: 'valid',
  1: 'too uncertain (sigma)',
  2: 'too little light back (signal)',
  4: 'out of bounds',
  7: 'wrap-around: past its range',
  13: 'region of interest past the array\'s edge',
};

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => Math.sqrt(mean(a.map((x) => (x - mean(a)) ** 2)));

// onValid(t ms, distance mm): called with each valid reading (a page's own
// sums, e.g. speed from distances)
export function useVl53l1x({ windowMs = 15000, settings: initial = DEFAULTS, onValid = null } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { distance mm, status, valid }
  const rate = ref(0);
  const span = ref({ min: null, max: null }); // the valid readings' range, since connecting
  const series = makeSeries(1, windowMs);
  const signal = makeSeries(1, windowMs); // kcps
  const ambient = makeSeries(1, windowMs); // kcps a SPAD
  const settings = ref({ ...DEFAULTS, ...initial });
  const checked = ref(null); // the check's rows, { roi, readings, valid, distance, sd, signal, ambient, spads }, and pass

  let bus = null;
  let tof = null;
  let generation = 0;
  let running = null; // the loop's promise, awaited before a change

  async function loop(gen) {
    let reads = 0, rateFrom = performance.now();
    try {
      while (gen === generation) {
        const r = await tof.measure(); // waits for the next ranging
        const t = performance.now();
        const valid = r.status === 0;
        signal.push(t, [r.signal]);
        if (r.spads) ambient.push(t, [r.ambient / r.spads]);
        if (valid) {
          series.push(t, [r.distance]);
          onValid?.(t, r.distance);
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
      failure.value = { title: 'Reading the VL53L1X failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      await apply(settings.value);
      span.value = { min: null, max: null };
      checked.value = null;
      resume();
    } catch (e) {
      failure.value = { title: 'The VL53L1X didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function apply({ mode, budget, roi }) {
    await tof.configure({ mode, budget });
    await tof.roi({ width: roi, height: roi });
    series.clear();
    signal.clear();
    ambient.clear();
  }

  function resume() {
    generation++;
    running = loop(generation);
    state.value = 'running';
  }

  // the readings paused, fn(tof) run, the readings again
  async function paused(fn, busyState, what) {
    if (state.value !== 'running') return;
    generation++;
    await running;
    state.value = busyState;
    try {
      await fn();
      resume();
    } catch (e) {
      failure.value = { title: `${what} failed`, detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // new settings: { mode, budget, roi (a side, SPADs) }; a budget the mode
  // doesn't have becomes the nearest it has
  async function setup(change) {
    const next = { ...settings.value, ...change };
    const budgets = BUDGETS[next.mode];
    if (!budgets.includes(next.budget)) next.budget = budgets.reduce((a, b) => (Math.abs(b - next.budget) < Math.abs(a - next.budget) ? b : a));
    settings.value = next;
    await paused(() => apply(next), 'configuring', 'Changing the settings');
  }

  // the module check: CHECK_READINGS readings at each of CHECK_ROIS, long
  // mode 100 ms, held still; then the page's settings again. It passes
  // when the full array ranges valid every time and a smaller region uses
  // fewer SPADs and gets less light (the board test's checks, atiic's
  // test/board/vl53l1x.test.js)
  async function check() {
    await paused(async () => {
      const rows = [];
      for (const roi of CHECK_ROIS) {
        await tof.configure(CHECK_SETTINGS);
        await tof.roi({ width: roi, height: roi });
        await tof.measure(); // ranged with the old region
        const rs = [];
        for (let i = 0; i < CHECK_READINGS; i++) rs.push(await tof.measure());
        const ok = rs.filter((r) => r.status === 0);
        const ds = ok.map((r) => r.distance);
        rows.push({
          roi, readings: rs.length, valid: ok.length,
          distance: ds.length ? mean(ds) : null, sd: ds.length ? sd(ds) : null,
          signal: mean(rs.map((r) => r.signal)), ambient: mean(rs.map((r) => r.ambient)), spads: Math.round(mean(rs.map((r) => r.spads))),
          status: rs.find((r) => r.status !== 0)?.status ?? 0,
        });
      }
      const shrinks = rows.every((r, i) => i === 0 || (r.spads < rows[i - 1].spads && r.signal < rows[i - 1].signal));
      const fits = rows.every((r) => r.spads > 0 && r.spads <= r.roi ** 2);
      checked.value = { rows, pass: rows[0].valid === rows[0].readings && shrinks && fits, shrinks, fits };
      await apply(settings.value);
    }, 'checking', 'The check');
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
      failure.value = { title: 'The bridge was unplugged', detail: '', error: '' };
      disconnect();
    }
  }
  if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
  onBeforeUnmount(() => {
    if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
    disconnect();
  });

  return { state, failure, latest, rate, span, settings, checked, source: series.source, signalSource: signal.source, ambientSource: ambient.source, connect, disconnect, setup, check };
}
