// The physics topics: a page each, explaining an idea and pointing to the
// devices (or a device's tab) that measure it. A topic shows in the menus
// once its page exists (component). The other way in to the same pages as
// the device list (lib/devices.js).
export const PHYSICS = [
  {
    slug: 'acceleration',
    title: 'Acceleration and gravity',
    blurb: 'Why a sensor sitting still reads 1 g upward, how a tiny mass on springs feels a push, and tilt from gravity.',
    devices: [
      { to: '/adxl345', label: 'ADXL345', note: 'accelerometer' },
      { to: '/mpu6050#accelerometer', label: 'MPU-6050 / MPU-6500', note: 'its accelerometer' },
    ],
    component: () => import('../views/physics/AccelerationView.vue'),
  },
  {
    slug: 'rotation',
    title: 'Rotation and the gyroscope',
    blurb: 'How fast something turns, which way is positive, how a shaking mass feels a turn, and why a gyro drifts.',
    devices: [
      { to: '/itg3200', label: 'ITG-3200', note: 'gyroscope' },
      { to: '/mpu6050#gyro', label: 'MPU-6050 / MPU-6500', note: 'its gyro' },
    ],
    component: () => import('../views/physics/RotationView.vue'),
  },
  {
    slug: 'magnetism',
    title: 'Magnetism and the compass',
    blurb: 'Earth\'s field and its dip into the ground, how a strip of permalloy feels it, a compass from it, and the board\'s own field.',
    devices: [
      { to: '/hmc5883l', label: 'HMC5883L', note: 'magnetometer' },
    ],
    component: () => import('../views/physics/MagnetismView.vue'),
  },
];

export const PHYSICS_LINKS = PHYSICS.filter((p) => p.component).map((p) => ({ to: `/physics/${p.slug}`, label: p.title }));
