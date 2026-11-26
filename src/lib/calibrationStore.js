// The IMU's calibration (the MPU page's Calibration tab), kept for this browser tab:
// sessionStorage, so it lasts while the tab does. Stored per chip type
// (WHO_AM_I's name): another board of the same type would take it too,
// which the controls make plain ("your calibration applied"; forgotten on the
// Calibration tab). Always applied to its chip: nothing saved, readings pass as they are.
const KEY = 'i2c.ninja/imu-calibration';

// { chip, gyroOffsetDps?, gyroOffsetAtC?, accelOffsetG?, accelScale?, savedAt } or null
export function loadCalibration() {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY));
    return v && typeof v.chip === 'string' ? v : null;
  } catch {
    return null;
  }
}

export function saveCalibration(values) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...values, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false; // storage off (private window, blocked): not kept
  }
}

export function forgetCalibration() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing kept anyway
  }
}

// the saved calibration for a chip (by name), or null (none saved, or saved
// for another chip): readings then pass unchanged, as an offset of 0 and a
// scale of 1 would leave them
export function calibrationFor(chip) {
  const c = loadCalibration();
  return c && c.chip === chip ? c : null;
}
export const correctAccel = (cal, v) => (cal?.accelOffsetG && cal.accelScale ? v.map((a, k) => (a - cal.accelOffsetG[k]) / cal.accelScale[k]) : v);
export const correctGyro = (cal, v) => (cal?.gyroOffsetDps ? v.map((g, k) => g - cal.gyroOffsetDps[k]) : v);
// the time it was saved, as the page shows it
export const savedTime = (cal) => (cal?.savedAt ? new Date(cal.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

// a reading's accel (g) and gyro (deg/s) with the calibration taken off,
// each part only if it was measured
export function applyCalibration(cal, accel, gyro) {
  return {
    accel: cal.accelOffsetG && cal.accelScale ? accel.map((a, k) => (a - cal.accelOffsetG[k]) / cal.accelScale[k]) : accel,
    gyro: cal.gyroOffsetDps ? gyro.map((g, k) => g - cal.gyroOffsetDps[k]) : gyro,
  };
}
