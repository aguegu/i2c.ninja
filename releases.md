# Releases

## 1.6.0

- **dart, a third dongle** (the user: "let's get i2c.ninja to support dart,
  started with 1.6.0"): the user's own USB-to-I2C bridge (atiic's
  docs/dart.md), on atiic 1.5.1. The chooser lists it beside the CH341 and
  CH347, and every page takes it as it takes them: the same bus. What it
  adds: it waits for a device holding the clock (the CH341 and CH347
  don't), and a refused data byte is told from a missing device. Get
  started's Linux udev rule covers it (`ffff:da92`); on Windows it binds
  WinUSB by itself, no Zadig. Not on the Dongles page yet: its firmware
  isn't out.

## 1.5.4

- **Wiring drawings redrawn**: every sensor page and Get started show the
  CH341T as on its cheatsheet (its USB-A over the board's edge with its four
  leads, its jumpers on I2C and 3V3, its LEDs where they are) and the CH347T
  as on its board (the mode switch black with white caps, marked ON OFF; the
  crystal between the switch and the chip; the USB-C socket seen from
  above). Both dongles' headers are right-angle pins like the modules', and
  the wire ends sit alike off both boards.
- **Dongle cheatsheets in step**: the same USB sockets, switch and crystal;
  the CH341T's sheet in I2C mode alone, its TXD and RXD shown as digital I/O
  (measured: the datasheet gives them no job in I2C mode).
- **Why up, not down?**: a note under the accelerometer views: the chip
  feels what holds it up, not gravity (free fall reads 0 g).

## 1.5.3

- **Cards that fold on every live page**: the device pages (the IMU's raw
  numbers and calibration, the humidity, power, pulse, distance and
  thermometer pages) and the physics pages, 42 cards, each by its own
  heading; the control rows stay.
- **The settings cog on every Live control row**, the device pages' too,
  at its right edge: the timing meter switch.
- The offline copy (service worker) on i2c.ninja only: a build previewed on
  our own machines always runs fresh.
- bench/live.mjs measures any live page (BENCH_PATH): the MPU-6050 page holds
  60 frames a second even on a machine four times slower than the Pi.

## 1.5.2

- **Cards that fold** (the Attitude page): a chevron in each card's corner
  minimises it to its title and back; folded, its charts and drawings stop
  (their data kept), so a lesson keeps only what it needs and the page gets
  lighter. Remembered per page in this browser.
- The pilot's gauges in a card of their own; the glass box with its walls
  unfolded in another.
- **Live card settings**: a cog with a Timing meter switch (the frames and
  readings in a corner; the same setting as ?perf, for this tab).
- The glass box's floor label centred across the floor, clear of its frame.

## 1.5.1

- **The glass box and the flat views drawn on canvases** (lib/canvas.js):
  their walls, grids and axes drawn once, the board and its axes over them
  each frame. Each view about half its cost; on the Pi 5 the Attitude page
  holds 60 frames a second under a child's shaking.
- **The numbers card rests while scrolled away**: no refresh and no layout
  off screen, catching up as it comes back (a slower machine, at the
  gauges: views updated twice as often).
- **The math, drawn, holds still**: the live captions' numbers at a fixed
  width, the triangle's caption in two lines, so the text under them no
  longer jumps.
- For measuring: the timing meter says which server and build each entry
  came from; ?hide= leaves parts of the Attitude page out (not on
  i2c.ninja); bench/live.mjs sweeps them.

## 1.5.0

1.4.x closed (the CH347, Dongles, the wiring drawings); 1.5.x opens with
smoothness: the live pages measured on a Raspberry Pi 5 (the user: a fair
low-end computer) and made to hold up when a child shakes the board.

- **Readings in a background thread** (a worker, for the Attitude and
  physics pages): the page shows the dongle's chooser, the worker opens it
  and reads on its own timer, so a busy page no longer delays a reading.
  With a hard shake on a machine four times slower than the Pi, readings
  held 51 a second (were 10 to 12); the filter integrates each at its
  own time.
- **An adaptive frame rate**: when frames run long, the views update on
  every second frame (or every third), all together, so the motion stays
  even instead of stuttering; every frame again once there's time.
- **Cheaper frames**: charts with their size and colours cached, their
  legend 8 times a second, nothing drawn off screen; the attitude and
  heading gauges turned by the GPU (CSS transforms), their fixed parts
  painted once; every live view skips its style, layout and paint while
  scrolled away; readings reach the views once a frame.
- **The Attitude page's numbers, tidy**: a short term on each row, its
  explanation in a tooltip; values hold their width, so the page no longer
  jumps; the card refreshes 8 times a second and says how fast the filter
  computes (computed 51 times a second · shown 8 · readings so far).
- **Tooltips of our own** (InfoTip): wrapped, kept on screen, shown on
  hover, focus or a tap (phones too).
- **Connect and Stop** with icons, Stop in its own colour.
- Get started: **Windows tried** (a CH347T on WinUSB through Zadig).
- For measuring (not on the site's pages): **?perf**, a timing meter
  (frames, readings, slow frames' anatomy); a **fake dongle** for our own
  servers (?fake, ?fake=kid); bench/ in the repo (the views' frame times in
  headless Chromium, the live page driven by the fake dongle).

## 1.4.2

- **Get started, the wiring drawn for each dongle**: the CH347T's own
  (setup-ch347t.svg: the board USB-C down, S1 on and S2 off, SDA, SCL, GND
  and 3V3 to a GY-521), its cheatsheet linked beside; the CH341T's redrawn
  the same way (setup.svg is now setup-ch341t.svg): lying, as before, its
  parts placed from its cheatsheet, the LEDs where they are (TNOW, RDY),
  four straight wires.
- Get started, Linux: the CH341's spi-ch341 steps as their own card, 3.1
  Optional; a CH347 is ready after the udev rule.
- **Home: Common hardware, no lock-in**, a band under the cards, to
  Dongles: no board of ours to buy, WCH's everyday bridges through open
  drivers, the sensors the common modules any seller has. Nothing to
  install now about the browser alone.
- **Ask for a sensor**: Devices ends with "Your sensor isn't here?", an
  issue on GitHub; Dongles the same for a dongle.
- **Dongles: Difficulty**, out of five stars, by the board's pins (the
  user): the CH341T easy (6 pins), the CH341A moderate (36 holes), the
  CH347T harder (32 pins named for every mode, a mode switch). The
  description the page's width; the I2C row the speeds alone.
- **The disclaimer: the readings are the sensor's, not ours**: what each
  sensor offers, as its datasheet describes, not certified or endorsed,
  the code open to check. The footer points to it.

## 1.4.1

- **The CH347T recommended** (the user): first on Dongles (a badge, the
  table's first column), first in Get started's step 2 (its switch, S1 on
  and S2 off; its four wires; its sheet), the CH341T 2-in-1 after it; the
  CH347 named first wherever the pages name the dongle.
- Get started, Linux: the kernel's spi-ch341 steps for a CH341 only; a
  CH347 needs just the udev rule (the kernel takes its serial port and
  leaves the rest to the browser).
- Dongles out of the header: the footer and Get started link it.

## 1.4.0

1.3.x closed (Algorithms, the home page, the blog, the licenses); 1.4.x
opens with a second dongle.

- **The CH347** (the user, on the bench: "wow, it works"): the browser's
  chooser lists CH341s and CH347s, a CH347T in mode 1 (1A86 55DB) or a
  CH347F (55DE), and the one picked opens through atiic's CH347 adapter
  (atiic 1.4.33). Both give every page the same I2C bus; on the CH347 every
  written byte's ack comes back, so a refused write is caught. Tried on a
  CH347T (LXC-CH347) with an MPU-6050: the setup check found it, its page
  ran live.
- **Dongles** (/dongles, in the header and the footer): the three we
  tested side by side (on this site, USB, I2C, SPI, digital I/O lines, the
  serial port, voltage), then each with its cheatsheet (atiic's, drawn from
  the board and its datasheet), how to recognise it and the words that
  find it in a shop: the CH341T 2-in-1, the CH341A V357, the CH347T
  (LXC-CH347). Get started points to it.
- Get started for the CH347: the Linux udev rule takes 5512, 55DB and 55DE;
  Windows names the CH347T's Interface 2 for Zadig (not tried); a CH347T's
  mode switch in step 2 and in the chooser's hint.
- "The USB dongle (a CH341 or a CH347)" where the pages said the CH341
  dongle, the search descriptions too.

## 1.3.5

- Two licenses for two kinds of work: the code stays under PolyForm
  Noncommercial 1.0.0 (LICENSE); the content (the text of the pages, the
  drawings and images, the blog and the courses) is now under CC BY-NC-SA
  4.0 (LICENSE-CONTENT.md), a class's slides and handouts welcome with
  credit. atiic stays MIT. The README, About and the footer say both.
- Blog: Built in public, under three licenses (why the drivers, the site's
  code and its content are licensed apart; yes, it can be copied, and why
  build in public anyway), with its comic and link preview.
- Home: Open learning, built in public, to the blog, in place of Open for
  learning.
- Tables in blog posts styled.

## 1.3.4

- Link previews: each blog post shares as its own card (its comic strip and
  title, as an article with its date); the site's card says what the site
  is now (the I2C name, by physics, by device, field-tested, by
  algorithm).
- Two comic bubbles widened, so their words fit wider fonts too.

## 1.3.3

- Share this page without Instagram: it takes no link from a web page, so
  its button could only copy the link. The phone's own share sheet still
  reaches it.

## 1.3.2

- A blog (/blog), in the open: how atiic and i2c.ninja come about, in
  Weihong's words. Posts in markdown (src/blog), each with a comic strip at
  its top and drawings inside: Reloaded (the datasheet in code, loyal to no
  chip; a coding agent alongside), A dongle for a bridge (the CH341T in place
  of the homemade bridge, WebUSB), Three sensors from 2012 (devices, physics,
  algorithms: deep, and stereo), and a note, The last generation? (greenrain,
  2013). Blog in the footer.
- Field-tested, said: the Devices page and every device card, the home's
  Devices card: each device's driver run on a real module and its page tried
  on the bench before it joined.
- Share this page: a QR code of the link, popping up (uqr, drawn in the
  page).
- The course and the blog share one markdown renderer (MarkdownArticle).

## 1.3.1

- Home as a simple landing page: the hero (where the name comes from, I2C,
  the two-wire bus most small sensors speak; Explore sensors and Get
  started; the glass box with the board swaying in it, still for reduced
  motion), six cards (physics, devices, algorithms, smoke-testing a module,
  nothing to install, open for learning), three quotes on measuring with
  their sources. The carousel gone.
- A Devices page (/devices), every device a card; All devices at the foot of
  the Devices menu. The header: Physics, Devices, Algorithms.
- Share this page, in the footer: the device's share sheet where there is
  one, X, Facebook, LinkedIn, Reddit, Instagram (copies the link: it takes
  none from a page), email, copy link, as their logos (Simple Icons); plain
  links, nothing loaded from the networks.
- The MPU-6050 page reworked: tabs for the accelerometer's and the gyro's
  views (as the ADXL345's and ITG-3200's pages), the raw numbers and the
  calibration; Both together links to the attitude page.
- Learn as courses written in markdown; the first, Motion (the physics, the
  wiring, what the sensors give, the maths, practice, and the questions).
  Not in the header yet. Learn the IMU folded into the pages (raw numbers
  and calibration on the MPU page, the kp/ki sliders on the attitude page);
  its old addresses forward.
- The attitude page: v-hat in the atan2 triangles beside gravity's, the gap
  between them; kp and ki adjustable.

## 1.3.0

- Algorithms, a third way in beside the devices and the physics: a page an
  algorithm combining physics (lib/algorithms.js), the Algorithms menu, By
  algorithm on the home page, a footer column, Recent. The first: Attitude
  from accel and gyro (/algorithms/attitude), 6-axis sensor fusion. Tried
  with an ADXL345 + ITG-3200 pair and with an MPU-6050.
- A Live card finding a pair: an accelerometer and a gyro, from one chip
  (an MPU's two halves paired) or two boards (a hint to line up their
  axes); lib/useSources.js scans for several quantities at once (useSource
  now built on it). Zero: the gyro held still two seconds, b0 taken off.
- The numbers and the formulas, drawn by KaTeX (TexMath, loaded with this
  page only), each with its live value: the readings, gravity's tilt, the
  gyro alone, q (q0 from gravity, beta and n), Mahony's filter step by step
  (kp, ki, kd = 0 as PID, a-hat, v-hat, e, b-hat, omega', q turned, the
  fused angles). Every angle subscripted by its path: g gravity's, omega
  the gyro alone, q fused, c the complementary filter's.
- The math, drawn: atan2 as triangles, Mahony's two ups. Charts for phi,
  theta and psi, each way named as in the formulas.
- The result: an attitude indicator and a new heading indicator (a pilot's
  gauges), the board in a glass box (its projections on three walls, the
  world's axes from their corner) and the walls unfolded as flat views.
  The body frame (x, y, z) and the world frame (X, Y, Z) named, with a card
  on what q is for; more to read (the papers, the maths, PID).
- The board drawn in a neutral slate everywhere (lib/board.js): blue,
  orange and green are the axes'. The gyro pages' flat views styled as the
  glass box. See also from Acceleration and Rotation to the new page.

## 1.2.2

- Physics: Magnetism and the compass (/physics/magnetism): a Live card that
  finds any magnetometer on the bus (the HMC5883L, read at its 15 a second),
  the magnetometer's views, Earth's field and its dip drawn, a permalloy
  bridge and set/reset, a compass and declination (NOAA's calculator), the
  board's own field (hard and soft iron), things to try. Tried with an
  HMC5883L.
- MagnetometerViews: the magnetometer's views as one component (the field
  with the compass rose, Calibrate, three ways, the board against the field,
  the chart), fed by each page's adapter; useHardIron calibrates any stream
  of readings. The HMC5883L page's composable now an adapter.
- Device pages end with Its settings: what the chip offers and what the
  page uses, the few that matter (SpecTable), its maker's home page at the
  heading, See also its physics page; in place of How it measures on the
  ADXL345, ITG-3200 and HMC5883L pages.
- The Live card says the chip's own rate. Device and physics pages' opening
  paragraph full width.

## 1.2.1

- Physics: Rotation and the gyroscope (/physics/rotation): a Live card that
  finds any gyroscope on the bus (MPU-6050, MPU-6500, ITG-3200: the MPUs
  asked first, the ITG-3200 woken only where none holds the address), the
  gyro's views, angular velocity and the right-hand rule, the Coriolis push
  drawn, from rate to angle and its drift, things to try. Tried with an
  ITG-3200.
- GyroViews: the gyro's views as one component (the rates with Zero, the
  ball, turned so far, the chart), fed by each page's adapter: the
  ITG-3200 page (its composable now an adapter), the MPU page's Gyro tab,
  the Rotation page. useTurned adds up any stream of gyro readings.
- The ITG-3200 page's How it measures shortened, linking Rotation.
- Recent keeps physics pages too (noted Physics). Physics left of Devices
  in the header.

## 1.2.0

- Physics, a second way in beside the devices: a page a topic
  (lib/physics.js), the Physics menu, By physics on the home page, a footer
  column, their titles for search. The first: Acceleration and gravity
  (/physics/acceleration): a Live card that scans the bus for any
  accelerometer the site knows (ADXL345, MPU-6050, MPU-6500; lib/sources.js,
  lib/useSource.js, SourceBar: each chip linked to its page and wiring),
  the views, a mass on springs and the capacitor drawn, tilt from gravity,
  things to try.
- AccelerometerViews: the accelerometer's views as one component (the
  readings with the dial and a hint, three ways, the board in the room, the
  chart), fed by each page's own adapter: the ADXL345 page, the Acceleration
  page and the MPU page's Accelerometer tab. HintNote, a light bulb beside a
  hint.
- The ADXL345 page's How it measures shortened to its own, linking the
  physics. "New to the dongle? Get started." under every device page's
  wiring drawing.

## 1.1.3

- The MPU-6050/6500 page to the newer pages' standard: its wiring drawing
  with the GY-521's printed axes (setup-mpu6050.svg), acceleration and
  rotation tiles with the temperature, the dial (fused roll and pitch), and
  three tabs in the address: both fused (Mahony's filter on the 3D board,
  Start again), the accelerometer's views (three ways, the board in the
  room) and the gyro's (the ball, turned so far with Zero and Reset), for
  those who have only this board. How it measures waits for its datasheets.

## 1.1.2

- The service worker sends pages to the network first: from the cache
  (1.1.0) they never passed Cloudflare, whose Web Analytics beacon is added
  on the way, so returning visits and the installed app went uncounted.
  A copy is kept as each page passes; offline (a failsafe), a page comes
  from its copy or the precached app shell, whose router opens it. The
  scripts, styles and drawings stay precached (73 files, 784 KiB). Tried on
  r8845: a change on the server shows up online; offline a page opened
  before and one never opened both load.

## 1.1.1

- Recent: the device pages this browser opened last (four, newest first),
  on the home page (with "clear") and on top of the Devices menu. Kept in
  localStorage (lib/recent.js): this browser only, offline too, other tabs
  follow. Tests.
- About says what the site remembers, and that page visits are counted
  anonymously with Cloudflare Web Analytics (no cookies, no cross-site
  tracking, the EU not counted).
- Fixed: opening an alias (/mpu6500) inside the app titled it Not found.

## 1.1.0

- A PWA: installable as an app (desktop, Android), and offline once visited.
  A service worker (Workbox, scripts/sw.mjs, after prerender) precaches
  every file, each page's own HTML included (98 files, 828 KiB); a new
  release waits for a "Reload" prompt rather than cutting a lesson off.
  The manifest completed (description, scope, theme colours, a maskable
  icon, categories education). Tried on r8845: installable, and with the
  network off /adxl345 and /learn/imu/tilt load from the cache.
- Workbox's glob given 14.0.3: the minimatch override (11.0.4) had left its
  glob 11 matching nothing; 14 fixes its own advisory too.
- About and README: install it, use it offline.

## 1.0.28

- About's title: "About | i2c.ninja" (was "About i2c.ninja | i2c.ninja").

## 1.0.27

- SEO: every page has its own title, description, canonical address and
  link-preview tags (lib/pages.js), set as you browse and written into its
  own HTML at build (scripts/prerender.mjs), so each address answers 200,
  not GitHub Pages' 404; sitemap.xml, robots.txt, the home page's JSON-LD;
  a link-preview card (og-card.png, 1200x630).
- The header: the version (opening the releases), Devices and Learn menus,
  Get started, a GitHub link to atiic; one menu on a phone. The footer: a
  site map. A Not found page.
- Setup is Get started, at /get-started (/setup forwards).
- Home: a headline, a carousel of the pages' drawings, what it's for (STEM
  lessons, digital experiments, an electronics smoke test).
- About: About and Releases as tabs; what it's for; the Discussions as the
  forum; commercial opportunities (vendors' links, marked; kits; licenses)
  by email; Fuzhou Sourcekit Electronics Ltd linked to sourcekit.cc.
- README: the devices, the Discussions; commercial licenses by email.

## 1.0.26

- The ITG-3200 page: x, y, z rates and its temperature live, Zero (its
  bias, held still), the gyro ball, turned so far (the rates added up,
  three flat views, the drift, why it can't feel the Earth turn), the
  chart, how it measures (a vibrating mass, the Coriolis push drawn, a
  capacitive pickoff), its wiring (the blue ITG-3200 module; VIO tied to
  VDD). Woken before it's asked for its ID (asleep it reads 0).
- The gyro ball: each ring's positive way marked, a spin arrow while
  turning, its axes in the charts' colours.

## 1.0.25

- The HMC5883L page: x, y, z and |B| live, the field's dip, a compass rose
  (held level; the board's x, y, z marked in the charts' colours), a
  hard-iron calibration (turned round, each axis's middle taken off), what
  the chip feels three ways and the board against the field line held still
  (the ADXL345's views with the field for gravity), the chart, its self
  test both ways, how it measures (one axis's bridge, set and reset, the
  field's dip drawn), its wiring (the Adafruit breakout). Checked on the
  bench: x to north reads north, to the east 90.
- VectorViews (was GravityViews) and AttitudeViews take a unit, a scale, a
  colour and a magnetic mode.

## 1.0.24

- The ADXL345 page: x, y, z and |a| live, the attitude dial (roll and
  pitch from gravity), what the chip feels three ways (its reading's arrow
  from above, its right side and its nose), the board in the room with
  gravity held still (pitch, roll; yaw out of an accelerometer's reach), the
  chart, its self test against the datasheet's limits, how it measures (a
  mass on springs, the differential capacitor), its wiring (the Adafruit
  breakout). atiic 1.3.23.
- The attitude dial goes full screen.

## 1.0.23

- License: PolyForm Noncommercial 1.0.0 (was MIT): free for noncommercial
  use, educational institutions included; commercial use by a separate
  license, asked for on GitHub. Releases up to 1.0.22 stay MIT for copies
  taken from them. README and About say so; atiic stays MIT.

## 1.0.14

- Setup: Android marked tried (the user's phone, Chrome, the dongle on an
  OTG adapter: it works).

## 1.0.13

- Learn the IMU, step 7, `faq`, "Questions" (no board needed, each a fold-out):
  how commercial drones calibrate, how fast a drone reads its IMU, why not
  I2C, the gyro's drift, heading, vibration, position from the
  accelerometer (the drift worked out), Mahony / Madgwick / Kalman, IMU /
  AHRS / INS; each linked to the step that shows it.

## 1.0.12

- Learn the IMU, step 6, `calibration`: why the chip in hand needs it and the
  values a flight controller keeps. The gyro's offset with the temperature
  (measure, warm the chip, measure again); the accelerometer's offset and
  scale per axis from six positions, guided one at a time (the pose shown
  in 3D, the face told live, recorded by itself after a second still),
  each axis on a number line (errors drawn 10x), |a| across the six raw
  against corrected; the values as a block. Tried on r8845.
- The calibration kept for the tab (`sessionStorage`, per chip type): Save
  and Forget on step 6; `useImu` takes it off every reading for the chip it
  was saved for, in steps 2-5 and on the motion page; the controls say
  "calibrated" with a switch, or "not calibrated · calibrate". Steps 1 and 6
  stay raw. Steps 3 and 4's drift exercises say to untick it first.
- `src/lib/calibration.js` (the six-position fit) and
  `src/lib/calibrationStore.js`, with host tests (15 in all);
  `AxisCalLine.vue`.

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
