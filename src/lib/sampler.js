// The sampling core, shared by the USB worker (lib/sampler.worker.js) and the
// main-thread runner for Bluetooth (lib/mainSampler.js) — Web Bluetooth can't
// run in a worker. openBus(m) opens the bus for an 'open' message (USB by
// match, or a Dart over BLE); post(msg) emits to the page. The message
// protocol is lib/useSources.js's:
//   in:  { type: 'open', ..., sclHz, kinds: { key: 'ACCELEROMETERS', ... } }
//        { type: 'start', chosen: { key: { ci, address } }, readMs, periods: { key: ms } }
//        { type: 'stop' }
//   out: { type: 'found', found: { key: [{ ci, address }] } }
//        { type: 'reading', t, v }  { type: 'error'|'failure', ... }  { type: 'stopped' }
import * as SOURCES from './sources.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createSampler({ openBus, post }) {
  let bus = null;
  let kinds = {};
  let sensors = {};
  let generation = 0;
  let running = null;

  async function scan() {
    const found = {};
    for (const [key, chips] of Object.entries(kinds)) {
      const list = [];
      for (const [ci, chip] of chips.entries()) {
        for (const a of chip.addresses) {
          if (list.some((f) => f.address === a) || !(await bus.acks(a))) continue;
          if (await chip.detect(bus, a)) list.push({ ci, address: a });
        }
      }
      found[key] = list;
    }
    return found;
  }

  // every readMs, each sensor read when its own period (periods[key], ms)
  // is due, its last reading repeated in between: a slow chip (a
  // magnetometer at 10 Hz) doesn't slow the others down
  async function loop(gen, readMs, periods = {}) {
    const due = {};
    const last = {};
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const v = {};
        for (const k of Object.keys(sensors)) {
          if (!(k in last) || t0 >= due[k]) {
            last[k] = await sensors[k].read();
            due[k] = t0 + (periods[k] ?? readMs) - readMs / 2; // half a step early: read on the step nearest its period
          }
          v[k] = last[k];
        }
        post({ type: 'reading', t: performance.timeOrigin + t0, v });
        await delay(Math.max(0, readMs - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      post({ type: 'failure', title: 'Reading the sensor failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', name: e.name, message: e.message });
    }
  }

  async function stop() {
    generation++;
    await running;
    const b = bus;
    bus = null;
    sensors = {};
    try {
      await b?.close();
    } catch {
      // gone already
    }
  }

  async function handle(m) {
    if (m.type === 'open') {
      await stop();
      kinds = Object.fromEntries(Object.entries(m.kinds).map(([key, name]) => [key, SOURCES[name].chips]));
      try {
        bus = await openBus(m);
      } catch (e) {
        post({ type: 'error', stage: 'open', name: e.name, message: e.message });
        return;
      }
      try {
        post({ type: 'found', found: await scan() });
      } catch (e) {
        post({ type: 'failure', title: 'Scanning the bus failed', detail: '', name: e.name, message: e.message });
      }
    } else if (m.type === 'start') {
      generation++;
      await running;
      try {
        sensors = {};
        for (const [key, { ci, address }] of Object.entries(m.chosen)) sensors[key] = await kinds[key][ci].open(bus, address);
        generation++;
        running = loop(generation, m.readMs, m.periods);
      } catch (e) {
        post({ type: 'failure', title: 'The sensor didn\'t start', detail: '', name: e.name, message: e.message });
      }
    } else if (m.type === 'stop') {
      await stop();
      post({ type: 'stopped' });
    }
  }

  return { handle, stop };
}
