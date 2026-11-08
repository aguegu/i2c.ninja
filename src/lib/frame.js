// Reactive state written at most once an animation frame: a sensor loop
// hands each reading's values to push(), and they reach Vue (and so every
// view that depends on them) on the next frame, the newest winning. Two
// readings in one frame then cost one update, not two (bench/ and the ?perf
// meter showed a reading's update is most of a slow frame). The readings
// themselves (filters, chart buffers) are still taken every one.
export function perFrame(apply) {
  let pending, has = false, raf = 0;
  return {
    push(v) {
      pending = v;
      has = true;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!has) return;
          has = false;
          apply(pending);
        });
      }
    },
    // drop what's waiting (before a reset, so it can't land after it)
    cancel() {
      cancelAnimationFrame(raf);
      raf = 0;
      has = false;
    },
  };
}
