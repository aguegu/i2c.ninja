// Whichever time-of-flight sensor is on the bridge, for a page working on its
// distances (/physics/distance): a VL6180X (to about 10 cm, ranging only
// here) or a VL53L1X (to metres, at the page's settings). The VL6180X is
// asked first: its check only reads (and turns a TCS34725 at 0x29 away),
// where the VL53L1X's writes a 16-bit register address a TCS3472 would take
// as a command. One shape out of either: latest { valid, distance mm,
// status (words, when not valid) }, state, failure, rate, source, part.
import { ref, computed } from 'vue';
import { useVl53l1x, STATUS } from './useVl53l1x.js';
import { useVl6180x } from './useVl6180x.js';

const NOTHING_NEAR = ['max convergence', 'no target'];

export function useDistanceSensor({ windowMs = 10000, settings, onValid = null } = {}) {
  const near = useVl6180x({ windowMs, rangeOnly: true, onValid });
  const far = useVl53l1x({ windowMs, settings, onValid });
  const part = ref(null); // 'VL6180X' or 'VL53L1X', once found
  const active = computed(() => (part.value === 'VL53L1X' ? far : near));
  const own = ref(null); // a failure of the wrapper's own: neither answers

  async function connect(via = 'usb') {
    own.value = null;
    part.value = 'VL6180X';
    await near.connect(via);
    if (near.failure.value?.title !== 'No VL6180X answers') return;
    near.failure.value = null;
    part.value = 'VL53L1X';
    await far.connect(via);
    if (far.failure.value?.title !== 'No VL53L1X answers') return;
    far.failure.value = null;
    part.value = null;
    own.value = { title: 'No distance sensor answers', detail: 'Nothing at 0x29 reads as a VL6180X or a VL53L1X: check the four wires (VIN, GND, SCL, SDA) and the module\'s power.', error: '' };
  }

  const latest = computed(() => {
    const r = active.value.latest.value;
    if (!r) return null;
    if (part.value === 'VL6180X') return { valid: r.near, distance: r.mm, status: r.near ? '' : (NOTHING_NEAR.includes(r.error) ? 'nothing in reach' : r.error) };
    return { valid: r.valid, distance: r.distance, status: r.valid ? '' : (STATUS[r.status] ?? `status ${r.status}`) };
  });

  return {
    part,
    state: computed(() => (part.value ? active.value.state.value : near.state.value === 'connecting' || far.state.value === 'connecting' ? 'connecting' : 'idle')),
    failure: computed(() => own.value ?? active.value.failure.value),
    latest,
    rate: computed(() => active.value.rate.value),
    source: computed(() => active.value.source),
    connect,
    disconnect: () => active.value.disconnect(),
  };
}
