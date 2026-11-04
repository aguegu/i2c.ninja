<script setup>
// Learn the IMU, step 1: what the chip sends. One I2C read of 14 bytes,
// pairs of bytes into signed counts, counts into g, deg/s and degrees C by
// the scale chosen. Every stage live from the chip in hand.
import { reactive, computed } from 'vue';
import LiveChart from '../../components/LiveChart.vue';
import ImuControls from '../../components/ImuControls.vue';
import { useImu, REG_DATA, DATA_BYTES } from '../../lib/useImu.js';
import { hex } from '../../lib/dongle.js';

const WINDOW_MS = 10000;
const ACCEL_FLOOR_G = 1.2;
const FULL_SCALE_COUNTS = 32768; // a signed 16-bit number's reach: -32768 .. 32767
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];
// the 14 bytes from ACCEL_XOUT_H (0x3B) on, two per value, high byte first
const VALUES = ['ACCEL_X', 'ACCEL_Y', 'ACCEL_Z', 'TEMP', 'GYRO_X', 'GYRO_Y', 'GYRO_Z'];

const imu = reactive(useImu({ windowMs: WINDOW_MS, calibrated: false })); // raw: this step is about the raw readings

const hex2 = (b) => b.toString(16).padStart(2, '0').toUpperCase();
const rows = computed(() => {
  const r = imu.latest;
  if (!r) return [];
  return VALUES.map((name, i) => {
    const hi = r.bytes[2 * i], lo = r.bytes[2 * i + 1];
    const unsigned = (hi << 8) | lo;
    const counts = r.counts[i];
    let value, unit, how;
    if (i < 3) { value = counts / r.accelLsb; unit = 'g'; how = `÷ ${r.accelLsb}`; }
    else if (i === 3) { value = r.temperature; unit = '°C'; how = imu.chip ? `÷ ${imu.chip.tempLsb} + ${imu.chip.tempOffset}` : ''; }
    else { value = counts / r.gyroLsb; unit = 'deg/s'; how = `÷ ${r.gyroLsb}`; }
    return { name, reg: REG_DATA + 2 * i, hi: hex2(hi), lo: hex2(lo), unsigned, counts, negative: hi >= 0x80, how, value, unit };
  });
});

const accelLsb = computed(() => FULL_SCALE_COUNTS / Number(imu.accelerometerScale));
const accelStepMg = computed(() => (1000 / accelLsb.value).toFixed(3));

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
const prose = 'max-w-3xl leading-relaxed';
const th = 'px-2 py-1 text-left font-semibold';
const td = 'px-2 py-1';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 1</p>
      <h1 class="text-2xl font-bold">Raw numbers to physics</h1>
      <p :class="['mt-1 text-slate-500 dark:text-slate-400', prose]">
        The chip doesn't send "1 g". It sends bytes; everything else is arithmetic. Connect, hold the board, and watch
        each stage below change as you move it.
      </p>
    </div>

    <ImuControls :imu="imu" />

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">1. One read, 14 bytes</h2>
      <p :class="prose">
        Sixty-odd times a second the page asks the chip over I2C: <i>write</i> the register number
        <code>{{ hex(REG_DATA) }}</code>, then <i>read</i> {{ DATA_BYTES }} bytes. The chip hands back its latest
        sample: accelerometer x, y, z, the temperature, gyro x, y, z, two bytes each, from register
        <code>{{ hex(REG_DATA) }}</code> up.
      </p>
      <p v-if="imu.latest" class="mt-3 font-mono text-sm break-all">
        <span v-for="(r, i) in rows" :key="r.name" class="mr-3 inline-block"><span :class="i < 3 ? 'text-[var(--series-1)]' : i === 3 ? 'text-slate-500' : 'text-[var(--series-2)]'">{{ r.hi }} {{ r.lo }}</span></span>
      </p>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">2. Two bytes, one number</h2>
      <p :class="prose">
        Each pair is one 16-bit number, the <b>high byte first</b>: high × 256 + low. It's <b>signed</b>: a high
        byte of <code>80</code> or more means the number is negative, and 65536 comes off (two's complement). So
        <code>FF FF</code> is −1, not 65535, and the numbers run from −32768 to +32767. These are the chip's
        <b>counts</b>: no units yet.
      </p>
      <div class="mt-3 overflow-x-auto">
        <table class="font-mono text-sm tabular-nums">
          <thead class="text-slate-500 dark:text-slate-400">
            <tr><th :class="th">value</th><th :class="th">reg</th><th :class="th">bytes</th><th :class="th">high×256+low</th><th :class="th">counts</th><th :class="th">to units</th><th :class="th">=</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.name" class="border-t border-slate-200 dark:border-slate-700">
              <td :class="td">{{ r.name }}</td>
              <td :class="td">{{ hex(r.reg) }}</td>
              <td :class="td">{{ r.hi }} {{ r.lo }}</td>
              <td :class="td">{{ r.unsigned }}</td>
              <td :class="[td, 'text-right']">{{ r.counts }}<span v-if="r.negative" class="text-slate-500"> (−65536)</span></td>
              <td :class="td">{{ r.how }}</td>
              <td :class="[td, 'text-right']">{{ r.value.toFixed(r.unit === 'g' ? 3 : 1) }} {{ r.unit }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!imu.latest" class="mt-2 text-sm text-slate-500 dark:text-slate-400">Connect to fill the table.</p>
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">3. Counts to units: the scale</h2>
      <p :class="prose">
        The counts mean nothing until you know the <b>scale</b> the chip was set to. Set to ±{{ imu.accelerometerScale }} g,
        the full reach of 32768 counts stands for {{ imu.accelerometerScale }} g, so 1 g is
        32768 ÷ {{ imu.accelerometerScale }} = <b>{{ accelLsb }} counts</b>, and one count is {{ accelStepMg }} mg. A
        smaller range gives finer steps but stops sooner; a larger one reaches further in coarser steps. The gyro works
        the same way in degrees a second (131 counts a deg/s at ±250), and the temperature has its own formula, the
        chip's (the MPU-6050's and MPU-6500's differ).
      </p>
      <div class="mt-4">
        <LiveChart title="Accelerometer" unit="g" :series="SERIES" :values="imu.latest?.accel" :source="imu.accelSource" :window-ms="WINDOW_MS" :floor="ACCEL_FLOOR_G" :digits="3" />
      </div>
    </section>

    <section :class="card">
      <h2 class="mb-2 text-lg font-semibold">Try this</h2>
      <ol :class="['list-decimal pl-6', prose]">
        <li class="mb-2">
          <b>Lay the board flat, face up.</b> One axis reads about +1 g: the one pointing up. The accelerometer feels
          the table pushing it up, not gravity pulling down; that's why it's +1 g up, not −1 g.
        </li>
        <li class="mb-2"><b>Turn it upside down.</b> The same axis goes to about −1 g. Stand it on an edge: the 1 g moves to another axis.</li>
        <li class="mb-2">
          <b>Flat again, switch Accel to ±2 g, then to ±16 g.</b> The g stays about 1; the counts drop from about 16384
          to about 2048. Same physics, eight times coarser steps: one count was 0.061 mg, now it's 0.488 mg.
        </li>
        <li class="mb-2">
          <b>Keep it still and look at the gyro rows.</b> Not quite 0 deg/s: every gyro has an offset (its bias). It
          matters later, when turning rates are added up into an angle (step 3).
        </li>
        <li>
          <b>Why can't it read gravity in free fall?</b> Falling, nothing pushes on it: all three axes read 0 g. (Don't
          drop the board to check.)
        </li>
      </ol>
    </section>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu" class="text-emerald-700 underline dark:text-emerald-400">All steps</RouterLink>
      <RouterLink to="/learn/imu/tilt" class="text-emerald-700 underline dark:text-emerald-400">Step 2: tilt from gravity →</RouterLink>
    </nav>
  </main>
</template>
