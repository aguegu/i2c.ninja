# Releases

## 1.0.11

- Learn the IMU, step 5, `attitude`, "3D attitude", the last step: the board
  in 3D turned by Mahony's quaternion (`Board3D.vue`), the one turn's axis
  through it, q's four numbers and the same as one turn of θ about an axis,
  roll · pitch · yaw beside; Euler's one-turn theorem, q = [cos θ/2,
  axis sin θ/2], 360° giving −q, gimbal lock. Tried on r8845.
- The PID step dropped: Learn the IMU ends at the attitude (five steps).
- `src/lib/quaternion.js` (rotate, axis-angle) with host tests (10 in all);
  `src/lib/view.js`, the camera the gyro ball and the 3D board share.

## 1.0.10

- Learn the IMU, step 4, `fusion`, "Combining the two": the complementary
  filter (τ on a slider, α shown; roll and pitch, each charted combined,
  gravity's, the gyro's alone) and Mahony's filter (the attitude indicator
  and yaw, kp and ki on sliders, the offset its integral learns, live).
  Tried on r8845.
- `src/lib/fusion.js`: `Complementary` and `Mahony`, in step 2's frame and
  signs; host tests (`npm test`, Node's runner, 7: signs each way, a biased
  gyro held still, the offset learned on x and y, not z). The Pages
  workflow runs them before it deploys.

## 1.0.9

- Learn the IMU, step 3, `gyro-angle`, "Angle from the gyro": rate x the
  time between readings, added up each reading (roll += gx, pitch -= gy,
  yaw -= gz in step 2's frame): the angles, yaw too; roll and pitch charted
  against gravity's, yaw alone. The offset: left in (full drift), measured
  over 2 s of stillness and taken off, forgotten again; the drift live in
  degrees a minute. To try: the drift, a quarter turn and back, a shake, a
  fast turn past ±250 deg/s.
- `GyroBall.vue`: what the gyro sees. The board's x, y, z as rings, seen
  from behind and to its right (a true camera view, right-handed); a dot on
  each ring turning about its axis as the board does (it creeps at rest:
  the offset), and the angular velocity as one arrow along the spin axis.
  Tried on r8845.
- `useImu` calls `onReading` listeners on each reading; `lib/tilt.js` (step
  2's angles, shared); `lib/series.js` (a page's own chart buffers). The
  indicator's ±90° marks without numbers (they sat under the rim).

## 1.0.8

- Learn the IMU, step 2, `tilt`, "Tilt from gravity": the board held like a
  plane (its x arrow the nose, face up); roll = atan2(ay, az), right side
  down +; pitch = atan2(ax, √(ay² + az²)), nose up +, with the live numbers
  in. An attitude indicator (`AttitudeIndicator.vue`: the horizon moves, the
  aircraft stays; its pitch ladder to ±90°), roll and pitch charted, |a| telling when a push makes the
  angles wrong. To try: tilting, yaw that gravity can't see, a shake, nose
  straight up where roll means nothing. Tried on r8845.
- Steps 1 and 2 link to each other.

## 1.0.7

- Learn the IMU (`/learn/imu`): a path from the chip's bytes to the loop
  that holds a quadcopter level, six steps, one idea each, live from the
  MPU-6050 or MPU-6500 in hand. Step 1, `raw-numbers`, "Raw numbers to
  physics": the one I2C read (write 0x3B, read 14 bytes), the pairs into
  signed counts (high byte first, two's complement), the counts into g,
  deg/s and degrees C by the scale (a live table of every stage), an
  accelerometer chart, and things to try with the board. Tried on r8845.
- `src/lib/useImu.js` and `ImuControls.vue`: the IMU's connection, driver
  by WHO_AM_I, scales and read loop, shared by the motion page and the
  lessons; the loop reads the 14 bytes itself and converts them with the
  driver's sensitivities, so a lesson can show each stage.
- The nav: Learn. Home and the motion page link to it.

## 1.0.6

- The motion page takes the MPU-6050 or the MPU-6500: after the scan it
  reads WHO_AM_I and picks atiic's driver (`Mpu6050` or `Mpu6500`); the
  title says which; any other chip is refused with what it read. `/mpu6500`
  opens the same page. Tried on r8845 with an MPU-6500 in Chromium.
- atiic 1.0.6 (GitHub tag), with the MPU-6500.

## 1.0.5

- `/mpu6050`, the first device page: atiic's MPU-6050 on the CH341 at
  400 kHz. Connect scans and picks 0x68 or 0x69, `init()` with the scales
  chosen (changed while running: set up again, the charts kept), then a
  reading each sample period (62.5 Hz: faster only repeats the last
  sample). The accelerometer (g) and gyro (deg/s) charted over the last
  10 s, the latest values in each legend, temperature and readings/s.
  Stop, an unplugged dongle or leaving the page puts the chip to sleep and
  closes the dongle. Tried on r8845 in Chromium.
- `LiveChart`: a canvas line chart of our own; x y z in the dataviz
  reference palette's slots 1-3 (blue, orange, aqua), light and dark steps;
  a symmetric range never under a floor (1.2 g, 10 deg/s), 1-2-5 ticks.
- `src/lib/dongle.js`: opening the dongle and explaining its failures,
  shared by the setup check and the device pages. Home: a Devices card.

## 1.0.4

- `/about`: `src/assets/ABOUT.md` (as iap.meshmass.com's: the author, what
  i2c.ninja is and is built with, no backend, the legal disclaimer for USB
  and I2C hardware and the setup's system changes) and these releases, by
  marked; the version beside the title.
- ESLint as iap.meshmass.com's SPA, as it is (`flat/strongly-recommended`,
  `vue/max-attributes-per-line` and
  `vue/singleline-html-element-content-newline` off): the templates back to
  one line a tag.

## 1.0.3

- Wider on desktop: the page and the header's contents at 1024 px (was
  672). The home page's two cards side by side from tablet width; on
  /setup the dongle's text beside its drawing, text held to a readable
  width, commands wrapping in their boxes instead of running out of them
  (phones too). One column on phones as before.

## 1.0.2

- `/setup`: the setup guide for the site's users (vue-router; `404.html` a
  copy of `index.html`, so a route opens directly on GitHub Pages). A
  Chromium browser, the dongle's jumpers (atiic's drawing), once per
  computer the permission per platform, then "Connect and scan": the CH341
  over WebUSB (atiic's `Ch341`), the addresses that answer, and each way it
  fails explained.
- Linux, tried on r8845 (Manjaro, kernel 7.2.9, Chromium): a udev rule with
  `TAG+="uaccess"` (`70-ch341.rules`, before `73-seat-late.rules`) gives the
  dongle to whoever is at the computer, no group needed; and Chrome doesn't
  detach a kernel driver, so the kernel's `spi-ch341` (it binds 1a86:5512)
  has to let go: released after each plug (`unbind`), or blocked for good
  (`blacklist spi_ch341`, at the cost of the kernel's SPI on a CH341). Found
  0x68.
- Windows (Zadig, WinUSB), macOS, Android, ChromeOS: the documented steps,
  marked not tried on our bench yet.

## 1.0.1

- Tailwind CSS 4.3.4 (`@tailwindcss/vite`), no component library: native
  controls (select, checkbox, range, button, dialog) are the most phone
  friendly, and the page stays small (the placeholder: 25 KB JS, 3 KB CSS
  gzip). Light or dark as the device is (`dark:` and `color-scheme`).
- Weighed first on the same small page: Vant 40 + 34 KB, Quasar 75 + 35 KB,
  Vuetify 119 + 44 KB (JS + CSS gzip); PrimeVue 5 dropped, its PrimeUI
  License (from 5.0.0, 2026-07) needs a key and badges the page without one.

## 1.0.0

- Started over: one public repo for the source and the site, published by a
  GitHub Actions workflow (was: the source in the private ble.i2c.ninja,
  built and force-pushed to this repo's `gh-pages`).
- Vite 8 + Vue 3, ESLint 10 (@stylistic as iap.meshmass.com, eslint-plugin-vue),
  atiic 1.0.5 from GitHub. A placeholder page: what i2c.ninja is, the bench,
  the device pages coming back one at a time (the MPU-6050 first).
