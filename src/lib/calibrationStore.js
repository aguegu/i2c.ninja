// The IMUs' calibrations (the MPU page's Calibration tab), kept in this
// browser (localStorage) across visits, one per sensor: a sensor is taken to
// stay wired to its bridge, so the key is the bridge (lib/bridge.js: one
// unit when it can be told apart, else any of its model), the chip type
// (WHO_AM_I's name) and its I2C address. Always applied to the readings of
// the sensor it was saved for (nothing saved: they pass as they are); listed,
// forgotten or redone on the My sensors page (/my-sensors).
import { bridgeKey } from './bridge.js';

const KEY = 'i2c.ninja/calibrations';
const OLD_KEY = 'i2c.ninja/imu-calibration'; // the per-tab one before: dropped

const read = () => {
  try {
    sessionStorage.removeItem(OLD_KEY);
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
};
const write = (all) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false; // storage off (private window, blocked): not kept
  }
};

export const sensorKey = (bridge, chip, address) => `${bridgeKey(bridge)}|${chip}|${address}`;

// { key, bridge { model, id, label }, chip, address, gyroOffsetDps?,
//   gyroOffsetAtC?, accelOffsetG?, accelScale?, savedAt } or null
export function calibrationFor(bridge, chip, address) {
  if (!bridge || !chip || address === undefined || address === null) return null;
  const all = read();
  const k = sensorKey(bridge, chip, address);
  return all[k] ? { key: k, ...all[k] } : null;
}

export function saveCalibration(bridge, chip, address, values) {
  const all = read();
  all[sensorKey(bridge, chip, address)] = { ...values, bridge, chip, address, savedAt: new Date().toISOString() };
  return write(all);
}

export function forgetCalibration(key) {
  const all = read();
  delete all[key];
  write(all);
}

// every calibration kept: [{ key, ... }], the newest first
export function listCalibrations() {
  return Object.entries(read()).map(([key, v]) => ({ key, ...v })).sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
}

export const correctAccel = (cal, v) => (cal?.accelOffsetG && cal.accelScale ? v.map((a, k) => (a - cal.accelOffsetG[k]) / cal.accelScale[k]) : v);
export const correctGyro = (cal, v) => (cal?.gyroOffsetDps ? v.map((g, k) => g - cal.gyroOffsetDps[k]) : v);
// the time it was saved, as the pages show it
export const savedTime = (cal) => (cal?.savedAt ? new Date(cal.savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');

// is the accelerometer still telling 1 g at rest? A watch over its readings:
// update(accel) on each; off() then { g } when, held still for STILL_MS
// (|a| varying under STILL_SPREAD_G), |a| sits more than OFF_G from 1 g,
// else null. Gravity is 1 g in any position, so a still board reading far
// from it needs (re)calibrating: another board of the same chip, the
// temperature, or none saved yet
const STILL_MS = 1500, STILL_SPREAD_G = 0.02, OFF_G = 0.05;
export function offWatch() {
  let since = 0, lo = Infinity, hi = -Infinity, sum = 0, n = 0, found = null;
  return {
    update(t, accel) {
      const g = Math.hypot(...accel);
      lo = Math.min(lo, g); hi = Math.max(hi, g); sum += g; n++;
      if (hi - lo > STILL_SPREAD_G) { since = t; lo = hi = g; sum = g; n = 1; return; }
      if (t - since >= STILL_MS) {
        const mean = sum / n;
        found = Math.abs(mean - 1) > OFF_G ? { g: mean } : null;
        since = t; lo = hi = g; sum = g; n = 1;
      }
    },
    off: () => found,
  };
}

// a reading's accel (g) and gyro (deg/s) with the calibration taken off,
// each part only if it was measured
export function applyCalibration(cal, accel, gyro) {
  return {
    accel: cal.accelOffsetG && cal.accelScale ? accel.map((a, k) => (a - cal.accelOffsetG[k]) / cal.accelScale[k]) : accel,
    gyro: cal.gyroOffsetDps ? gyro.map((g, k) => g - cal.gyroOffsetDps[k]) : gyro,
  };
}
