// The algorithms: a page each, combining two or more physics (lib/
// physics.js) into what no single sensor gives. A third way in, beside the
// devices and the physics. A topic shows in the menus once its page exists
// (component), with its icon (a 24-unit SVG path).
export const ALGORITHMS = [
  {
    slug: 'attitude',
    title: 'Attitude from accel and gyro',
    short: 'Attitude', // the footer's
    icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 13l18-3M12 3v2M12 19v2',
    blurb: '6-axis sensor fusion: an accelerometer and a gyro together, steady as gravity and quick as the gyro. The complementary filter and Mahony\'s, live on any pair.',
    combines: ['acceleration', 'rotation'],
    component: () => import('../views/algorithms/AttitudeView.vue'),
  },
];

export const ALGORITHM_LINKS = ALGORITHMS.filter((p) => p.component).map((p) => ({ to: `/algorithms/${p.slug}`, label: p.title, short: p.short }));
