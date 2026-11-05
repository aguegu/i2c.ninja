// An element taken full screen and back (the Fullscreen API, where the
// browser has it; Esc leaves too): full follows the browser's state.
import { ref, onMounted, onBeforeUnmount } from 'vue';

export const canFullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

export function useFullscreen(el) {
  const full = ref(false);
  const onChange = () => { full.value = document.fullscreenElement === el.value; };
  function toggle() {
    if (document.fullscreenElement) document.exitFullscreen();
    else el.value?.requestFullscreen();
  }
  onMounted(() => document.addEventListener('fullscreenchange', onChange));
  onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onChange));
  return { full, toggle };
}
