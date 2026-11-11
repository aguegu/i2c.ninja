// After vite build: a page's own HTML for every route (dist/adxl345.html,
// dist/learn/imu/tilt.html, ...), the app's index.html with that page's
// title, description, canonical address and link-preview tags, so GitHub
// Pages answers each address with 200 (not its 404.html) and search engines
// and link previews read the page's own words without running the app. Then
// 404.html (not indexed), sitemap.xml and robots.txt. The pages: lib/pages.js.
// Each page's HTML also carries, for crawlers that don't run the app: its
// heading, description and the pages it leads to, inside #app (the app
// replaces them when it starts), and its structured data (schema.org:
// breadcrumbs; a device page as a TechArticle, a topic or course as a
// LearningResource, a post as a BlogPosting). The sitemap's lastmod: the
// date of the last commit to the page's own source (git), none without git.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { PAGES, ORIGIN, SITE, fullTitle, DESCRIBE_MAX } from '../src/lib/pages.js';
import { DEVICES_BY_GROUP } from '../src/lib/devices.js';
import { PHYSICS } from '../src/lib/physics.js';
import { ALGORITHMS } from '../src/lib/algorithms.js';
import { COURSES } from '../src/lib/courses.js';
import { POSTS } from '../src/lib/blog.js';
import { MOVED } from '../src/lib/moved.js';
import { ALIASES } from '../src/lib/aliases.js'; // the router's too: their own files, canonical to the page

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
// a preview image's address with ?v= its content's hash: a card redrawn gets a
// new address, so X and the rest fetch it again instead of keeping the old
// one (they cache an image by its address)
const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const versioned = (path) => `${ORIGIN}${path}?v=${createHash('sha256').update(readFileSync(PUBLIC + path.slice(1))).digest('hex').slice(0, 8)}`;
const IMAGE = versioned('/og-card.png'); // 1200 x 630, from scripts/og-card.svg (rsvg-convert -w 1200 -h 630); a page may have its own (page.image)
const IMAGE_ALT = 'i2c.ninja, sensors live and explained: three comic panels, physics (a screen shows 1 g pointing up, "Why up?"), devices (a sensor wired to a USB-to-I2C bridge and a laptop with a live chart, "Live!") and algorithms (a pilot\'s horizon rolled 20°, "Like a pilot!")';
const template = readFileSync(`${DIST}index.html`, 'utf8');

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const once = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not in index.html`);
  return html.replace(pattern, value);
};

const AUTHOR = { '@type': 'Person', name: 'Weihong Guan', url: 'https://github.com/aguegu' };
const PUBLISHER = { '@type': 'Organization', name: SITE, url: `${ORIGIN}/` };

// every page's description within DESCRIBE_MAX: what a search result shows
const tooLong = PAGES.filter((p) => p.description.length > DESCRIBE_MAX);
if (tooLong.length) throw new Error(`prerender: descriptions over ${DESCRIBE_MAX}: ${tooLong.map((p) => `${p.path} (${p.description.length})`).join(', ')}`);

// the page's place: home, then its section (if it has a page), then itself
const SECTIONS = [['/blog/', '/blog', 'Blog'], ['/learn/', '/learn', 'Learn'], ['/physics/', '/physics', 'Physics']];
function crumbs(page) {
  const list = [{ name: SITE, url: `${ORIGIN}/` }];
  if (page.kind === 'device') list.push({ name: 'Devices', url: `${ORIGIN}/devices` });
  for (const [prefix, path, name] of SECTIONS) if (page.path.startsWith(prefix)) list.push({ name, url: ORIGIN + path });
  list.push({ name: page.heading ?? page.title, url: ORIGIN + page.path });
  return { '@type': 'BreadcrumbList', itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) };
}

// schema.org, the page's own kind
function structured(page) {
  const url = ORIGIN + page.path;
  const common = { name: page.heading ?? page.title, description: page.description, url, inLanguage: 'en', isAccessibleForFree: true };
  if (page.path === '/') return { '@type': 'WebSite', name: SITE, url: `${ORIGIN}/`, description: page.description, keywords: 'STEM education, physics experiments, sensors, I2C, WebUSB, electronics, smoke test', audience: { '@type': 'EducationalAudience', educationalRole: 'teacher, student' } };
  if (page.kind === 'device') return { '@type': 'TechArticle', headline: page.title, ...common, about: { '@type': 'Product', name: page.about.name, manufacturer: { '@type': 'Organization', name: page.about.maker } }, publisher: PUBLISHER };
  if (['physics', 'algorithm', 'course'].includes(page.kind)) return { '@type': 'LearningResource', ...common, learningResourceType: page.kind === 'course' ? 'course' : 'interactive resource', educationalUse: 'experiment', audience: { '@type': 'EducationalAudience', educationalRole: 'teacher, student' }, author: AUTHOR, publisher: PUBLISHER };
  if (page.kind === 'post') return { '@type': 'BlogPosting', headline: page.heading, description: page.description, url, datePublished: page.published, author: AUTHOR, publisher: PUBLISHER, ...(page.image && { image: ORIGIN + page.image }) };
  return null;
}

// what a crawler that doesn't run the app reads: the heading, the
// description, the pages this one leads to, and the site's map
const a = (to, label) => `<a href="${to}">${esc(label)}</a>`;
const list = (items) => `<ul>${items.map((i) => `<li>${a(i.to, i.label)}</li>`).join('')}</ul>`;
const MAP = [
  ...DEVICES_BY_GROUP.map((g) => [`Devices: ${g.name}`, g.devices.map((d) => ({ to: d.to, label: d.name }))]),
  ['Physics', PHYSICS.filter((p) => p.component).map((p) => ({ to: `/physics/${p.slug}`, label: p.title }))],
  ['Algorithms', ALGORITHMS.filter((p) => p.component).map((p) => ({ to: `/algorithms/${p.slug}`, label: p.title }))],
  ['Learn', COURSES.map((c) => ({ to: `/learn/${c.slug}`, label: c.title }))],
  ['Blog', POSTS.map((p) => ({ to: `/blog/${p.slug}`, label: p.title }))],
  ['Start', [{ to: '/get-started', label: 'Get started' }, { to: '/dongles', label: 'Dongles' }, { to: '/about', label: 'About' }]],
];
function body(page) {
  const related = page.links?.length ? `<h2>See also</h2>${list(page.links)}` : '';
  const map = MAP.map(([name, items]) => `<h2>${name}</h2>${list(items)}`).join('');
  return `<main><h1>${esc(page.heading ?? page.title)}</h1><p>${esc(page.description)}</p>${related}<nav aria-label="Site map">${map}</nav></main>`;
}

function render(page, { robots } = {}) {
  const title = esc(fullTitle(page));
  const description = esc(page.description);
  const url = ORIGIN + page.path;
  let html = template;
  html = once(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = once(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
  html = once(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  const tags = [
    robots && `<meta name="robots" content="${robots}">`,
    `<meta property="og:site_name" content="${SITE}">`,
    `<meta property="og:type" content="${page.type ?? 'website'}">`,
    page.published && `<meta property="article:published_time" content="${page.published}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${page.image ? versioned(page.image) : IMAGE}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(page.imageAlt ?? IMAGE_ALT)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    !robots && `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [structured(page), page.path !== '/' && crumbs(page)].filter(Boolean) })}</script>`,
  ].filter(Boolean).map((t) => `    ${t}\n`).join('');
  html = once(html, /<\/head>/, `${tags}  </head>`);
  return robots ? html : once(html, /<div id="app"><\/div>/, `<div id="app">${body(page)}</div>`);
}

function write(file, html) {
  mkdirSync(dirname(DIST + file), { recursive: true });
  writeFileSync(DIST + file, html);
}

const fileOf = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);
for (const page of PAGES) write(fileOf(page.path), render(page));
for (const [alias, path] of Object.entries(ALIASES)) write(fileOf(alias), render(PAGES.find((p) => p.path === path)));
// old addresses: a page that forwards (and names the new one canonical)
for (const [from, to] of Object.entries(MOVED)) {
  write(fileOf(from), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | ${SITE}</title><link rel="canonical" href="${ORIGIN}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${ORIGIN}${to}</a></body></html>\n`);
}
write('404.html', render({ path: '/', title: 'Not found', description: 'No page here.' }, { robots: 'noindex' })
  .replace(/<title>[^<]*<\/title>/, `<title>Not found | ${SITE}</title>`)
  .replace(/\s*<link rel="canonical" href="[^"]*">/, '')
  .replace(/\s*<meta property="og:url" content="[^"]*">/, ''));

// each page's own source: its view (the router, the physics and algorithm
// lists) or its markdown (a course, a post), by reading those files
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const sources = new Map([['/', 'views/HomeView.vue']]);
const scan = (file, re, path) => { for (const m of readFileSync(SRC + file, 'utf8').matchAll(re)) sources.set(path(m[1]), m[2]); };
scan('router.js', /path: '([^']+)'[^\n]*?import\('\.\/([^']+)'\)/g, (p) => p);
scan('lib/physics.js', /slug: '([^']+)'[\s\S]*?import\('\.\.\/([^'?]+)[^']*'\)/g, (sl) => `/physics/${sl}`);
scan('lib/algorithms.js', /slug: '([^']+)'[\s\S]*?import\('\.\.\/([^'?]+)[^']*'\)/g, (sl) => `/algorithms/${sl}`);
scan('lib/courses.js', /slug: '([^']+)'[\s\S]*?import\('\.\.\/([^'?]+)[^']*'\)/g, (sl) => `/learn/${sl}`);
scan('lib/blog.js', /slug: '([^']+)'[\s\S]*?import\('\.\.\/([^'?]+)[^']*'\)/g, (sl) => `/blog/${sl}`);
// its last commit's date (YYYY-MM-DD), or null (no git, or the file new)
function lastmod(path) {
  const file = sources.get(path);
  if (!file) return null;
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', `src/${file}`], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}
const dated = PAGES.map((p) => ({ p, mod: lastmod(p.path) }));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dated.map(({ p, mod }) => `  <url><loc>${ORIGIN}${p.path}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log(`prerender: ${PAGES.length} pages (${dated.filter((d) => d.mod).length} dated), ${Object.keys(ALIASES).length} aliases, ${Object.keys(MOVED).length} moved, 404.html, sitemap.xml, robots.txt`);
