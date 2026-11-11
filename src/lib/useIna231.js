// An INA231 on the CH341 bridge, for a page: found by its ID among
// 0x40-0x4F, set up by atiic's driver for a shunt, read every READ_MS: bus
// voltage, shunt voltage, current, power; the last windowMs kept for the
// charts, and the energy and charge since connecting (or a reset) summed.
import { ref, onBeforeUnmount } from 'vue';
import { Ina231 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 400000;
const READ_MS = 50; // 20 readings a second: the chip converts every 2.2 ms, averaging 1
const RATE_EVERY_MS = 1000;
const MS_PER_HOUR = 3600000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useIna231({ windowMs = 10000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle'); // idle, connecting, running
  const failure = ref(null);
  const shunt = ref(0.1); // ohms: R100
  const address = ref(null);
  const calibration = ref(null); // what the driver wrote: Equation 1
  const currentLsb = ref(null);
  // { bus V, shunt V, current A, power W }
  const latest = ref(null);
  const energy = ref({ wh: 0, ah: 0, since: null }); // summed reading by reading
  const rate = ref(0);
  const series = { current: makeSeries(1, windowMs), power: makeSeries(1, windowMs), bus: makeSeries(1, windowMs) };

  let bus = null;
  let ina = null;
  let generation = 0;

  async function loop(gen) {
    let last = performance.now(), reads = 0, rateFrom = last;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const r = await ina.measure();
        const dtH = (t0 - last) / MS_PER_HOUR;
        last = t0;
        energy.value = { ...energy.value, wh: energy.value.wh + r.power * dtH, ah: energy.value.ah + r.current * dtH };
        series.current.push(t0, [r.current * 1000]);
        series.power.push(t0, [r.power * 1000]);
        series.bus.push(t0, [r.bus]);
        latest.value = r;
        reads++;
        if (t0 - rateFrom >= RATE_EVERY_MS) {
          rate.value = (reads * 1000) / (t0 - rateFrom);
          reads = 0;
          rateFrom = t0;
        }
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the INA231 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function start() {
    generation++;
    ina = new Ina231(bus, address.value, { shunt: Number(shunt.value) });
    calibration.value = ina.calibration;
    currentLsb.value = ina.currentLsb;
    await ina.init();
    resetEnergy();
    loop(generation);
  }

  function resetEnergy() {
    energy.value = { wh: 0, ah: 0, since: new Date() };
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
      const acks = (await bus.scan()).filter((a) => Ina231.addresses.includes(a));
      address.value = null;
      for (const a of acks) {
        if (await Ina231.chip.identify(bus, a)) { address.value = a; break; }
      }
      if (address.value === null) {
        failure.value = {
          title: 'No INA231 answers',
          detail: 'Nothing at 0x40-0x4F reads TI\'s ID: check the four I2C wires and the module\'s power.',
          error: acks.length ? `answering there: ${acks.map(hex).join(', ')}` : '',
        };
        await disconnect();
        return;
      }
      Object.values(series).forEach((s) => s.clear());
      await start();
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The INA231 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    state.value = 'idle';
    try {
      await ina?.sleep();
    } catch {
      // gone already
    }
    ina = null;
    try {
      await b?.close();
    } catch {
      // gone already
    }
  }

  // a new shunt value: the calibration recomputed and written
  async function setShunt(ohms) {
    shunt.value = ohms;
    if (state.value !== 'running') return;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The INA231 didn\'t take the new shunt', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
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

  return {
    state, failure, shunt, address, calibration, currentLsb, latest, energy, rate,
    currentSource: series.current.source, powerSource: series.power.source, busSource: series.bus.source,
    connect, disconnect, setShunt, resetEnergy,
  };
}
