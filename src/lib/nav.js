// The site's links, grouped, for the header's menus and the footer's site
// map: from the device cards and the Learn steps, so a new page shows up in
// both by itself
import { DEVICES } from './devices.js';
import { IMU_STEPS } from '../views/learn/imuSteps.js';

export const REPO = 'https://github.com/aguegu/i2c.ninja';
export const ATIIC = 'https://github.com/aguegu/atiic';
export const DISCUSSIONS = 'https://github.com/aguegu/i2c.ninja/discussions';

export const DEVICE_LINKS = DEVICES.filter((d) => d.to !== '/learn/imu').map((d) => ({ to: d.to, label: d.name, note: d.kind }));
export const LEARN_LINKS = [
  { to: '/learn/imu', label: 'Learn the IMU', note: 'all the steps' },
  ...IMU_STEPS.filter((s) => s.component).map((s, i) => ({ to: `/learn/imu/${s.slug}`, label: `${i + 1}. ${s.title}` })),
];
export const START_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/get-started', label: 'Set up the dongle' },
  { to: '/about', label: 'About' },
];
export const ELSEWHERE_LINKS = [
  { href: DISCUSSIONS, label: 'Discussions', note: 'questions, ideas, what you built' },
  { href: ATIIC, label: 'atiic', note: 'the drivers' },
  { href: REPO, label: 'i2c.ninja on GitHub', note: 'the source' },
];
