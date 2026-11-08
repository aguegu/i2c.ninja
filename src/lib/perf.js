// The on-page timing meter (?perf in the address; components/PerfMeter):
// the frames come from requestAnimationFrame there, the readings from the
// sensor loops here, each noting when a reading reached the page. Off, a
// reading costs one boolean check.
import { ref } from 'vue';

const KEEP = 600; // kept: ten seconds at 60 a second

// the meter shown: switched in a Live card's settings (LiveSettings) or by
// ?perf / ?perf=0 in the address; remembered for the tab (sessionStorage)
const METER_KEY = 'i2c.ninja.perf';
const stored = () => {
  try {
    return sessionStorage.getItem(METER_KEY) === '1';
  } catch {
    return false;
  }
};
export const meterOn = ref(typeof sessionStorage === 'undefined' ? false : stored());
export function setMeter(on) {
  meterOn.value = on;
  try {
    sessionStorage.setItem(METER_KEY, on ? '1' : '');
  } catch {
    // not remembered: fine
  }
}

export const perf = { on: false, readings: [], updates: [] }; // updates: the frames the views updated on


// a frame the views updated on (lib/frame.js), once a frame
let lastUpdate = -1;
export function noteUpdate(frame) {
  if (!perf.on || frame === lastUpdate) return;
  lastUpdate = frame;
  perf.updates.push(performance.now());
  if (perf.updates.length > KEEP) perf.updates.splice(0, perf.updates.length - KEEP);
}

export function noteReading() {
  if (!perf.on) return;
  perf.readings.push(performance.now());
  if (perf.readings.length > KEEP) perf.readings.splice(0, perf.readings.length - KEEP);
}
