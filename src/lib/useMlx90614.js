// An MLX90614 on the CH341 dongle, for a page: found by its config word's
// PEC at 0x5A (SMBus: 100 kHz at most), read by atiic's driver every
// READ_MS: the object's temperature (zone 1), its own (ambient), and on a
// dual-zone part (its config's bit 6) zone 2; the last windowMs kept.
import { ref, onBeforeUnmount } from 'vue';
import { Mlx90614 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

const SCL_HZ = 100000; // its SMBus top: faster upsets the bus
const ADDRESS = 0x5a;
const READ_MS = 250; // its refresh: ~100-140 ms with the factory filters (datasheet Table 11)
const CONFIG_DUAL = 0x40; // Config Register 1 bit 6: "dual IR sensor" (Table 9)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMlx90614({ windowMs = 30000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const dual = ref(false);
  const latest = ref(null); // { object, ambient, object2 } C
  const series = makeSeries(3, windowMs);

  let bus = null;
  let mlx = null;
  let generation = 0;

  async function loop(gen) {
    try {
      while (gen === generation) {
        const t0 = performance.now();
        const { ambient, object } = await mlx.measure();
        const object2 = dual.value ? await mlx.object(2) : null;
        series.push(t0, [object, ambient, object2 ?? ambient]);
        latest.value = { object, ambient, object2 };
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: 'Reading the MLX90614 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
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
      dual.value = Boolean(mlx.config & CONFIG_DUAL);
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
      failure.value = { title: 'The dongle was unplugged', detail: '', error: '' };
      disconnect();
    }
  }
  if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
  onBeforeUnmount(() => {
    if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
    disconnect();
  });

  return { state, failure, dual, latest, source: series.source, connect, disconnect };
}
