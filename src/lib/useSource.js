// A physics page's live reading of one quantity: useSources() with one
// kind, its reading as plain [x, y, z].
import { computed } from 'vue';
import { useSources } from './useSources.js';

const KEY = 'value';

export function useSource(kind, options) {
  const s = useSources({ [KEY]: kind }, options);
  return {
    ...s,
    latest: computed(() => s.latest.value?.[KEY] ?? null),
    source: s.sources[KEY],
    // fn(t ms, [x, y, z]) on each reading
    onReading: (fn) => s.onReading((t, v) => fn(t, v[KEY])),
  };
}
