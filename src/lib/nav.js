// The site's links, grouped, for the header's menus and the footer's site
// map: from the device cards and the guides, so a new page shows up in both
// by itself
import { DEVICES, GUIDES } from './devices.js';
export { PHYSICS_LINKS } from './physics.js';
export { ALGORITHM_LINKS } from './algorithms.js';

export const REPO = 'https://github.com/aguegu/i2c.ninja';
export const ATIIC = 'https://github.com/aguegu/atiic';
export const DISCUSSIONS = 'https://github.com/aguegu/i2c.ninja/discussions';

export const DEVICE_LINKS = DEVICES.map((d) => ({ to: d.to, label: d.name, note: d.kind }));
// the guides, each by its index page (its chapters are linked from there)
export const GUIDE_LINKS = GUIDES.map((g) => ({ to: g.to, label: g.name, note: g.kind }));
export const START_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/get-started', label: 'Set up the dongle' },
  { to: '/dongles', label: 'Dongles' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
];
export const ELSEWHERE_LINKS = [
  { href: DISCUSSIONS, label: 'Discussions', note: 'questions, ideas, what you built' },
  { href: ATIIC, label: 'atiic', note: 'the drivers' },
  { href: REPO, label: 'i2c.ninja on GitHub', note: 'the source' },
];
