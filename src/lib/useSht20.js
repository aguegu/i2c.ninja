// An SHT20 on the CH341 dongle, for a page: found by its electronic ID at
// 0x40, read by atiic's driver every READ_MS (its datasheet: active no more
// than 10% of the time, or it warms itself past 0.1 C; a pair of readings
// keeps it busy ~115 ms), the last windowMs kept for the charts.
import { ref, onBeforeUnmount } from 'vue';
import { Sht20 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000;
const READ_MS = 2000;
// the datasheet's Magnus coefficients over water (6.1): beta_w, lambda_w (C)
const BETA_W = 17.62;
const LAMBDA_W = 243.12;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// the dew point, C: the temperature the air, cooled, would hold this
// moisture at 100 %RH (the Magnus formula turned round, the datasheet's
// coefficients)
export function dewPoint(t, rh) {
  const g = Math.log(rh / 100) + (BETA_W * t) / (LAMBDA_W + t);
  return (LAMBDA_W * g) / (BETA_W - g);
}

export function useSht20({ windowMs = 120000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { temperature C, humidity %, dewPoint C }
  const series = { temperature: makeSeries(2, windowMs), humidity: makeSeries(1, windowMs) };

  let bus = null;
  let sht = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { temperature, humidity } = await sht.measure();
        const dp = dewPoint(temperature, humidity);
        series.temperature.push(t0, [temperature, dp]);
        series.humidity.push(t0, [humidity]);
        latest.value = { temperature, humidity, dewPoint: dp };
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the SHT20 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(0x40)) || !(await Sht20.chip.identify(bus, 0x40))) {
        failure.value = { title: 'No SHT20 answers', detail: 'Nothing at 0x40 reads an SHT2x electronic ID: check the four wires and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      sht = new Sht20(bus, 0x40);
      await sht.init();
      Object.values(series).forEach((s) => s.clear());
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The SHT20 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    sht = null;
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

  return {
    state, failure, latest, readMs: READ_MS,
    temperatureSource: series.temperature.source, humiditySource: series.humidity.source,
    connect, disconnect,
  };
}
