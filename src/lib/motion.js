// From distances in time to speed and acceleration: a straight line fitted
// to the last few readings (its slope the speed), a parabola to a few more
// (twice its x² term the acceleration), each by least squares, at the
// window's middle. Fitting several readings, not two, keeps the noise from
// being blown up: a derivative from neighbours divides the readings' noise
// by a short time, once for speed, twice for acceleration.

// least squares through (t, y), degree 1 or 2, t taken from its middle
// (tm): { tm, c: [c0, c1, c2] } for y = c0 + c1 (t - tm) + c2 (t - tm)²
export function fitPolynomial(ts, ys, degree) {
  const n = ts.length;
  if (n < degree + 1) return null;
  const tm = (ts[0] + ts[n - 1]) / 2;
  const k = degree + 1;
  // the normal equations: sums of t^(i+j) and of y t^i
  const s = new Array(2 * degree + 1).fill(0);
  const b = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    const t = ts[i] - tm;
    let p = 1;
    for (let j = 0; j <= 2 * degree; j++) {
      s[j] += p;
      if (j < k) b[j] += ys[i] * p;
      p *= t;
    }
  }
  const m = Array.from({ length: k }, (_, r) => [...s.slice(r, r + k), b[r]]);
  // Gauss-Jordan, partial pivoting
  for (let col = 0; col < k; col++) {
    let piv = col;
    for (let r = col + 1; r < k; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    if (Math.abs(m[piv][col]) < 1e-12) return null;
    [m[col], m[piv]] = [m[piv], m[col]];
    for (let r = 0; r < k; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let c = col; c <= k; c++) m[r][c] -= f * m[col][c];
    }
  }
  const c = m.map((row, r) => row[k] / row[r]);
  while (c.length < 3) c.push(0);
  return { tm, c };
}

// the readings kept and the derivatives from them: push(t ms, x mm) with
// each valid reading; speed (m/s) from the last speedPoints readings,
// acceleration (m/s²) from the last accelPoints, each at its window's
// middle time, or null until enough readings
export function makeMotion({ speedPoints = 5, accelPoints = 9 } = {}) {
  const ts = [];
  const xs = [];
  const keep = Math.max(speedPoints, accelPoints);
  return {
    push(t, x) {
      ts.push(t / 1000); // s
      xs.push(x / 1000); // m
      if (ts.length > keep) { ts.shift(); xs.shift(); }
      const last = (n) => [ts.slice(-n), xs.slice(-n)];
      const v = ts.length >= speedPoints ? fitPolynomial(...last(speedPoints), 1) : null;
      const a = ts.length >= accelPoints ? fitPolynomial(...last(accelPoints), 2) : null;
      return {
        speed: v && { t: v.tm * 1000, v: v.c[1] },
        acceleration: a && { t: a.tm * 1000, a: 2 * a.c[2] },
      };
    },
    clear() {
      ts.length = 0;
      xs.length = 0;
    },
  };
}
