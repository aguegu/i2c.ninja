// Reactive state written at most once an animation frame: a sensor loop
// hands each reading's values to push(), and they reach Vue (and so every
// view that depends on them) on the next frame, the newest winning. Two
// readings in one frame then cost one update, not two. The readings
// themselves (filters, chart buffers) are still taken every one.
//
// And the frames adapt: when frames run long (the machine can't draw every
// view every 16.7 ms), the views update on every second frame, or every
// third, all on the same frames, so the motion stays even at 30 or 20 a
// second instead of stuttering; back to every frame once frames are short
// again for a while. frameDue() tells a view with its own loop (LiveChart)
// whether this frame is one of them.

// ?every: every reading straight to Vue, as before, to measure the
// difference (bench/live.mjs)
const EVERY = typeof location !== 'undefined' && new URLSearchParams(location.search).has('every');

const SLOW_MS = 25; // a smoothed frame time over this: every second frame
const SLOWER_MS = 45; // over this: every third
const FAST_MS = 18; // under this for FAST_HOLD_MS: every frame again
const FAST_HOLD_MS = 2000;
const SMOOTHING = 0.1; // the smoothed frame time's weight on each new frame

let stride = 1; // update the views every stride-th frame
let frameNo = 0;
let smooth = 16.7;
let fastSince = 0;
let watching = false;

function watchFrames() {
  if (watching || typeof requestAnimationFrame === 'undefined') return;
  watching = true;
  let last = 0;
  const step = (t) => {
    if (last) {
      smooth += (Math.min(t - last, 200) - smooth) * SMOOTHING;
      frameNo++;
      if (smooth > SLOWER_MS) { stride = 3; fastSince = 0; }
      else if (smooth > SLOW_MS) { stride = Math.max(stride, 2); fastSince = 0; }
      else if (smooth < FAST_MS) {
        fastSince ||= t;
        if (t - fastSince > FAST_HOLD_MS) stride = 1;
      } else fastSince = 0;
    }
    last = t;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// this frame is one the views update on
export const frameDue = () => stride === 1 || frameNo % stride === 0;
// for the meter: the views' cadence now, 1 (every frame), 2 or 3
export const cadence = () => stride;

export function perFrame(apply) {
  let pending, has = false, raf = 0;
  watchFrames();
  const fire = () => {
    raf = 0;
    if (!has) return;
    if (!frameDue()) { raf = requestAnimationFrame(fire); return; }
    has = false;
    apply(pending);
  };
  return {
    push(v) {
      if (EVERY) { apply(v); return; }
      pending = v;
      has = true;
      if (!raf) raf = requestAnimationFrame(fire);
    },
    // drop what's waiting (before a reset, so it can't land after it)
    cancel() {
      cancelAnimationFrame(raf);
      raf = 0;
      has = false;
    },
  };
}
