// A chart's buffers kept by a page: times and n series, the last windowMs
// (plus a second) kept, read by LiveChart through source()
const SLACK_MS = 1000;

export function makeSeries(n, windowMs) {
  const t = [];
  const ys = Array.from({ length: n }, () => []);
  return {
    push(now, values) {
      t.push(now);
      values.forEach((v, k) => ys[k].push(v));
      let old = 0;
      while (old < t.length && t[old] < now - windowMs - SLACK_MS) old++;
      if (old) {
        t.splice(0, old);
        for (const y of ys) y.splice(0, old);
      }
    },
    clear() {
      t.length = 0;
      for (const y of ys) y.length = 0;
    },
    source: () => ({ t, ys }),
  };
}
