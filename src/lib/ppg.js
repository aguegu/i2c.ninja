// A photoplethysmogram (PPG) worked out: the light a fingertip returns,
// split into its slow level (DC: the tissue, the bone, the blood that stays)
// and the ripple each heartbeat adds (AC: the blood each beat pushes in,
// which absorbs a little more). The beats are the ripple's peaks.
const DC_WINDOW_S = 1.5; // the slow level: a moving average over a beat or two
const SMOOTH_S = 0.1; // the ripple smoothed of sample noise
const MIN_BEAT_S = 0.33; // beats closer than this aren't (under 180 a minute)
const BEATS_FOR_RATE = 6; // the rate from the last few beats' spacing

// a centred moving average, n samples wide
function average(xs, n) {
  const half = n >> 1, out = new Array(xs.length);
  let sum = 0, from = 0, to = -1;
  for (let i = 0; i < xs.length; i++) {
    while (to < Math.min(xs.length - 1, i + half)) sum += xs[++to];
    while (from < i - half) sum -= xs[from++];
    out[i] = sum / (to - from + 1);
  }
  return out;
}

// samples: the last seconds of one channel at rate a second -> { dc, ac }
// (ac flipped: more blood, less light, a peak up)
export function split(samples, rate) {
  const dc = average(samples, Math.round(rate * DC_WINDOW_S));
  const smooth = average(samples, Math.max(1, Math.round(rate * SMOOTH_S)));
  return { dc, ac: smooth.map((v, i) => dc[i] - v) };
}

// the beats in a ripple: the indices of its peaks above zero, at least
// MIN_BEAT_S apart
export function beats(ac, rate) {
  const out = [];
  for (let i = 1; i < ac.length - 1; i++) {
    if (ac[i] > 0 && ac[i] >= ac[i - 1] && ac[i] > ac[i + 1] && (!out.length || i - out.at(-1) > rate * MIN_BEAT_S)) out.push(i);
  }
  return out;
}

// beats a minute from the spacing of the last few beats (null: too few)
export function heartRate(peaks, rate) {
  const last = peaks.slice(-BEATS_FOR_RATE);
  if (last.length < 3) return null;
  const gaps = last.slice(1).map((p, i) => (p - last[i]) / rate).sort((a, b) => a - b);
  return 60 / gaps[gaps.length >> 1];
}

// the "ratio of ratios" pulse oximeters start from: red's ripple over its
// level, against IR's. Oxygen-rich blood absorbs less red, so R falls as
// saturation rises; turning R into a percentage takes a calibrated curve
export function ratioOfRatios(red, ir) {
  const amp = (ac) => Math.max(...ac) - Math.min(...ac);
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const rIr = amp(ir.ac) / mean(ir.dc);
  return rIr ? (amp(red.ac) / mean(red.dc)) / rIr : null;
}
