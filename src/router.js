import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/setup', component: () => import('./views/SetupView.vue') },
    { path: '/mpu6050', alias: '/mpu6500', component: () => import('./views/Mpu6050View.vue') },
    { path: '/about', component: () => import('./views/AboutView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
