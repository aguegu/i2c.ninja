// An MLX90614 on the CH341 bridge, for a page: found by its config word's
// PEC at 0x5A (SMBus: 100 kHz at most), read by atiic's driver every
// READ_MS: the object's temperature and its own (ambient); the last
// windowMs kept.
import { ref, onBeforeUnmount } from 'vue';
import { Mlx90614 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000; // its SMBus top: faster upsets the bus
const ADDRESS = 0x5a;
const READ_MS = 250; // its refresh: ~100-140 ms with the factory filters (datasheet Table 11)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMlx90614({ windowMs = 30000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { object, ambient } C
  const series = makeSeries(2, windowMs);

  let bus = null;
  let mlx = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { ambient, object } = await mlx.measure();
        series.push(t0, [object, ambient]);
        latest.value = { object, ambient };
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the MLX90614 failed', detail: 'Was the bridge unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS)) || !(await Mlx90614.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No MLX90614 answers', detail: 'Nothing at 0x5A answers with a good PEC: check the four wires (VIN, GND, SCL, SDA) and the module\'s power.', error: '' };
        await disconnect();
        return;
      }
      mlx = new Mlx90614(bus, ADDRESS);
      await mlx.init();
      series.clear();
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The MLX90614 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
      await disconnect();
    }
  }

  async function disconnect() {
    generation++;
    const b = bus;
    bus = null;
    mlx = null;
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

  return { state, failure, latest, source: series.source, connect, disconnect };
}
