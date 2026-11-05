// A MAX30102 on the CH341 dongle, for a page: found by its part ID at 0x57,
// set up by atiic's driver (red and IR, 100 samples a second), its FIFO
// read every READ_MS; the last ANALYSE_S of samples worked into a heartbeat
// (lib/ppg.js), the last windowMs kept for the charts.
import { ref, onBeforeUnmount } from 'vue';
import { Max30102 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';
import { split, beats, heartRate, ratioOfRatios } from './ppg.js';

const SCL_HZ = 400000;
const READ_MS = 50; // the FIFO holds 32 samples, 320 ms at 100 a second
const ANALYSE_S = 8;
const TEMPERATURE_EVERY_MS = 5000;
// a finger on it: the IR it returns, counts (r8845's module: ~2,300 bare,
// ~108,000 with a fingertip at the default 7 mA)
const FINGER_IR = 30000;
const ADDRESS = 0x57;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMax30102({ windowMs = 8000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  // { red, ir } raw; finger; bpm; ratio; temperature
  const latest = ref(null);
  const series = { raw: makeSeries(2, windowMs), beat: makeSeries(1, windowMs) };
  const beatMarks = ref([]); // the beats' times, for the chart

  let bus = null;
  let m = null;
  let generation = 0;
  let red = [], ir = [], times = [];

  async function loop(gen) {
    let tempAt = 0, temperature = null;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const got = await m.readFifo();
        got.forEach((s, i) => {
          const t = t0 - (got.length - 1 - i) * (1000 / m.rate);
          red.push(s.red); ir.push(s.ir); times.push(t);
          series.raw.push(t, [s.red, s.ir]);
        });
        const keep = Math.round(m.rate * ANALYSE_S);
        if (red.length > keep) { red = red.slice(-keep); ir = ir.slice(-keep); times = times.slice(-keep); }
        if (t0 - tempAt >= TEMPERATURE_EVERY_MS) { temperature = await m.temperature(); tempAt = t0; }
        if (got.length && ir.length > m.rate * 2) {
          const sIr = split(ir, m.rate), sRed = split(red, m.rate);
          const finger = ir.at(-1) > FINGER_IR;
          // the ripple as a chart: the newest samples' (re-worked each read)
          series.beat.clear();
          sIr.ac.forEach((v, i) => series.beat.push(times[i], [finger ? v : 0]));
          const peaks = finger ? beats(sIr.ac, m.rate) : [];
          beatMarks.value = peaks.map((i) => times[i]);
          latest.value = {
            red: red.at(-1), ir: ir.at(-1), finger,
            bpm: finger ? heartRate(peaks, m.rate) : null,
            ratio: finger ? ratioOfRatios(sRed, sIr) : null,
            temperature,
          };
        }
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the MAX30102 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS))) {
        failure.value = { title: 'No MAX30102 answers', detail: 'Nothing at 0x57: check the four wires (VIN, GND, SCL, SDA) and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      m = new Max30102(bus, ADDRESS);
      await m.init(); // checks its part ID
      red = []; ir = []; times = [];
      Object.values(series).forEach((s) => s.clear());
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The MAX30102 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    state.value = 'idle';
    try {
      await m?.sleep();
    } catch {
      // gone already
    }
    m = null;
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

  return {
    state, failure, latest, beatMarks,
    rawSource: series.raw.source, beatSource: series.beat.source,
    connect, disconnect,
  };
}
