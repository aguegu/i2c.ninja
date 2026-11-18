// An element taken full screen and back. Where the browser has the Fullscreen
// API (desktop Chromium) it uses it — true full screen, Esc leaves. Where it
// doesn't (iOS / iPadOS WebKit, so Bluefy on iPhone and iPad), it falls back to
// a fixed overlay that fills the viewport, so the button still works there.
// `full` follows either path.
import { ref, onMounted, onBeforeUnmount } from 'vue';

const native = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);
// the button shows wherever we can do it — native full screen or the overlay
export const canFullscreen = typeof document !== 'undefined';

export function useFullscreen(el) {
  const full = ref(false);

  // the fallback: the element fixed over the whole viewport (its own full-state
  // classes then fill it); cleared on exit so the page isn't left covered
  function overlay(on) {
    const s = el.value?.style;
    if (!s) return;
    s.position = on ? 'fixed' : '';
    s.inset = on ? '0' : '';
    s.zIndex = on ? '50' : '';
  }

  const onChange = () => { if (native) full.value = document.fullscreenElement === el.value; };
  const onKey = (e) => { if (e.key === 'Escape' && !native && full.value) { full.value = false; overlay(false); } };

  function toggle() {
    if (native) {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.value?.requestFullscreen();
    } else {
      full.value = !full.value;
      overlay(full.value);
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onChange);
    document.removeEventListener('keydown', onKey);
    if (!native) overlay(false);
  });
  return { full, toggle };
}
