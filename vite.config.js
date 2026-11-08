import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { appendFileSync } from 'node:fs';

// the timing meter's numbers (?perf, components/PerfMeter), posted by the
// page to the dev or preview server it came from, appended a JSON line each
// to PERF_LOG, so they can be read off the machine running the server
const PERF_LOG = process.env.PERF_LOG || '/tmp/i2cn-perf.log';
function perfLog(req, res, next) {
  if (req.url !== '/__perf' || req.method !== 'POST') return next();
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    appendFileSync(PERF_LOG, `${JSON.stringify({ at: new Date().toISOString(), ...JSON.parse(body || '{}') })}\n`);
    res.statusCode = 204;
    res.end();
  });
}
const perfLogPlugin = {
  name: 'perf-log',
  configureServer: (server) => { server.middlewares.use(perfLog); },
  configurePreviewServer: (server) => { server.middlewares.use(perfLog); },
};

export default defineConfig({
  plugins: [vue(), tailwindcss(), perfLogPlugin],
});
