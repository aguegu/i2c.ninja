// What the humidity pages share: the dew point, and a composable that finds
// a humidity sensor on the CH341 dongle and reads it every readMs (both
// chips warm themselves if read too often: their datasheets ask for a
// reading every 2 s or so), the last windowMs kept for the charts.
import { ref, onBeforeUnmount } from 'vue';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000;
// the Magnus coefficients over water, as Sensirion's SHT20 datasheet gives
// them (6.1): beta_w, lambda_w (C)
const BETA_W = 17.62;
const LAMBDA_W = 243.12;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// the dew point, C: the temperature the air, cooled, would hold this
// moisture at 100 %RH (the Magnus formula turned round)
export function dewPoint(t, rh) {
  const g = Math.log(rh / 100) + (BETA_W * t) / (LAMBDA_W + t);
  return (LAMBDA_W * g) / (BETA_W - g);
}

// Driver: an atiic driver with init() and measure() -> { temperature,
// humidity }, its chip.identify(bus, address) and its addresses
export function useHumidity(Driver, { readMs = 2000, windowMs = 120000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { temperature C, humidity %, dewPoint C }
  const series = { temperature: makeSeries(2, windowMs), humidity: makeSeries(1, windowMs) };
  const name = Driver.chip.name;

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { temperature, humidity } = await dev.measure();
        const dp = dewPoint(temperature, humidity);
        series.temperature.push(t0, [temperature, dp]);
        series.humidity.push(t0, [humidity]);
        latest.value = { temperature, humidity, dewPoint: dp };
        await delay(Math.max(0, readMs - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${name} failed`, detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      for (const a of Driver.addresses) {
        if ((await bus.acks(a)) && (await Driver.chip.identify(bus, a))) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = { title: `No ${name} answers`, detail: `Nothing at ${Driver.addresses.map(hex).join(' or ')} answers as an ${name}: check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      dev = new Driver(bus, address.value);
      await dev.init();
      Object.values(series).forEach((s) => s.clear());
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: `The ${name} didn't start`, detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    dev = null;
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
    state, failure, address, latest, readMs,
    temperatureSource: series.temperature.source, humiditySource: series.humidity.source,
    connect, disconnect,
  };
}
