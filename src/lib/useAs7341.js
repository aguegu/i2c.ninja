// An AS7341 on a bridge, for a page: found at 0x39 by its ID, set up by
// atiic's driver at a gain (the integration its 50 ms), read back to back:
// each reading two measurements through its SMUX (F1-F4, then F5-F8; Clear
// and NIR in both), about 130 ms together. Its LED driver (the AS734x
// board's white LED) set between readings: its registers sit in a bank the
// measuring doesn't use.
import { ref, onBeforeUnmount } from 'vue';
import { As7341 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';

const SCL_HZ = 400000;
const ADDRESS = As7341.addresses[0];
export const GAINS = As7341.GAINS;
export const BANDS = As7341.BANDS; // nm: f1..f8, nir
// the LED's currents offered, mA: the chip drives to 258, the board's LED's
// own rating unknown, so the page stays low
export const LED_MA = [4, 8, 12, 20];

export function useAs7341() {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { f1..f8, clear, nir, saturated }
  const gain = ref(64);
  const led = ref(0); // mA, 0 off
  let ledAsked = null; // a change waiting for the gap between readings

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        if (ledAsked !== null) {
          const mA = ledAsked;
          ledAsked = null;
          await dev.led(mA);
        }
        const r = await dev.measure();
        if (gen !== generation) return;
        latest.value = r;
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the AS7341 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function start() {
    dev = new As7341(bus, ADDRESS, { gain: gain.value });
    await dev.init();
    await dev.led(led.value);
    generation++;
    loop(generation);
    state.value = 'running';
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
      if (!(await bus.acks(ADDRESS)) || !(await As7341.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No AS7341 answers', detail: 'Nothing at 0x39 reads its ID: check the four wires and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      latest.value = null;
      await start();
    } catch (e) {
      failure.value = { title: 'The AS7341 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  // the LED, mA (0 off): set before the next reading
  function setLed(mA) {
    led.value = mA;
    if (state.value === 'running') ledAsked = mA;
  }

  async function setGain(g) {
    gain.value = g;
    if (state.value !== 'running') return;
    generation++;
    try {
      await start();
    } catch (e) {
      failure.value = { title: 'The AS7341 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    const d = dev;
    bus = null;
    dev = null;
    state.value = 'idle';
    try {
      await d?.sleep();
    } catch {
      // gone already
    }
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

  return { state, failure, latest, gain, setGain, led, setLed, connect, disconnect };
}
