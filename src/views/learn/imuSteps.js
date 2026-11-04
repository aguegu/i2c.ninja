// "Learn the IMU": the steps, in order; a step without a component is to come
export const IMU_STEPS = [
  { slug: 'raw-numbers', title: 'Raw numbers to physics', blurb: 'What the chip sends: bytes, counts, then g and deg/s.', component: () => import('./ImuRawNumbers.vue') },
  { slug: 'tilt', title: 'Tilt from gravity', blurb: 'Roll and pitch from the accelerometer, and why a shake fools it.', component: () => import('./ImuTilt.vue') },
  { slug: 'gyro-angle', title: 'Angle from the gyro', blurb: 'Integrating rotation into an angle, and why it drifts.' },
  { slug: 'fusion', title: 'Combining the two', blurb: 'The complementary filter, then Mahony\'s: steady and quick at once.' },
  { slug: 'attitude', title: '3D attitude', blurb: 'The board\'s orientation in space, and quaternions without the fear.' },
  { slug: 'pid', title: 'PID: holding an axis', blurb: 'The loop a quadcopter runs: tune P, I and D on a simulated axis.' },
];
