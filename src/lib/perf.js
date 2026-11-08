// The on-page timing meter (?perf in the address; components/PerfMeter):
// the frames come from requestAnimationFrame there, the readings from the
// sensor loops here, each noting when a reading reached the page. Off, a
// reading costs one boolean check.
export const perf = { on: false, readings: [] };

const KEEP = 600; // readings kept: ten seconds at 60 a second

export function noteReading() {
  if (!perf.on) return;
  perf.readings.push(performance.now());
  if (perf.readings.length > KEEP) perf.readings.splice(0, perf.readings.length - KEEP);
}
