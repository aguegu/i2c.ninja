// A gyro's rates added up into the angle turned about each axis (each
// reading's rate times the time since the last), after a bias measured held
// still (zero) is taken off; reset starts the angles again. Fed by a page's
// reading hook: onReading(fn(t ms, accel, gyro deg/s [x, y, z])).
import { ref, onBeforeUnmount } from 'vue';

const AXES = ['x', 'y', 'z'];
const ZERO_MS = 2000; // held still this long to measure the bias

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTurned(onReading) {
  const angles = ref({ x: 0, y: 0, z: 0 }); // degrees
  const bias = ref({ x: 0, y: 0, z: 0 }); // deg/s
  const zeroing = ref(false);
  const zeroed = ref(false);
  let lastT = null;
  let sum = null;

  const off = onReading((t, accel, gyro) => {
    const g = { x: gyro[0], y: gyro[1], z: gyro[2] };
    if (sum) { for (const k of AXES) sum[k] += g[k]; sum.n++; }
    if (lastT !== null && t > lastT) {
      const dt = (t - lastT) / 1000;
      angles.value = Object.fromEntries(AXES.map((k) => [k, angles.value[k] + (g[k] - bias.value[k]) * dt]));
    }
    lastT = t;
  });
  onBeforeUnmount(off);

  function reset() {
    angles.value = { x: 0, y: 0, z: 0 };
  }

  async function zero() {
    if (zeroing.value) return;
    zeroing.value = true;
    sum = { x: 0, y: 0, z: 0, n: 0 };
    await delay(ZERO_MS);
    const s = sum;
    sum = null;
    zeroing.value = false;
    if (!s.n) return;
    bias.value = Object.fromEntries(AXES.map((k) => [k, s[k] / s.n]));
    zeroed.value = true;
    reset();
  }

  return { angles, bias, zeroing, zeroed, zero, reset };
}
