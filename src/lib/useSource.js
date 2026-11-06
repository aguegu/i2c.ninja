// A physics page's live reading: connect the dongle, scan the bus for every
// chip of one quantity (lib/sources.js), read the chosen one every READ_MS
// as [x, y, z] in its unit, the last windowMs kept for the chart. Several
// found: choose(i) switches between them.
import { ref, onBeforeUnmount } from 'vue';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const READ_MS = 20; // 50 a second: smooth enough to see a shake

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSource(kind, { windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const found = ref([]); // [{ name, address }]
  const chosen = ref(-1);
  const latest = ref(null); // [x, y, z]
  const series = makeSeries(3, windowMs);

  const listeners = new Set();
  // fn(t ms, [x, y, z]) on each reading, for a page that works per reading (adding up a gyro)
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let bus = null;
  let sensor = null;
  let generation = 0;
  let running = null;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const v = await sensor.read();
        latest.value = v;
        series.push(t0, v);
        for (const fn of listeners) fn(t0, v);
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${found.value[chosen.value]?.name ?? 'sensor'} failed`, detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function choose(i) {
    const f = found.value[i];
    if (!f || !bus) return;
    generation++;
    await running;
    chosen.value = i;
    series.clear();
    latest.value = null;
    try {
      sensor = await f.chip.open(bus, f.address);
      generation++;
      running = loop(generation);
    } catch (e) {
      failure.value = { title: `The ${f.name} didn't start`, detail: '', error: `${e.name}: ${e.message}` };
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
      const list = [];
      for (const chip of kind.chips) {
        for (const a of chip.addresses) {
          if (list.some((f) => f.address === a) || !(await bus.acks(a))) continue;
          if (await chip.detect(bus, a)) list.push({ name: chip.name, address: a, chip });
        }
      }
      found.value = list;
      if (!list.length) {
        failure.value = { title: 'No sensor for this found', detail: `None of ${kind.chips.map((c) => c.name).join(', ')} answers on the bus: check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      state.value = 'running';
      await choose(0);
    } catch (e) {
      failure.value = { title: 'Scanning the bus failed', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    sensor = null;
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

  return { state, failure, found, chosen, latest, unit: kind.unit, noun: kind.noun, chips: kind.chips, source: series.source, onReading, connect, disconnect, choose };
}
