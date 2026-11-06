// The IMU's calibration (the MPU page's Calibration tab), kept for this browser tab:
// sessionStorage, so it lasts while the tab does. Stored per chip type
// (WHO_AM_I's name): another board of the same type would take it too,
// which the controls make plain ("calibrated", with a switch to turn it off).
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

// a reading's accel (g) and gyro (deg/s) with the calibration taken off,
// each part only if it was measured
export function applyCalibration(cal, accel, gyro) {
  return {
    accel: cal.accelOffsetG && cal.accelScale ? accel.map((a, k) => (a - cal.accelOffsetG[k]) / cal.accelScale[k]) : accel,
    gyro: cal.gyroOffsetDps ? gyro.map((g, k) => g - cal.gyroOffsetDps[k]) : gyro,
  };
}
