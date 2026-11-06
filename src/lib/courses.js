// The courses: a walk through the site's pages in five stages (the physics,
// the wiring, what the sensors give, the maths, practice), written in
// markdown (src/courses/<slug>.md). Learn lists them.
export const COURSES = [
  {
    slug: 'motion',
    title: 'Motion: from gravity and turning to attitude',
    blurb: 'An accelerometer and a gyro, step by step: the physics, the wiring, the raw numbers and calibration, the fusion that joins them, and practice.',
    kit: 'an MPU-6050, or an ADXL345 + ITG-3200',
    markdown: () => import('../courses/motion.md?raw'),
  },
];

export const COURSE_LINKS = COURSES.map((c) => ({ to: `/learn/${c.slug}`, label: c.title }));
