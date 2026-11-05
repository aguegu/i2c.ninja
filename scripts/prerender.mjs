// After vite build: a page's own HTML for every route (dist/adxl345.html,
// dist/learn/imu/tilt.html, ...), the app's index.html with that page's
// title, description, canonical address and link-preview tags, so GitHub
// Pages answers each address with 200 (not its 404.html) and search engines
// and link previews read the page's own words without running the app. Then
// 404.html (not indexed), sitemap.xml and robots.txt. The pages: lib/pages.js.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, ORIGIN, SITE, fullTitle } from '../src/lib/pages.js';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const ALIASES = { '/mpu6500': '/mpu6050', '/aht21b': '/aht21' }; // the router's aliases: their own files, canonical to the page
const IMAGE = `${ORIGIN}/android-chrome-512x512.png`;
const template = readFileSync(`${DIST}index.html`, 'utf8');

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const once = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not in index.html`);
  return html.replace(pattern, value);
};

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
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${IMAGE}">`,
    '<meta name="twitter:card" content="summary">',
    page.path === '/' && `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE, url: `${ORIGIN}/`, description: page.description })}</script>`,
  ].filter(Boolean).map((t) => `    ${t}\n`).join('');
  return once(html, /<\/head>/, `${tags}  </head>`);
}

function write(file, html) {
  mkdirSync(dirname(DIST + file), { recursive: true });
  writeFileSync(DIST + file, html);
}

const fileOf = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);
for (const page of PAGES) write(fileOf(page.path), render(page));
for (const [alias, path] of Object.entries(ALIASES)) write(fileOf(alias), render(PAGES.find((p) => p.path === path)));
// old addresses: a page that forwards (and names the new one canonical)
const MOVED = { '/setup': '/get-started' };
for (const [from, to] of Object.entries(MOVED)) {
  write(fileOf(from), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | ${SITE}</title><link rel="canonical" href="${ORIGIN}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${ORIGIN}${to}</a></body></html>\n`);
}
write('404.html', render({ path: '/', title: 'Not found', description: 'No page here.' }, { robots: 'noindex' })
  .replace(/<title>[^<]*<\/title>/, `<title>Not found | ${SITE}</title>`)
  .replace(/\s*<link rel="canonical" href="[^"]*">/, '')
  .replace(/\s*<meta property="og:url" content="[^"]*">/, ''));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${ORIGIN}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log(`prerender: ${PAGES.length} pages, ${Object.keys(ALIASES).length} aliases, ${Object.keys(MOVED).length} moved, 404.html, sitemap.xml, robots.txt`);
