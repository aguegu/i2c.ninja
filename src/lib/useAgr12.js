// An AGR12 (I2C version) on the bridge, for a page: there's
// nothing to identify it by (atiic's Agr12: read alone it answers 0xFF, as an
// erased EEPROM), so the page is its name. Opened at 20 kHz (its limit is 30
// kHz), 0x50 checked to answer, refused if 0x51-0x53 answer too (an AT24C04,
// 08 or 16 EEPROM's signature: the measurement command would write into it;
// a lone AT24C01/02 at 0x50 can't be told apart, the page warns), then read
// one measurement after another (80 ms each, about 11 a second): the gauge
// pressure, kPa. A failed reading now and then is skipped and counted;
// FAILS_IN_A_ROW stop it.
import { ref, onBeforeUnmount } from 'vue';
import { Agr12 } from 'atiic';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from './dongle.js';
import { makeSeries } from './series.js';

export const SCL_HZ = 20000; // the CH341's and CH347's slowest; dart any
const FAILS_IN_A_ROW = 3;
const ADDRESS = Agr12.addresses[0];
const EEPROM_BLOCKS = [0x51, 0x52, 0x53]; // an AT24C04-16's further blocks

export function useAgr12({ windowMs = 120000, onReading = null } = {}) {
  const platform = detectPlatform();
  const state = ref('idle');
  const failure = ref(null);
  const latest = ref(null); // { pressure kPa }
  const failed = ref({ count: 0, of: 0, last: null });
  const series = { pressure: makeSeries(1, windowMs) };

  let bus = null;
  let dev = null;
  let generation = 0;

  async function loop(gen) {
    let inARow = 0;
    try {
      while (gen === generation) {
        let r;
        try {
          r = await dev.measure();
          inARow = 0;
        } catch (e) {
          if (gen !== generation) return;
          inARow++;
          failed.value = { count: failed.value.count + 1, of: failed.value.of + 1, last: e.message };
          if (inARow >= FAILS_IN_A_ROW) throw e;
          continue;
        }
        if (gen !== generation) return;
        failed.value = { ...failed.value, of: failed.value.of + 1 };
        const t = performance.now();
        series.pressure.push(t, [r.pressure]);
        latest.value = r;
        onReading?.(t, r);
      }
    } catch (e) {
      if (gen !== generation) return;
      failure.value = { title: `Reading the AGR12 failed ${FAILS_IN_A_ROW} times in a row`, detail: 'Was the bridge unplugged, or a wire pulled? Is it the I2C version (its part code ending in C)? Connect again.', error: `${e.name}: ${e.message}` };
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
        failure.value = { title: 'Nothing answers at 0x50', detail: 'Check the four wires (VCC, GND, SCL, SDA) and that it is the I2C version.', error: '' };
        await disconnect();
        return;
      }
      for (const a of EEPROM_BLOCKS) {
        if (await bus.acks(a)) {
          failure.value = { title: `${hex(a)} answers too: an EEPROM?`, detail: 'An AT24C04, 08 or 16 EEPROM answers at 0x50 and the addresses after it; the AGR12 only at 0x50. Its measurement command would write a byte into the EEPROM, so this page stops here. Unplug the EEPROM and connect again.', error: '' };
          await disconnect();
          return;
        }
      }
      dev = new Agr12(bus, ADDRESS);
      series.pressure.clear();
      latest.value = null;
      failed.value = { count: 0, of: 0, last: null };
      generation++;
      loop(generation);
      state.value = 'running';
    } catch (e) {
      failure.value = { title: 'The AGR12 didn\'t start', detail: '', error: `${e.name}: ${e.message}` };
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
    state, failure, failed, latest, address: ADDRESS,
    pressureSource: series.pressure.source,
    connect, disconnect,
  };
}
