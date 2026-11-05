import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import { IMU_STEPS } from './views/learn/imuSteps.js';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/setup', component: () => import('./views/SetupView.vue') },
    { path: '/mpu6050', alias: '/mpu6500', component: () => import('./views/Mpu6050View.vue') },
    { path: '/ina231', component: () => import('./views/Ina231View.vue') },
    { path: '/learn/imu', component: () => import('./views/learn/ImuIndexView.vue') },
    ...IMU_STEPS.filter((s) => s.component).map((s) => ({ path: `/learn/imu/${s.slug}`, component: s.component })),
    { path: '/about', component: () => import('./views/AboutView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
