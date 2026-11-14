// An AGS2602 on the bridge, for a page: found at 0x1A by its version's CRC
// (atiic's Ags2602.chip.identify), opened at 100 kHz (its manual's top),
// read every SAMPLE_MS (its sampling period, 2 s): the TVOC in ppb, whether
// it's ready (RDY clear: updated, warmed up), and its film's resistance. A
// failed reading now and then is skipped and counted; FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Ags2602 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain } from './dongle.js';
import { makeSeries } from './series.js';

export const SCL_HZ = Ags2602.chip.maxSclHz; // 100 kHz: the manual's top, board-tested
export const READ_MS = 2000; // its manual, Table 1: a sampling period of 2 s or more
const FAILS_IN_A_ROW = 3;
const ADDRESS = Ags2602.addresses[0];
const OHMS_PER_KOHM = 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAgs2602({ windowMs = 600000 } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { tvoc ppb, ready, kohm }
  const version = ref(null);
  const failed = ref({ count: 0, of: 0, last: null });
  const series = { tvoc: makeSeries(1, windowMs), kohm: makeSeries(1, windowMs) };

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        const t0 = performance.now();
        let r;
        try {
          const m = await dev.measure();
          r = { ...m, kohm: (await dev.resistance()) / OHMS_PER_KOHM };
          inARow = 0;
        } catch (e) {
          if (gen !== generation) return;
          inARow++;
          failed.value = { count: failed.value.count + 1, of: failed.value.of + 1, last: e.message };
          if (inARow >= FAILS_IN_A_ROW) throw e;
        }
        if (gen !== generation) return;
        if (r) {
          failed.value = { ...failed.value, of: failed.value.of + 1 };
          series.tvoc.push(t0, [r.tvoc]);
          series.kohm.push(t0, [r.kohm]);
          latest.value = r;
        }
        await delay(Math.max(0, READ_MS - (performance.now() - t0)));
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the AGS2602 failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Is its VCC on 5 V? Connect again.', error: `${e.name}: ${e.message}` };
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
      if (!(await bus.acks(ADDRESS)) || !(await Ags2602.chip.identify(bus, ADDRESS))) {
        failure.value = { title: 'No AGS2602 answers', detail: 'Nothing at 0x1A answers with a good CRC: check the four wires (VCC, SDA, GND, SCL; its pins in that order) and that VCC is on 5 V.', error: '' };
        await disconnect();
        return;
      }
      dev = new Ags2602(bus, ADDRESS);
      version.value = await dev.version();
      series.tvoc.clear();
      series.kohm.clear();
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The AGS2602 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
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
    state, failure, failed, latest, version, address: ADDRESS,
    tvocSource: series.tvoc.source, kohmSource: series.kohm.source,
    connect, disconnect,
  };
}
