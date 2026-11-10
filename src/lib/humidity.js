// What the humidity pages share: the dew point, and a composable that finds
// a humidity sensor on the CH341 dongle and reads it every readMs (both
// chips warm themselves if read too often: their datasheets ask for a
// reading every 2 s or so), the last windowMs kept for the charts.
import { ref, onBeforeUnmount } from 'vue';
import Dart from 'atiic/adapters/dart';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000;
// the Magnus coefficients over water, as Sensirion's SHT20 datasheet gives
// them (6.1): beta_w, lambda_w (C)
const BETA_W = 17.62;
const LAMBDA_W = 243.12;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// the Magnus formula's leading constant, hPa: the saturation vapour
// pressure over water at 0 C, with the same beta_w and lambda_w (WMO-No. 8,
// Guide to Instruments and Methods of Observation, the humidity formulae)
const E_W0_HPA = 6.112;
// the water vapour's molar mass (g/mol) and the gas constant (J/(mol K),
// CODATA 2018, exact): absolute humidity from the vapour pressure
const M_WATER = 18.01528;
const R_GAS = 8.314462618;
const KELVIN = 273.15;
const PA_PER_HPA = 100;

// the dew point, C: the temperature the air, cooled, would hold this
// moisture at 100 %RH (the Magnus formula turned round)
export function dewPoint(t, rh) {
  const g = Math.log(rh / 100) + (BETA_W * t) / (LAMBDA_W + t);
  return (LAMBDA_W * g) / (BETA_W - g);
}

// the most water vapour air at t C can hold, as its pressure, hPa
export const saturation = (t) => E_W0_HPA * Math.exp((BETA_W * t) / (LAMBDA_W + t));

// the water vapour's own pressure, hPa: rh % of the saturation
export const vapourPressure = (t, rh) => (rh / 100) * saturation(t);

// grams of water vapour in a cubic metre of air (the ideal gas law)
export const absoluteHumidity = (t, rh) => (vapourPressure(t, rh) * PA_PER_HPA * M_WATER) / (R_GAS * (t + KELVIN));

// Driver: an atiic driver with init() and measure() -> { temperature,
// humidity }, its chip.identify(bus, address) and its addresses. A driver
// with RESOLUTIONS (the SHT20) also: setResolution(name) and periodMs(), the
// fastest its datasheet allows without warming it; read that often, at
// `resolution` (setResolution() here changes it, the readings paused). A
// driver with STRETCH_MS (the SHT20) on a dart: hold master mode, dart
// waiting on the sensor's held SCL (the CH341 and CH347 don't)
// Driver may be a list (a physics page): the first that answers is read.
export function useHumidity(Drivers, { readMs: fixedMs = 2000, windowMs = 120000, resolution: firstResolution = null } = {}) {
  const list = Array.isArray(Drivers) ? Drivers : [Drivers];
  let Driver = list[0];
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // { temperature C, humidity %, dewPoint C, absolute g/m3 }
  const series = { temperature: makeSeries(2, windowMs), humidity: makeSeries(1, windowMs), absolute: makeSeries(1, windowMs) };
  const name = ref(list.map((D) => D.chip.name).join(' or '));
  const resolutionsOf = (D) => (D.RESOLUTIONS ? Object.keys(D.RESOLUTIONS) : []);
  const resolutions = ref(list.length === 1 ? resolutionsOf(Driver) : []);
  const resolution = ref(firstResolution ?? resolutions.value[0] ?? null);
  const readMs = ref(fixedMs);
  const hold = ref(false); // hold master mode, on a dart

  let bus = null;
  let dev = null;
  let generation = 0;
  let running = null;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { temperature, humidity } = await dev.measure();
        const dp = dewPoint(temperature, humidity);
        const absolute = absoluteHumidity(temperature, humidity);
        series.temperature.push(t0, [temperature, dp]);
        series.humidity.push(t0, [humidity]);
        series.absolute.push(t0, [absolute]);
        latest.value = { temperature, humidity, dewPoint: dp, absolute };
        await delay(Math.max(0, readMs.value - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the ${name.value} failed`, detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      found: for (const D of list) {
        for (const a of D.addresses) {
          if ((await bus.acks(a)) && (await D.chip.identify(bus, a))) { Driver = D; address.value = a; break found; }
        }
      }
      if (address.value === null) {
        const where = [...new Set(list.flatMap((D) => D.addresses))].map(hex).join(' or ');
        failure.value = { title: `No ${name.value} answers`, detail: `Nothing at ${where} answers as an ${name.value}: check the four wires and the module's power.`, error: '' };
        await disconnect();
        return;
      }
      name.value = Driver.chip.name;
      if (list.length > 1) resolutions.value = resolutionsOf(Driver);
      hold.value = Boolean(Driver.STRETCH_MS) && bus instanceof Dart;
      if (hold.value) await bus.speed(SCL_HZ, Driver.STRETCH_MS);
      dev = new Driver(bus, address.value, { hold: hold.value });
      await dev.init();
      await applyResolution();
      Object.values(series).forEach((s) => s.clear());
      resume();
    } catch (e) {
      failure.value = { title: `The ${name.value} didn't start`, detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function applyResolution() {
    if (!resolutions.value.length || !resolution.value) return;
    await dev.setResolution(resolution.value);
    readMs.value = Math.ceil(dev.periodMs());
  }

  function resume() {
    generation++;
    running = loop(generation);
    state.value = 'running';
  }

  // another resolution: the readings paused, the sensor set, on again
  async function setResolution(r) {
    resolution.value = r;
    if (state.value !== 'running') return;
    generation++;
    await running;
    try {
      await applyResolution();
      resume();
    } catch (e) {
      failure.value = { title: `Setting the ${name.value}'s resolution failed`, detail: '', error: `${e.name}: ${e.message}` };
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
    state, failure, address, latest, readMs, resolution, resolutions, hold, name,
    temperatureSource: series.temperature.source, humiditySource: series.humidity.source, absoluteSource: series.absolute.source,
    connect, disconnect, setResolution,
  };
}
