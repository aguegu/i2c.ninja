<script setup>
// A term with its explanation in a tooltip of ours (the browser's own, from
// title, keeps long text on one line): wrapped, at most 20rem wide, fixed to
// the viewport (so a scrolling box doesn't clip it), below the term or
// above it where there's no room, kept on screen. Shown on hover, on focus
// (by keyboard, or a tap on a phone) and hidden on leaving, blur or Esc.
import { ref, nextTick } from 'vue';

defineOptions({ inheritAttrs: false });
defineProps({ text: { type: String, required: true } });

const GAP_PX = 6; // between the term and the tooltip
const EDGE_PX = 8; // kept off the viewport's edges
const OFF = { left: '-9999px', top: '0px' }; // drawn there first, to be measured

const term = ref(null);
const tip = ref(null);
const open = ref(false);
const pos = ref(OFF);
const id = `tip-${Math.random().toString(36).slice(2, 9)}`;

async function show() {
  pos.value = OFF;
  open.value = true;
  await nextTick();
  const r = term.value.getBoundingClientRect();
  const w = tip.value.offsetWidth, h = tip.value.offsetHeight;
  const left = Math.min(Math.max(EDGE_PX, r.right - w), innerWidth - w - EDGE_PX);
  const below = r.bottom + GAP_PX;
  const top = below + h > innerHeight - EDGE_PX ? r.top - h - GAP_PX : below;
  pos.value = { left: `${left}px`, top: `${top}px` };
}
const hide = () => { open.value = false; };
</script>

<template>
  <span ref="term" v-bind="$attrs" tabindex="0" :aria-describedby="open ? id : undefined" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide" @keydown.esc="hide"><slot /></span>
  <Teleport to="body">
    <span v-if="open" :id="id" ref="tip" role="tooltip" class="pointer-events-none fixed z-50 max-w-xs rounded-lg bg-slate-800 px-3 py-2 text-left font-sans text-xs leading-relaxed whitespace-normal text-white shadow-lg dark:bg-slate-700" :style="pos">{{ text }}</span>
  </Teleport>
</template>
