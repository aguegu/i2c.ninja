// The sensors read off the page's main thread (lib/useSources.js runs it): a
// busy frame there no longer delays a reading, so they keep their pace and
// the filter its timing. The page shows the chooser (a worker can't) and
// hands over what it picked; this opens it again (getDevices), scans the
// bus for the page's kinds (lib/sources.js, by name), opens the chips the
// page chose and reads them every readMs, posting each round with its time
// on the page's clock (timeOrigin differs between the two).
//   in:  { type: 'open', match | fake, sclHz, kinds: { key: 'ACCELEROMETERS', ... } }
//        { type: 'start', chosen: { key: { ci, address } }, readMs }
//        { type: 'stop' }
//   out: { type: 'found', found: { key: [{ ci, address }] } }
//        { type: 'reading', t, v: { key: [x, y, z] } }
//        { type: 'error', stage: 'open', name, message }  (the bridge didn't open)
//        { type: 'failure', title, detail, name, message } (after it opened)
//        { type: 'stopped' }
import * as SOURCES from './sources.js';
import { adapterFor } from './dongle.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let bus = null;
let kinds = {};
let sensors = {};
let generation = 0;
let running = null;

async function openBus(m) {
  if (m.fake) {
    const { FakeDongle } = await import('./fakeDongle.js');
    return new FakeDongle(m.fake);
  }
  const devices = await navigator.usb.getDevices();
  const d = devices.find((x) => x.vendorId === m.match.vendorId && x.productId === m.match.productId && x.serialNumber === m.match.serialNumber);
  if (!d) throw Object.assign(new Error('the bridge chosen is no longer there'), { name: 'NotFoundError' });
  return new (adapterFor(d))(d).open(m.sclHz);
}

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

async function loop(gen, readMs) {
  try {
    while (gen === generation) {
      const t0 = performance.now();
      const v = {};
      for (const k of Object.keys(sensors)) v[k] = await sensors[k].read();
      postMessage({ type: 'reading', t: performance.timeOrigin + t0, v });
      await delay(Math.max(0, readMs - (performance.now() - t0)));
    }
  } catch (e) {
    if (gen !== generation) return;
    postMessage({ type: 'failure', title: 'Reading the sensor failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', name: e.name, message: e.message });
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

onmessage = async ({ data: m }) => {
  if (m.type === 'open') {
    await stop();
    kinds = Object.fromEntries(Object.entries(m.kinds).map(([key, name]) => [key, SOURCES[name].chips]));
    try {
      bus = await openBus(m);
    } catch (e) {
      postMessage({ type: 'error', stage: 'open', name: e.name, message: e.message });
      return;
    }
    try {
      postMessage({ type: 'found', found: await scan() });
    } catch (e) {
      postMessage({ type: 'failure', title: 'Scanning the bus failed', detail: '', name: e.name, message: e.message });
    }
  } else if (m.type === 'start') {
    generation++;
    await running;
    try {
      sensors = {};
      for (const [key, { ci, address }] of Object.entries(m.chosen)) sensors[key] = await kinds[key][ci].open(bus, address);
      generation++;
      running = loop(generation, m.readMs);
    } catch (e) {
      postMessage({ type: 'failure', title: 'The sensor didn\'t start', detail: '', name: e.name, message: e.message });
    }
  } else if (m.type === 'stop') {
    await stop();
    postMessage({ type: 'stopped' });
  }
};
