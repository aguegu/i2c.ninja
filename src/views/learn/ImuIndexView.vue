<script setup>
import { IMU_STEPS } from './imuSteps.js';

const card = 'rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800';
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-4 p-4">
    <div class="mt-2">
      <h1 class="text-2xl font-bold">Learn the IMU</h1>
      <p class="mt-1 max-w-3xl leading-relaxed text-slate-500 dark:text-slate-400">
        An MPU-6050 or MPU-6500 in your hand, its readings live, one idea a step: from the bytes the chip sends to the
        loop that keeps a quadcopter level. These chips sat in many a low-cost flight controller; the maths here is the
        same.
      </p>
    </div>
    <ol class="flex flex-col gap-3">
      <li v-for="(s, i) in IMU_STEPS" :key="s.slug" :class="card">
        <RouterLink v-if="s.component" :to="`/learn/imu/${s.slug}`" class="group flex flex-col gap-1">
          <span class="font-semibold group-hover:text-emerald-600">{{ i + 1 }}. {{ s.title }}</span>
          <span class="text-slate-500 dark:text-slate-400">{{ s.blurb }}</span>
        </RouterLink>
        <div v-else class="flex flex-col gap-1 opacity-60">
          <span class="font-semibold">{{ i + 1 }}. {{ s.title }} <span class="text-sm font-normal">· to come</span></span>
          <span class="text-slate-500 dark:text-slate-400">{{ s.blurb }}</span>
        </div>
      </li>
    </ol>
  </main>
</template>
