<script setup>
// Learn the IMU, step 7: questions that come up after the steps, mostly
// about real drones. No board needed. Numbers measured on this bench say
// so; the others are well-known figures of the projects named.
const G = 9.81; // m/s^2 a g
const ACCEL_OFFSET_G = 0.01;
// how far a constant accelerometer offset carries a position worked out by
// integrating twice: d = a t^2 / 2
const driftAfter = (s) => ((ACCEL_OFFSET_G * G * s * s) / 2).toFixed(s < 10 ? 2 : 0);

const card = 'rounded-xl bg-white shadow-sm dark:bg-slate-800';
const summary = 'cursor-pointer select-none p-4 text-lg font-semibold marker:text-emerald-600';
const body = 'max-w-3xl px-4 pb-4 leading-relaxed';
const link = 'text-emerald-700 underline dark:text-emerald-400';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <p class="text-sm text-slate-500 dark:text-slate-400"><RouterLink to="/learn/imu" class="underline">Learn the IMU</RouterLink> · step 7</p>
      <h1 class="text-2xl font-bold">Questions</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        What tends to come up after the steps, mostly about real drones. No board needed; open any question.
      </p>
    </div>

    <details :class="card">
      <summary :class="summary">Why don't commercial drones need calibrating?</summary>
      <div :class="body">
        <p class="mb-2">They do, mostly where you don't see it, with the same values as <RouterLink to="/learn/imu/calibration" :class="link">step 6</RouterLink>:</p>
        <ul class="mb-2 list-disc pl-6">
          <li class="mb-1"><b>At the factory</b>, often over temperature: the board goes through a temperature range and a whole curve of offsets is stored. Some flight controllers go further and keep the IMU heated to one temperature so the offset hardly moves.</li>
          <li class="mb-1"><b>At every power-on</b>: "keep it still while it starts" is the gyro offset being measured, <RouterLink to="/learn/imu/gyro-angle" :class="link">step 3</RouterLink>'s button pressed for you.</li>
          <li class="mb-1"><b>In flight</b>: the attitude filter keeps estimating the gyro's and accelerometer's offsets as it goes, as Mahony's integral term did in <RouterLink to="/learn/imu/fusion" :class="link">step 4</RouterLink>.</li>
          <li><b>What's left to the user</b> is what a factory can't fix for good: the compass (its errors come from the drone's own metal and change near steel), an occasional IMU calibration in several positions when the app asks, and a level trim for how the board sits in the frame.</li>
        </ul>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">How fast must the IMU be read for a drone?</summary>
      <div :class="body">
        <p class="mb-2">
          Fast enough that the control loop reacts before the drone has gone far wrong, and fast enough to see the
          vibration it has to filter out. ArduPilot's copter runs its main loop at 400 Hz; Betaflight, for racing quads,
          reads the gyro and runs its rate loop at several kHz, up to 8 kHz with SPI gyros (the MPU-6000 and MPU-6500 in
          their day, newer chips now).
          Each reading late adds delay to the loop, and delay is what makes a tight loop oscillate.
        </p>
        <p>
          Vibration matters as much: motors and props shake the frame at hundreds of Hz. To filter a frequency out you
          must first see it, which takes sampling at more than twice it; read slower and it folds down into a slow,
          false motion (aliasing) that no filter can remove afterwards. On this bench, 62.5 Hz is plenty to learn on;
          the FIFO did 1 kHz with the accelerometer and gyro.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">Why don't flight controllers use I2C?</summary>
      <div :class="body">
        <p>
          Speed and delay. At 400 kHz, I2C moved at most about 31 KiB/s through this bench's CH341: enough for an
          MPU-6050's gyro at 4 kHz alone, short of 8 kHz (48 KB/s), the only unfiltered rate the MPU-6500 offers, let alone
          its 32 kHz. Its SPI
          port runs at up to 20 MHz, fifty times faster, so a reading arrives in microseconds instead of a fraction of a
          millisecond. The MPU-6050, which only speaks I2C, flew on the early hobby boards; the MPU-6000 and MPU-6500
          took over because of SPI.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">Can the gyro's drift be fixed for good?</summary>
      <div :class="body">
        <p>
          Not by the gyro alone. Its offset isn't a constant: it moves with temperature (warm the chip in
          <RouterLink to="/learn/imu/calibration" :class="link">step 6</RouterLink> and see), with time, with the board's
          stresses. Any offset left over adds up into the angle for as long as you integrate. What fixes it is another
          sensor that knows the truth in the long run: gravity for roll and pitch (<RouterLink to="/learn/imu/fusion" :class="link">step 4</RouterLink>),
          something else for yaw.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">How does a drone know its heading?</summary>
      <div :class="body">
        <p>
          Gravity can't tell it (<RouterLink to="/learn/imu/tilt" :class="link">step 2</RouterLink>), so it needs a
          sensor that can: a <b>magnetometer</b> (a compass), which the attitude filter uses for yaw the way it uses
          gravity for roll and pitch. GPS helps once the drone moves (the direction it travels), and some use two GPS
          antennas to measure heading directly. Indoors, without either, cameras watching the ground or the room do it.
          These chips have no magnetometer; the MPU-9250 (an MPU-6500 with one inside) and the MPU-9150 do.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">Why do flight controllers isolate the IMU from vibration?</summary>
      <div :class="body">
        <p>
          The accelerometer feels every shake, as <RouterLink to="/learn/imu/tilt" :class="link">step 2</RouterLink>
          showed with your hand; the motors shake far harder and faster. Strong enough, the shaking saturates the
          accelerometer (it reads its limit and no more, like the gyro past ±250 deg/s in
          <RouterLink to="/learn/imu/gyro-angle" :class="link">step 3</RouterLink>), and its average is no longer gravity:
          the level the filter pulls toward goes wrong. So boards are soft-mounted on rubber, and the readings are
          filtered, often with notch filters that follow the motors' speed.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">Can position come from integrating the accelerometer twice?</summary>
      <div :class="body">
        <p class="mb-2">
          In principle: acceleration added up is speed, speed added up is position. In practice the errors grow with the
          square of the time. Take an offset of {{ ACCEL_OFFSET_G }} g left after calibration: integrated twice it moves
          the position by {{ driftAfter(1) }} m after 1 s, {{ driftAfter(10) }} m after 10 s and {{ driftAfter(60) }} m
          after a minute (a·t²/2), and any tilt error leaks part of gravity's 1 g in too.
        </p>
        <p>
          So the IMU carries position only for moments, between fixes from something that measures it: GPS outdoors,
          cameras or beacons indoors.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">Mahony, Madgwick, Kalman: which do drones use?</summary>
      <div :class="body">
        <p>
          Mahony's filter (<RouterLink to="/learn/imu/fusion" :class="link">step 4</RouterLink>) and Madgwick's are small
          and cheap: fixed gains, a few lines a reading. Betaflight's attitude estimate is a Mahony filter. A Kalman
          filter (in drones, an extended one, an EKF) keeps track of how uncertain each estimate is and weighs every
          sensor by it, and it estimates more: the sensors' offsets, speed, position, wind. PX4 and ArduPilot fly on EKFs,
          because they fuse GPS, compass and barometer with the IMU for navigation, not only attitude.
        </p>
      </div>
    </details>

    <details :class="card">
      <summary :class="summary">IMU, AHRS, INS: what's the difference?</summary>
      <div :class="body">
        <ul class="list-disc pl-6">
          <li class="mb-1"><b>IMU</b>, inertial measurement unit: the sensors themselves, the accelerometer and gyro (<RouterLink to="/learn/imu/raw-numbers" :class="link">step 1</RouterLink>'s readings).</li>
          <li class="mb-1"><b>AHRS</b>, attitude and heading reference system: an IMU plus the filter that turns its readings into an orientation (<RouterLink to="/learn/imu/fusion" :class="link">steps 4</RouterLink> and <RouterLink to="/learn/imu/attitude" :class="link">5</RouterLink>), with a compass for the heading.</li>
          <li><b>INS</b>, inertial navigation system: goes on to speed and position, by integrating with the drift problem above, fused with GPS and others to hold it in check.</li>
        </ul>
      </div>
    </details>

    <nav class="flex justify-between text-sm">
      <RouterLink to="/learn/imu/calibration" :class="link">← Step 6: calibration</RouterLink>
      <RouterLink to="/learn/imu" :class="link">All steps</RouterLink>
    </nav>
  </main>
</template>
