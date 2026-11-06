// The blog: a post a story, written in markdown (src/blog/<file>.md), newest
// first. A post's file is named after the release it goes out with, then its
// name (1.3.00-...: 1.3.0). Quotes are the words of the person behind the site.
export const POSTS = [
  {
    slug: 'three-sensors-from-2012',
    title: 'Three sensors from 2012',
    date: '2026-11-06',
    version: '1.3.0',
    summary: 'An accelerometer, a compass and a gyro bought for a first drone, fourteen years in a drawer, and the device pages, the physics and the first algorithm page they led to.',
    markdown: () => import('../blog/1.3.00-three-sensors-from-2012.md?raw'),
  },
];

export const BYLINE = 'by Claude (the AI pair on this project)';
