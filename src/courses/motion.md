How a phone, a game controller or a drone knows which way it's turned, from two small motion sensors. Five stages, each on pages of this site: the physics first, then the wiring, what the sensors give, the maths that joins them, and practice. Take them in order; each step says where to go, what to do there, and when you're done.

## 1. The physics

1. **Gravity on a spring-held mass.** Read [Acceleration and gravity](/physics/acceleration): why a board lying still reads 1 g *upward*, how a tiny mass on springs feels it, and how the tilt comes from it.
   *Done when* you can say why |a| is about 1 g whichever way a still board is turned.
2. **Turning, and which way is positive.** Read [Rotation and gyroscope](/physics/rotation): angular velocity in degrees a second, the right-hand rule, the Coriolis push a gyro feels, and why a gyro drifts.
   *Done when* you can point your right thumb along z and say which way a positive turn goes.

## 2. Wire it up

1. **The bridge.** Follow [Get started](/get-started) until your browser sees the CH341.
2. **Pick a kit**, either works for the whole course:
   - one board with both sensors: an [MPU-6050 (GY-521) or MPU-6500](/mpu6050);
   - or two boards: an [ADXL345](/adxl345) for acceleration and an [ITG-3200](/itg3200) for turning. Tape them together with their printed x, y and z arrows pointing the same ways.
3. **Wire it** as the drawing at the top of each device page shows: four wires, SDA, SCL, GND and VCC.
   *Done when* the device page's Connect shows numbers that move as you move the board.

## 3. What the sensors give

1. **From bytes to physics.** On the [MPU page's Raw numbers tab](/mpu6050#raw): the 14 bytes the chip sends, turned into counts, then into g, °/s and °C by the range chosen.
   *Done when* you can work one value out by hand from its two bytes.
2. **The accelerometer.** On the [MPU page's Accelerometer tab](/mpu6050#accelerometer) or the [ADXL345 page](/adxl345): lay the board flat, then on each edge; watch which axis reads +1 g and which −1 g. Shake it and see |a| jump.
   *Done when* you can predict the three numbers before you turn the board.
3. **The gyro.** On the [MPU page's Gyro tab](/mpu6050#gyro) or the [ITG-3200 page](/itg3200): press Zero held still, then turn the board a quarter turn about z and see "Turned so far" read about 90°.
   *Done when* you've watched the angles creep with the board lying still.
4. **Calibration.** On the [MPU page's Calibration tab](/mpu6050#calibration): measure your chip's own offsets and scale errors, six positions, and keep them.
   *Done when* a flat board reads z within a few thousandths of 1 g.
5. **Its settings.** At the end of each device page: the ranges and rates the chip offers, and the ones the page picks.

## 4. From sensors to attitude

1. **Each alone falls short, together they don't.** Open [Attitude from accel and gyro](/algorithms/attitude) with your kit connected.
2. **Follow the numbers.** In "The numbers, and what's done with them", read the blocks top to bottom with the board in your hand: the readings, gravity's tilt φ<sub>g</sub> and θ<sub>g</sub>, the gyro alone, q, and Mahony's filter step by step.
3. **See the gap close.** In "The math, drawn", tilt the board and watch â (gravity's up) and v̂ (q's up): held still they lie together; shake it and â swings away while v̂ hardly moves.
4. **Two sets of axes.** Read "Two sets of axes, and what q is for", and turn the board while watching the glass box: the board's own x, y, z turn with it, the world's X, Y, Z stay.
   *Done when* you can say what q turns into what.

## 5. Practice

Each task is something a real device does; the attitude page has everything you need.

1. **How level is your table?** Lay the board on the table and note φ<sub>g</sub> and θ<sub>g</sub>. Turn it half a turn on the same spot and note them again. Half their sum is the table's tilt; half their difference is how crooked the chip sits on its board. (Builders level a machine bed the same way.)
2. **A full turn.** Flat on the table, press Start again, turn the board slowly once round and back to where it started. ψ<sub>q</sub> should read 0 again; note how far off it is, then try a faster turn.
3. **How much does it drift?** Leave the board still for a minute without Zero and note how far ψ<sub>ω</sub> walks. Press Zero and do it again. Which helped more, Zero or Mahony's b̂?
4. **Shake test.** Hold the board level and shake it side to side. Compare φ<sub>g</sub> and φ<sub>q</sub> on the φ chart: by how many degrees does gravity's jump, and the fused one?
5. **Ride along.** Tape the board to something that moves, a toy car, a door, a skateboard, and watch the gauges. A door turns about one axis only: which, and does ψ<sub>q</sub> come back when it closes?

## Questions

What tends to come up afterwards, mostly about real drones. Open any question.

<details>
<summary>Why don't commercial drones need calibrating?</summary>

<p>They do, mostly where you don't see it, with the same values as the <a href="/mpu6050#calibration">MPU page's Calibration tab</a>:</p>
<ul>
<li><b>At the factory</b>, often over temperature: the board goes through a temperature range and a whole curve of offsets is stored. Some flight controllers go further and keep the IMU heated to one temperature so the offset hardly moves.</li>
<li><b>At every power-on</b>: "keep it still while it starts" is the gyro offset being measured, the gyro pages' <a href="/physics/rotation">Zero</a> button pressed for you.</li>
<li><b>In flight</b>: the attitude filter keeps estimating the gyro's and accelerometer's offsets as it goes, as Mahony's integral term (<a href="/algorithms/attitude">b̂</a>) does.</li>
<li><b>What's left to the user</b> is what a factory can't fix for good: the compass (its errors come from the drone's own metal and change near steel), an occasional IMU calibration in several positions when the app asks, and a level trim for how the board sits in the frame.</li>
</ul>

</details>

<details>
<summary>How fast must the IMU be read for a drone?</summary>

<p>
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

</details>

<details>
<summary>Why don't flight controllers use I2C?</summary>

<p>
Speed and delay. At 400 kHz, I2C moved at most about 31 KiB/s through this bench's CH341: enough for an
MPU-6050's gyro at 4 kHz alone, short of 8 kHz (48 KB/s), the only unfiltered rate the MPU-6500 offers, let alone
its 32 kHz. Its SPI
port runs at up to 20 MHz, fifty times faster, so a reading arrives in microseconds instead of a fraction of a
millisecond. The MPU-6050, which only speaks I2C, flew on the early hobby boards; the MPU-6000 and MPU-6500
took over because of SPI.
</p>

</details>

<details>
<summary>Can the gyro's drift be fixed for good?</summary>

<p>
Not by the gyro alone. Its offset isn't a constant: it moves with temperature (warm the chip in
<a href="/mpu6050#calibration">the Calibration tab</a> and see), with time, with the board's
stresses. Any offset left over adds up into the angle for as long as you integrate. What fixes it is another
sensor that knows the truth in the long run: gravity for roll and pitch (<a href="/algorithms/attitude">the attitude page</a>),
something else for yaw.
</p>

</details>

<details>
<summary>How does a drone know its heading?</summary>

<p>
Gravity can't tell it (<a href="/physics/acceleration">Acceleration and gravity</a>), so it needs a
sensor that can: a <b>magnetometer</b> (a compass), which the attitude filter uses for yaw the way it uses
gravity for roll and pitch. GPS helps once the drone moves (the direction it travels), and some use two GPS
antennas to measure heading directly. Indoors, without either, cameras watching the ground or the room do it.
These chips have no magnetometer; the MPU-9250 (an MPU-6500 with one inside) and the MPU-9150 do.
</p>

</details>

<details>
<summary>Why do flight controllers isolate the IMU from vibration?</summary>

<p>
The accelerometer feels every shake, as <a href="/physics/acceleration">Acceleration and gravity</a>
showed with your hand; the motors shake far harder and faster. Strong enough, the shaking saturates the
accelerometer (it reads its limit and no more, like the gyro past ±250 deg/s in
<a href="/physics/rotation">Rotation and gyroscope</a>), and its average is no longer gravity:
the level the filter pulls toward goes wrong. So boards are soft-mounted on rubber, and the readings are
filtered, often with notch filters that follow the motors' speed.
</p>

</details>

<details>
<summary>Can position come from integrating the accelerometer twice?</summary>

<p>
In principle: acceleration added up is speed, speed added up is position. In practice the errors grow with the
square of the time. Take an offset of 0.01 g left after calibration: integrated twice it moves
the position by 0.05 m after 1 s, 5 m after 10 s and 177 m
after a minute (a·t²/2), and any tilt error leaks part of gravity's 1 g in too.
</p>
<p>
So the IMU carries position only for moments, between fixes from something that measures it: GPS outdoors,
cameras or beacons indoors.
</p>

</details>

<details>
<summary>Mahony, Madgwick, Kalman: which do drones use?</summary>

<p>
Mahony's filter (<a href="/algorithms/attitude">the attitude page</a>) and Madgwick's are small
and cheap: fixed gains, a few lines a reading. Betaflight's attitude estimate is a Mahony filter. A Kalman
filter (in drones, an extended one, an EKF) keeps track of how uncertain each estimate is and weighs every
sensor by it, and it estimates more: the sensors' offsets, speed, position, wind. PX4 and ArduPilot fly on EKFs,
because they fuse GPS, compass and barometer with the IMU for navigation, not only attitude.
</p>

</details>

<details>
<summary>IMU, AHRS, INS: what's the difference?</summary>

<ul>
<li><b>IMU</b>, inertial measurement unit: the sensors themselves, the accelerometer and gyro (the <a href="/mpu6050#raw">raw numbers</a>).</li>
<li><b>AHRS</b>, attitude and heading reference system: an IMU plus the filter that turns its readings into an orientation (<a href="/algorithms/attitude">the attitude page</a>), with a compass for the heading.</li>
<li><b>INS</b>, inertial navigation system: goes on to speed and position, by integrating with the drift problem above, fused with GPS and others to hold it in check.</li>
</ul>

</details>
