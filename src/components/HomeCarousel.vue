<script setup>
// The home page's carousel: one idea a slide, each with its page's drawing,
// a line and a link to the page. It moves on every INTERVAL_MS, but not
// while the pointer is over it or a slide's link has focus, nor at all when
// the system asks for reduced motion; prev / next and the dots move it too.
import { ref, onMounted, onBeforeUnmount } from 'vue';

const SLIDES = [
  { to: '/itg3200', img: '/itg3200-coriolis.svg', title: 'The Coriolis push in a gyro', text: 'A tiny mass is kept shaking; turn the chip and it is pushed sideways. That push is how a gyro feels a turn.', device: 'ITG-3200 gyroscope' },
  { to: '/hmc5883l', img: '/earth-field-dip.svg', title: 'Earth\'s field dips into the ground', text: 'Only near the magnetic equator does it lie level. A compass uses its level part; the rest shows up on z.', device: 'HMC5883L magnetometer' },
  { to: '/adxl345', img: '/adxl345-mass-springs.svg', title: 'Why a still accelerometer reads 1 g up', text: 'The springs hold its mass up against gravity. Falling, nothing holds it, and it reads zero.', device: 'ADXL345 accelerometer' },
  { to: '/vl53l1x', img: '/time-of-flight.svg', title: 'A ruler made of light', text: 'It times a pulse of light to the target and back: a metre away, the echo returns in under seven nanoseconds.', device: 'VL53L1X distance sensor' },
  { to: '/max30102', img: '/ppg-sensing.svg', title: 'A heartbeat in a fingertip', text: 'Red and infrared light through the finger: each beat swells the blood in it, and the light dips.', device: 'MAX30102 pulse sensor' },
  { to: '/mlx90614', img: '/mlx90614-view.svg', title: 'Reading heat without touching', text: 'Everything warm glows in infrared. It reads the average over everything in its view.', device: 'MLX90614 infrared thermometer' },
];
const INTERVAL_MS = 6000;

const at = ref(0);
let timer = 0;
let held = false; // the pointer over it, or a link focused
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const go = (i) => { at.value = (i + SLIDES.length) % SLIDES.length; };
function tick() { if (!held) go(at.value + 1); }
const hold = (v) => { held = v; };

onMounted(() => { if (!reduced) timer = setInterval(tick, INTERVAL_MS); });
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <section class="relative overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800" aria-roledescription="carousel" aria-label="What the pages show" @mouseenter="hold(true)" @mouseleave="hold(false)" @focusin="hold(true)" @focusout="hold(false)">
    <div class="flex transition-transform duration-500 ease-out motion-reduce:transition-none" :style="{ transform: `translateX(-${at * 100}%)` }">
      <div v-for="(s, i) in SLIDES" :key="s.to" class="grid w-full shrink-0 items-center gap-4 p-4 md:grid-cols-[3fr_2fr] md:p-6" role="group" aria-roledescription="slide" :aria-label="`${i + 1} of ${SLIDES.length}: ${s.title}`" :aria-hidden="i !== at">
        <img :src="s.img" :alt="s.title" class="w-full rounded-lg bg-white dark:bg-transparent" loading="lazy">
        <div>
          <p class="text-xs font-medium tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{{ s.device }}</p>
          <h2 class="mt-1 text-xl font-semibold">{{ s.title }}</h2>
          <p class="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{{ s.text }}</p>
          <RouterLink :to="s.to" :tabindex="i === at ? 0 : -1" class="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">See it live</RouterLink>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center gap-3 pb-4">
      <button type="button" class="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700" aria-label="Previous slide" @click="go(at - 1)">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5l-5 5 5 5" /></svg>
      </button>
      <button v-for="(s, i) in SLIDES" :key="s.to" type="button" class="h-2.5 rounded-full transition-all" :class="i === at ? 'w-6 bg-emerald-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'" :aria-label="`Slide ${i + 1}: ${s.title}`" :aria-current="i === at" @click="go(i)" />
      <button type="button" class="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700" aria-label="Next slide" @click="go(at + 1)">
        <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5l5 5-5 5" /></svg>
      </button>
    </div>
  </section>
</template>
