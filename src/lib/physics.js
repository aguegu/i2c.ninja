// The physics topics: a page each, explaining an idea and pointing to the
// devices (or a device's tab) that measure it. A topic shows in the menus
// once its page exists (component), with its icon (a 24-unit SVG path). The other way in to the same pages as
// the device list (lib/devices.js).
export const PHYSICS = [
  {
    slug: 'acceleration',
    icon: 'M12 3a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 11v9M8 16l4 4 4-4',
    title: 'Acceleration and gravity',
    short: 'Acceleration', // the footer's
    blurb: 'Why a sensor sitting still reads 1 g upward, how a tiny mass on springs feels a push, and tilt from gravity.',
    devices: [
      { to: '/adxl345', label: 'ADXL345', note: 'accelerometer' },
      { to: '/mpu6050#accelerometer', label: 'MPU-6050 / MPU-6500', note: 'its accelerometer' },
    ],
    component: () => import('../views/physics/AccelerationView.vue'),
  },
  {
    slug: 'rotation',
    icon: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4',
    title: 'Rotation and gyroscope',
    short: 'Rotation',
    blurb: 'How fast something turns, which way is positive, how a shaking mass feels a turn, and why a gyro drifts.',
    devices: [
      { to: '/itg3200', label: 'ITG-3200', note: 'gyroscope' },
      { to: '/mpu6050#gyro', label: 'MPU-6050 / MPU-6500', note: 'its gyro' },
    ],
    component: () => import('../views/physics/RotationView.vue'),
  },
  {
    slug: 'magnetism',
    icon: 'M5 4h5v8a2 2 0 0 0 4 0V4h5v8a7 7 0 0 1-14 0zM5 8h5M14 8h5',
    title: 'Magnetism and compass',
    short: 'Magnetism',
    blurb: 'Earth\'s field and its dip into the ground, how a strip of permalloy feels it, a compass from it, and the board\'s own field.',
    devices: [
      { to: '/hmc5883l', label: 'HMC5883L', note: 'magnetometer' },
    ],
    component: () => import('../views/physics/MagnetismView.vue'),
  },
  {
    slug: 'distance',
    icon: 'M3 4v16M21 4v16M6 12h12M9 9l-3 3 3 3M15 9l3 3-3 3',
    title: 'Distance and time of flight',
    short: 'Distance',
    blurb: 'Distance by timing light there and back, then speed and acceleration from the distances, and how noise grows with each step.',
    devices: [
      { to: '/vl53l1x', label: 'VL53L1X', note: 'time-of-flight distance' },
    ],
    component: () => import('../views/physics/DistanceView.vue'),
  },
  {
    slug: 'humidity',
    title: 'Humidity and dew point',
    short: 'Humidity',
    icon: 'M12 3c-4 5-6 8.5-6 11.5a6 6 0 0 0 12 0C18 11.5 16 8 12 3zM9.5 15a2.5 2.5 0 0 0 2.5 2.5',
    blurb: 'How much water the air holds, why relative humidity falls as air warms with the same water in it, and the dew point, where it condenses.',
    devices: [
      { to: '/sht20', label: 'SHT20', note: 'humidity and temperature' },
      { to: '/sht3x', label: 'SHT3x', note: 'humidity and temperature' },
      { to: '/aht21', label: 'AHT21B', note: 'humidity and temperature' },
    ],
    component: () => import('../views/physics/HumidityView.vue'),
  },
  {
    slug: 'colour',
    title: 'Colour and light',
    short: 'Colour',
    icon: 'M8 9a4 4 0 1 0 8 0a4 4 0 1 0-8 0M5 14.5a4 4 0 1 0 8 0a4 4 0 1 0-8 0M11 14.5a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
    blurb: 'White light as many colours, the eye\'s three kinds of sensor, mixing light by adding it, and a colour sensor doing what the eye does, with the screen as its light.',
    devices: [
      { to: '/bh1745', label: 'BH1745NUC', note: 'colour' },
    ],
    component: () => import('../views/physics/ColourView.vue'),
  },
];

export const PHYSICS_LINKS = PHYSICS.filter((p) => p.component).map((p) => ({ to: `/physics/${p.slug}`, label: p.title, short: p.short, icon: p.icon }));
