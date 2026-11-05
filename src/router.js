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
    { path: '/sht20', component: () => import('./views/Sht20View.vue') },
    { path: '/aht21', alias: '/aht21b', component: () => import('./views/Aht21View.vue') },
    { path: '/max30102', component: () => import('./views/Max30102View.vue') },
    { path: '/vl53l1x', component: () => import('./views/Vl53l1xView.vue') },
    { path: '/mlx90614', component: () => import('./views/Mlx90614View.vue') },
    { path: '/adxl345', component: () => import('./views/Adxl345View.vue') },
    { path: '/hmc5883l', component: () => import('./views/Hmc5883lView.vue') },
    { path: '/learn/imu', component: () => import('./views/learn/ImuIndexView.vue') },
    ...IMU_STEPS.filter((s) => s.component).map((s) => ({ path: `/learn/imu/${s.slug}`, component: s.component })),
    { path: '/about', component: () => import('./views/AboutView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
