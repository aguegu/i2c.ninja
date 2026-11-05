// The header's light/dark switch: the device's setting until it's used, then
// the pick, kept in localStorage and set as data-theme on <html> (style.css
// and index.html's early script read it).
import { ref, onBeforeUnmount } from 'vue';

const KEY = 'theme';

export function useTheme() {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const effective = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && media.matches);
  const dark = ref(effective());

  function toggle() {
    const next = dark.value ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: the pick lasts this visit
    }
    dark.value = effective();
  }

  const onMedia = () => { dark.value = effective(); };
  media.addEventListener('change', onMedia);
  onBeforeUnmount(() => media.removeEventListener('change', onMedia));

  return { dark, toggle };
}
