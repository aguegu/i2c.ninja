// Frame times of the live views in headless Chromium, the CPU throttled to
// stand in for older computers (CDP Emulation.setCPUThrottlingRate): the
// bench (bench/BenchViews.vue, the Attitude page's views fed a made-up motion)
// and the home page (its swaying board). Per page and rate: frames a
// second, the frame-time median and 95th/99th percentiles, frames over
// 33 ms, and the main thread's script, layout and style time a second.
//
// Serve the site's dist/ with bench/dist/ as its bench/, then
//   node measure.mjs http://localhost:8765 [seconds]
// BENCH_RATES=4 (the rates, comma-separated), BENCH_GROUPS=1 (the bench's
// groups one at a time)
// (puppeteer-core beside it; Chromium at /usr/bin/chromium)
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:8765';
const SECONDS = Number(process.argv[3]) || 10;
const WARM_MS = 2000;
const JANK_MS = 33.4; // two frames at 60 Hz
// name, path, viewport height; BENCH_GROUPS=1: each group of the bench alone
const GROUPS = ['charts', 'gauges', 'box', 'flat', 'board', 'ball'];
const PAGES = process.env.BENCH_GROUPS
  ? GROUPS.map((g) => [g, `/bench/?only=${g}`, 2600])
  : [['bench', '/bench/', 2600], ['home', '/', 900]];
const RATES = (process.env.BENCH_RATES || '1,4,6').split(',').map(Number);

const pct = (a, p) => a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))];
const metric = (m, name) => m.metrics.find((x) => x.name === name).value;

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
console.log(`page   rate   fps   p50ms  p95ms  p99ms  >33ms  script/s  layout/s  style/s`);
for (const [name, path, height] of PAGES) {
  for (const rate of RATES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height });
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await cdp.send('Performance.enable');
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 120000 });
    await new Promise((r) => setTimeout(r, WARM_MS));
    const m0 = await cdp.send('Performance.getMetrics');
    const gaps = await page.evaluate((ms) => new Promise((resolve) => {
      const out = [];
      let last = performance.now();
      const end = last + ms;
      const step = (t) => {
        out.push(t - last);
        last = t;
        if (t < end) requestAnimationFrame(step); else resolve(out);
      };
      requestAnimationFrame(step);
    }), SECONDS * 1000);
    const m1 = await cdp.send('Performance.getMetrics');
    const per = (n) => ((metric(m1, n) - metric(m0, n)) / SECONDS * 1000).toFixed(0);
    const sorted = [...gaps].sort((a, b) => a - b);
    const fps = (gaps.length / SECONDS).toFixed(1);
    const jank = gaps.filter((g) => g > JANK_MS).length;
    console.log(`${name.padEnd(6)} ${String(rate).padStart(2)}x  ${fps.padStart(5)}  ${pct(sorted, 50).toFixed(1).padStart(5)}  ${pct(sorted, 95).toFixed(1).padStart(5)}  ${pct(sorted, 99).toFixed(1).padStart(5)}  ${String(jank).padStart(5)}  ${per('ScriptDuration').padStart(6)}ms  ${per('LayoutDuration').padStart(6)}ms  ${per('RecalcStyleDuration').padStart(5)}ms`);
    await page.close();
  }
}
await browser.close();
