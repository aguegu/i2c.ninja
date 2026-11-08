// The real Attitude page, live, without hardware: headless Chromium opens it
// with the fake dongle (?fake=kid: shaken hard; lib/fakeDongle.js) and the
// meter (?perf), presses Connect, then measures it twice, at the top and
// scrolled down to the gauges and the glass box: frames a second, frame
// times, dropped frames, readings a second, and the slow frames' anatomy
// (Long Animation Frames: script, style and layout, render).
//
// Serve the built site (npx vite preview --port 4173), then
//   node live.mjs http://localhost:4173 [seconds] [extra query, e.g. every]
// BENCH_RATES (1,4), BENCH_GPU=1 as measure.mjs; puppeteer-core beside it
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:4173';
const SECONDS = Number(process.argv[3]) || 8;
const EXTRA = process.argv[4] ? `&${process.argv[4]}` : '';
const MOTION = process.env.BENCH_MOTION || 'kid';
// BENCH_PATH=/mpu6050: another live page, measured whole in one tall window
const PATH = process.env.BENCH_PATH || '/algorithms/attitude';
const OTHER = PATH !== '/algorithms/attitude';
const RATES = (process.env.BENCH_RATES || '1,4').split(',').map(Number);
const GPU = process.env.BENCH_GPU ? ['--enable-gpu', '--use-angle=gles-egl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : [];
const JANK_MS = 33.4;
const pct = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))] ?? 0;

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', ...GPU] });
console.log(`${PATH}  motion ${MOTION}${EXTRA}  ${GPU.length ? 'GPU raster' : 'software raster'}`);
console.log('where     rate   fps  p50ms  p95ms  worst  >33ms  readings/s  updates/s  upd p95  upd max  slow: n  script  style  render ms (means)');
// BENCH_HIDE=1: the page once whole, then without each part in turn
// (FusionViews' ?hide=), measured at the top and at the gauges together
// (one tall window), to see what each part costs live
const HIDES = process.env.BENCH_HIDE ? ['', 'numbers', 'math', 'charts', 'gauges', 'box', 'flat'] : [null];
for (const hide of HIDES) {
if (hide !== null) console.log(`-- hide: ${hide || '(nothing)'}`);
for (const rate of RATES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: hide !== null || OTHER ? 4000 : 900 }); // hiding, or another page: all of it on screen at once
  const cdp = await page.createCDPSession();
  // networkidle and a moment: the page is prerendered, its first button a
  // static copy until the app takes it over
  await page.goto(`${BASE}${PATH}?perf&fake=${MOTION}${EXTRA}${hide ? `&hide=${hide}` : ''}`, { waitUntil: 'networkidle0', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 1500));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const button = await page.waitForSelector('xpath/.//button[contains(., "Connect")]');
  await button.click();
  await page.waitForFunction(() => (window.i2cnPerf?.readings.length ?? 0) > 20, { timeout: 60000 });
  for (const [where, find] of hide !== null || OTHER ? [['page', null]] : [['top', null], ['gauges', 'The result, as a pilot reads it']]) {
    if (find) await page.evaluate((t) => [...document.querySelectorAll('h2,h3,p')].find((e) => e.textContent.includes(t))?.scrollIntoView({ block: 'start' }), find);
    await new Promise((r) => setTimeout(r, 1500));
    const r = await page.evaluate((ms) => new Promise((resolve) => {
      const gaps = [], slow = [];
      const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) slow.push({ ms: e.duration, script: e.scripts.reduce((n, x) => n + x.duration, 0), style: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0, render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0 }); });
      obs.observe({ type: 'long-animation-frame' });
      const t0 = performance.now();
      let last = t0;
      const step = (t) => { gaps.push(t - last); last = t; if (t - t0 < ms) requestAnimationFrame(step); else { obs.disconnect(); const ups = window.i2cnPerf.updates.filter((x) => x >= t0); const ug = ups.slice(1).map((x, i) => x - ups[i]).sort((a, b) => a - b); resolve({ gaps, slow, reads: window.i2cnPerf.readings.filter((x) => x >= t0).length, ups: ups.length, ug }); } };
      requestAnimationFrame(step);
    }), SECONDS * 1000);
    const s = [...r.gaps].sort((a, b) => a - b);
    const mean = (k) => (r.slow.length ? r.slow.reduce((n, x) => n + x[k], 0) / r.slow.length : 0).toFixed(0);
    console.log(`${where.padEnd(8)} ${String(rate).padStart(2)}x  ${(r.gaps.length / SECONDS).toFixed(1).padStart(5)}  ${pct(s, 0.5).toFixed(1).padStart(5)}  ${pct(s, 0.95).toFixed(1).padStart(5)}  ${s.at(-1).toFixed(1).padStart(5)}  ${String(r.gaps.filter((g) => g > JANK_MS).length).padStart(5)}  ${(r.reads / SECONDS).toFixed(1).padStart(10)}  ${(r.ups / SECONDS).toFixed(1).padStart(9)}  ${pct(r.ug, 0.95).toFixed(1).padStart(7)}  ${(r.ug.at(-1) ?? 0).toFixed(1).padStart(7)}  ${String(r.slow.length).padStart(7)}  ${mean('script').padStart(6)}  ${mean('style').padStart(5)}  ${mean('render').padStart(6)}`);
  }
  await page.close();
}
}
await browser.close();
