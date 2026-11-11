// An ITG-3200 on the CH341 bridge, for a page: woken (asleep, its WHO_AM_I
// reads 0) and found at 0x68 or 0x69, set up by atiic's driver (+/-2000
// deg/s, a 98 Hz filter at 1 kHz), read every READ_MS; each reading to
// onReading's listeners (a page adds them up: lib/useTurned.js). The last
// windowMs kept for the chart.
import { perFrame } from './frame.js';
import { ref, onBeforeUnmount } from 'vue';
import { Itg3200 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its fast mode
const READ_MS = 10; // 100 reads a second: a turn added up in small steps

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useItg3200({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { x, y, z } deg/s
  const publish = perFrame((v) => { latest.value = v; }); // once a frame, the newest
  const temperature = ref(null); // C
  const series = makeSeries(3, windowMs);
  const listeners = new Set();
  // fn(t ms, [x, y, z] deg/s) on each reading
  const onReading = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  let bus = null;
  let gyro = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const m = await gyro.measure();
        const g = m.gyroscopes;
        temperature.value = m.temperature;
        publish.push(g);
        series.push(t0, [g.x, g.y, g.z]);
        for (const fn of listeners) fn(t0, [g.x, g.y, g.z]);
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the ITG-3200 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      address.value = null;
      for (const a of Itg3200.addresses) {
        if (!(await bus.acks(a))) continue;
        await bus.write(a, Itg3200.chip.idWake); // asleep, its WHO_AM_I reads 0
        await delay(Itg3200.chip.idWakeMs);
        if (await Itg3200.chip.identify(bus, a)) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: 'No ITG-3200 answers', detail: `Nothing at ${Itg3200.addresses.map(hex).join(' or ')} reads as one: check the four wires and the module's power. (An MPU-6050 at 0x68 is told apart and not taken for it.)`, error: '' };
        await disconnect();
        return;
      }
      gyro = new Itg3200(bus, address.value);
      await gyro.init();
      series.clear();
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The ITG-3200 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    gyro = null;
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

  return { state, failure, address, latest, temperature, source: series.source, onReading, connect, disconnect };
}
