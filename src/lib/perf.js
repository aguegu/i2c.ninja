// The on-page timing meter (?perf in the address; components/PerfMeter):
// the frames come from requestAnimationFrame there, the readings from the
// sensor loops here, each noting when a reading reached the page. Off, a
// reading costs one boolean check.
const KEEP = 600; // kept: ten seconds at 60 a second

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
