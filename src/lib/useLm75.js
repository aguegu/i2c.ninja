// An LM75 on a bridge, for a page: found at 0x48-0x4F (no ID register:
// atiic's range check, the CHT8305C and INA231 asked first there as they
// carry IDs), its power-up state written back (it has no reset command), read
// every CONVERSION_MS (it converts on its own, a read gives the last), its
// watchdog limits read once; the last windowMs kept. bits: 9 (an LM75) or 11
// (NXP's LM75A): nothing on the bus tells them apart, so the page asks.
import { ref, onBeforeUnmount } from 'vue';
import { Lm75, Cht8305, Ina231 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000;
const OTHERS = [Cht8305, Ina231]; // chips with an ID at these addresses: not taken for an LM75
// failed readings in a row before the page gives up: one now and then is
// skipped (an LM75 run at 5 V from a 3.3 V bridge misses some: its inputs
// want 0.7 x V_S high), as the humidity pages do. A module with A0-A2 left
// open drifts: ours answered 0x49, then 0x4A, for seconds at a time, until
// they were soldered to GND (NXP 7.3: "should not be left floating")
const FAILS_IN_A_ROW = 3;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useLm75({ windowMs = 120000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const address = ref(null);
  const latest = ref(null); // C
  const limits = ref(null); // { hysteresis, overtemperature } C
  const series = makeSeries(1, windowMs);
  const skipped = ref(0); // readings that failed and were skipped
  const bits = ref(9); // 9: an LM75, 0.5 C; 11: an LM75A, 0.125 C

  let bus = null;
  let lm = null;
  let generation = 0;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        try {
          const c = await lm.temperature();
          inARow = 0;
          series.push(t0, [c]);
          latest.value = c;
        } catch (e) {
          if (gen !== generation) return;
          inARow++;
          skipped.value++;
          if (inARow >= FAILS_IN_A_ROW) throw e;
        }
        await delay(Math.max(0, Lm75.CONVERSION_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the LM75 failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Are its A0, A1 and A2 tied to GND or VCC? Left open (as on many modules), its address drifts and it vanishes for seconds: solder them. Run from 5 V, its inputs want more than a 3.3 V bridge gives: power it from 3.3 V. Or a wire pulled. Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // a check that throws (the INA231's reads before it asks) is a no: an
  // address that answered its probe but not a read isn't that chip
  const is = async (D, a) => {
    try {
      return await D.chip.identify(bus, a);
    } catch {
      return false;
    }
  };

  async function find() {
    for (const a of Lm75.addresses) {
      if (!(await bus.acks(a))) continue;
      let other = false;
      for (const D of OTHERS) if (D.addresses.includes(a) && (await is(D, a))) other = true;
      if (!other && (await is(Lm75, a))) return a;
    }
    return null;
  }

  async function connect(via = 'usb') {
    failure.value = null;
    state.value = 'connecting';
    try {
      bus = await openDongle(SCL_HZ, via);
    } catch (e) {
      failure.value = { ...explain(e, platform), error: e.message };
      state.value = 'idle';
      return;
    }
    try {
      address.value = await find();
      if (address.value === null) {
        failure.value = { title: 'No LM75 answers', detail: `Nothing at ${Lm75.addresses.map(hex).join(', ')} answers as an LM75: check the four wires, the module's power, and its A0-A2 pins (tied to GND or VCC, not left open).`, error: '' };
        await disconnect();
        return;
      }
      lm = new Lm75(bus, address.value, { bits: bits.value });
      await lm.init();
      limits.value = await lm.limits();
      series.clear();
      latest.value = null;
      skipped.value = 0;
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The LM75 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the chip it is, from now on (the chart cleared: its steps change)
  function setBits(n) {
    bits.value = n;
    if (lm) lm.bits = n;
    series.clear();
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    lm = null;
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

  return { state, failure, address, latest, limits, skipped, bits, setBits, source: series.source, connect, disconnect };
}
