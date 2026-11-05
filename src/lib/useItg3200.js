// An ITG-3200 on the CH341 dongle, for a page: woken (asleep, its WHO_AM_I
// reads 0) and found at 0x68 or 0x69, set up by atiic's driver (+/-2000
// deg/s, a 98 Hz filter at 1 kHz), read every READ_MS. The rates added up
// into angles turned (each step's rate times the time since the last),
// after its zero-rate bias is taken off: zero() measures that bias, held
// still. The last windowMs kept for the chart.
import { ref, onBeforeUnmount } from 'vue';
import { Itg3200 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000; // its fast mode
const READ_MS = 10; // 100 reads a second: the angles added up in small steps
const ZERO_MS = 2000; // held still this long to measure the bias
const AXES = ['x', 'y', 'z'];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useItg3200({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { x, y, z } deg/s, the bias taken off
  const temperature = ref(null); // C
  const bias = ref({ x: 0, y: 0, z: 0 }); // deg/s
  const zeroing = ref(false);
  const zeroed = ref(false);
  const angles = ref({ x: 0, y: 0, z: 0 }); // deg turned since the last reset
  const series = makeSeries(3, windowMs);

  let bus = null;
  let gyro = null;
  let generation = 0;
  let lastT = null;
  let sum = null; // while zeroing: { x, y, z, n }

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const m = await gyro.measure();
        const g = m.gyroscopes;
        temperature.value = m.temperature;
        if (sum) { for (const k of AXES) sum[k] += g[k]; sum.n++; }
        const c = Object.fromEntries(AXES.map((k) => [k, g[k] - bias.value[k]]));
        if (lastT !== null) {
          const dt = (t0 - lastT) / 1000;
          angles.value = Object.fromEntries(AXES.map((k) => [k, angles.value[k] + c[k] * dt]));
        }
        lastT = t0;
        latest.value = c;
        series.push(t0, [c.x, c.y, c.z]);
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the ITG-3200 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      lastT = null;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The ITG-3200 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // held still: the average rate over ZERO_MS is the bias, taken off after
  async function zero() {
    if (state.value !== 'running' || zeroing.value) return;
    zeroing.value = true;
    sum = { x: 0, y: 0, z: 0, n: 0 };
    await delay(ZERO_MS);
    const s = sum;
    sum = null;
    zeroing.value = false;
    if (!s || !s.n) return;
    bias.value = Object.fromEntries(AXES.map((k) => [k, s[k] / s.n]));
    zeroed.value = true;
    resetAngles();
  }

  function resetAngles() {
    angles.value = { x: 0, y: 0, z: 0 };
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    gyro = null;
    sum = null;
    zeroing.value = false;
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

  return { state, failure, address, latest, temperature, bias, zeroing, zeroed, angles, source: series.source, connect, disconnect, zero, resetAngles };
}
