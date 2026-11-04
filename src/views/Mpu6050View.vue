<script setup>
// The MPU-6050 or MPU-6500 live (WHO_AM_I picks atiic's driver) on the
// CH341 dongle, the accelerometer and gyro charted. Read once a sample period: the chip refreshes its data
// registers at its sample rate (62.5 Hz with atiic's settings), so reading
// faster only repeats the last sample.
import { ref, onBeforeUnmount } from 'vue';
import { Mpu6050, Mpu6500 } from 'atiic';
import LiveChart from '../components/LiveChart.vue';
import { hasWebUsb, detectPlatform, openDongle, explain, hex } from '../lib/dongle.js';

const SCL_HZ = 400000; // fast mode, both chips' rated top on I2C
const DRIVERS = [Mpu6050, Mpu6500];
const REG_WHO_AM_I = 0x75;
const SAMPLE_MS = 16; // atiic's sample rate, 62.5 Hz
const WINDOW_MS = 10000; // the charts' span
const ACCEL_FLOOR_G = 1.2; // the charts' least half-range: 1 g at rest stays in view
const GYRO_FLOOR_DPS = 10;
const RATE_EVERY_MS = 1000;

const platform = detectPlatform();
const state = ref('idle'); // idle, connecting, running
const failure = ref(null); // { title, detail, error }
const address = ref(Mpu6050.addresses[0]);
const chipName = ref(null); // the chip found, by its WHO_AM_I
const found = ref([]);
const gyroscopeScale = ref('500');
const accelerometerScale = ref('4');
const latest = ref(null); // { accel: [x, y, z], gyro: [x, y, z], temperature }
const rate = ref(0);

let bus = null;
let mpu = null;
let generation = 0; // a new one stops the loop running before it
let reads = 0;
let rateFrom = 0;

// the charts' buffers: plain arrays, read each frame, not reactive
const buf = { t: [], accel: [[], [], []], gyro: [[], [], []] };
const accelSource = () => ({ t: buf.t, ys: buf.accel });
const gyroSource = () => ({ t: buf.t, ys: buf.gyro });
const SERIES = [
  { label: 'x', color: '--series-1' },
  { label: 'y', color: '--series-2' },
  { label: 'z', color: '--series-3' },
];

function push(r) {
  const now = performance.now();
  const a = [r.accelerometers.x, r.accelerometers.y, r.accelerometers.z];
  const g = [r.gyroscopes.x, r.gyroscopes.y, r.gyroscopes.z];
  buf.t.push(now);
  a.forEach((v, k) => buf.accel[k].push(v));
  g.forEach((v, k) => buf.gyro[k].push(v));
  let old = 0;
  while (old < buf.t.length && buf.t[old] < now - WINDOW_MS - RATE_EVERY_MS) old++;
  if (old) {
    buf.t.splice(0, old);
    for (const y of [...buf.accel, ...buf.gyro]) y.splice(0, old);
  }
  latest.value = { accel: a, gyro: g, temperature: r.temperature };
  reads++;
  if (now - rateFrom >= RATE_EVERY_MS) {
    rate.value = (reads * 1000) / (now - rateFrom);
    reads = 0;
    rateFrom = now;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loop(gen) {
  rateFrom = performance.now();
  reads = 0;
  try {
    while (gen === generation) {
      const t0 = performance.now();
      push(await mpu.measure());
      await delay(Math.max(0, SAMPLE_MS - (performance.now() - t0)));
    }
  } catch (e) {
    if (gen !== generation) return;
    failure.value = { title: 'Reading the MPU-6050 failed', detail: 'Was the dongle unplugged, or a wire pulled? Connect again.', error: `${e.name}: ${e.message}` };
    await disconnect();
  }
}

async function start() {
  generation++;
  await mpu.init(gyroscopeScale.value, accelerometerScale.value);
  loop(generation);
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
    found.value = (await bus.scan()).filter((a) => Mpu6050.addresses.includes(a));
    if (!found.value.length) {
      failure.value = { title: 'No MPU-6050 or MPU-6500 answers', detail: 'Nothing at 0x68 or 0x69: check the four wires and that the board has power (the dongle\'s green jumper on 3V3).', error: '' };
      await disconnect();
      return;
    }
    if (!found.value.includes(address.value)) address.value = found.value[0];
    mpu = await attach(address.value);
    await start();
    state.value = 'running';
  } catch (e) {
    failure.value = { title: `The ${chipName.value ?? 'chip'} didn't start`, detail: '', error: `${e.name}: ${e.message}` };
    await disconnect();
  }
}

// the driver for the chip at addr, by its WHO_AM_I
async function attach(addr) {
  const [who] = await bus.writeRead(addr, [REG_WHO_AM_I], 1);
  const Driver = DRIVERS.find((D) => D.chip.whoAmI === who);
  if (!Driver) {
    throw new Error(`${hex(addr)} reads WHO_AM_I ${hex(who)}: ${DRIVERS.map((D) => `an ${D.chip.name} reads ${hex(D.chip.whoAmI)}`).join(', ')}`);
  }
  chipName.value = Driver.chip.name;
  return new Driver(bus, addr);
}

async function disconnect() {
  generation++;
  const b = bus;
  bus = null;
  state.value = 'idle';
  try {
    await mpu?.sleep();
  } catch {
    // gone already
  }
  mpu = null;
  try {
    await b?.close();
  } catch {
    // gone already
  }
}

// a new address or scale: the chip set up again, the charts kept
async function reconfigure() {
  if (state.value !== 'running') return;
  try {
    if (mpu.address !== address.value) mpu = await attach(address.value);
    await start();
  } catch (e) {
    failure.value = { title: `The ${chipName.value ?? 'chip'} didn't take the new settings`, detail: '', error: `${e.name}: ${e.message}` };
    await disconnect();
  }
}

function onUsbDisconnect(e) {
  if (bus && e.device === bus.device) {
    failure.value = { title: 'The dongle was unplugged', detail: '', error: '' };
    disconnect();
  }
}
if (hasWebUsb) navigator.usb.addEventListener('disconnect', onUsbDisconnect);
onBeforeUnmount(() => {
  if (hasWebUsb) navigator.usb.removeEventListener('disconnect', onUsbDisconnect);
  disconnect();
});

const field = 'flex items-center gap-2 text-sm';
const select = 'rounded-md border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-600 dark:bg-slate-800';
const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">{{ chipName ?? 'MPU-6050 / MPU-6500' }}</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        A 3-axis gyro and accelerometer, live over the CH341 dongle at 400 kHz: the MPU-6050 or its successor the MPU-6500, told apart by their WHO_AM_I.
        First time here? <RouterLink to="/setup" class="text-emerald-700 underline dark:text-emerald-400">Set up the dongle</RouterLink>.
      </p>
    </div>

    <p v-if="!hasWebUsb" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      This browser has no WebUSB. Open this page in Chrome, Edge or another Chromium.
    </p>

    <section v-else :class="[card, 'flex flex-wrap items-center gap-x-6 gap-y-3']">
      <button v-if="state !== 'running'" class="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50" :disabled="state === 'connecting'" @click="connect">
        {{ state === 'connecting' ? 'Connecting…' : 'Connect' }}
      </button>
      <button v-else class="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" @click="disconnect">Stop</button>
      <label :class="field">Address
        <select v-model.number="address" :class="select" @change="reconfigure">
          <option v-for="a in Mpu6050.addresses" :key="a" :value="a" :disabled="state === 'running' && !found.includes(a)">{{ hex(a) }}</option>
        </select>
      </label>
      <label :class="field">Gyro ±
        <select v-model="gyroscopeScale" :class="select" @change="reconfigure">
          <option v-for="s in Mpu6050.gyroscopeScales" :key="s" :value="s">{{ s }} deg/s</option>
        </select>
      </label>
      <label :class="field">Accel ±
        <select v-model="accelerometerScale" :class="select" @change="reconfigure">
          <option v-for="s in Mpu6050.accelerometerScales" :key="s" :value="s">{{ s }} g</option>
        </select>
      </label>
      <span v-if="state === 'running'" class="ml-auto font-mono text-sm tabular-nums text-slate-500 dark:text-slate-400">
        {{ latest ? `${latest.temperature.toFixed(1)} °C · ` : '' }}{{ rate.toFixed(0) }} readings/s
      </span>
    </section>

    <div v-if="failure" class="rounded-lg border border-red-300 bg-red-50 p-3 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p class="font-semibold">{{ failure.title }}</p>
      <p v-if="failure.detail" class="mt-1">{{ failure.detail }}</p>
      <p v-if="failure.error" class="mt-2 font-mono text-xs opacity-75">{{ failure.error }}</p>
    </div>

    <section :class="card">
      <LiveChart title="Accelerometer" unit="g" :series="SERIES" :values="latest?.accel" :source="accelSource" :window-ms="WINDOW_MS" :floor="ACCEL_FLOOR_G" :digits="3" />
    </section>
    <section :class="card">
      <LiveChart title="Gyro" unit="deg/s" :series="SERIES" :values="latest?.gyro" :source="gyroSource" :window-ms="WINDOW_MS" :floor="GYRO_FLOOR_DPS" :digits="1" />
    </section>
  </main>
</template>
