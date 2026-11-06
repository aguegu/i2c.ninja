import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import { IMU_STEPS } from './views/learn/imuSteps.js';
import { PHYSICS } from './lib/physics.js';
import { ORIGIN, pageFor, fullTitle } from './lib/pages.js';
import { record } from './lib/recent.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/get-started', component: () => import('./views/SetupView.vue') },
    { path: '/setup', redirect: '/get-started' }, // its address before 1.0.27
    { path: '/mpu6050', alias: '/mpu6500', component: () => import('./views/Mpu6050View.vue') },
    { path: '/ina231', component: () => import('./views/Ina231View.vue') },
    { path: '/sht20', component: () => import('./views/Sht20View.vue') },
    { path: '/aht21', alias: '/aht21b', component: () => import('./views/Aht21View.vue') },
    { path: '/max30102', component: () => import('./views/Max30102View.vue') },
    { path: '/vl53l1x', component: () => import('./views/Vl53l1xView.vue') },
    { path: '/mlx90614', component: () => import('./views/Mlx90614View.vue') },
    { path: '/adxl345', component: () => import('./views/Adxl345View.vue') },
    { path: '/hmc5883l', component: () => import('./views/Hmc5883lView.vue') },
    { path: '/itg3200', component: () => import('./views/Itg3200View.vue') },
    { path: '/learn/imu', component: () => import('./views/learn/ImuIndexView.vue') },
    ...IMU_STEPS.filter((s) => s.component).map((s) => ({ path: `/learn/imu/${s.slug}`, component: s.component })),
    ...PHYSICS.filter((p) => p.component).map((p) => ({ path: `/physics/${p.slug}`, component: p.component })),
    { path: '/about', component: () => import('./views/AboutView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') }, // last: an address the site doesn't have
  ],
  scrollBehavior: () => ({ top: 0 }),
});

// each page's title, description and canonical address, as the build writes
// them into its HTML (lib/pages.js); an alias names its page's own address
router.afterEach((to) => {
  // the route's own path; for an alias (/mpu6500), its page's (/mpu6050)
  const own = to.matched[0] ? (to.matched[0].aliasOf ?? to.matched[0]).path : to.path;
  const page = pageFor(own);
  document.title = fullTitle(page);
  document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', ORIGIN + page.path);
  record(own); // a device page: to the recent list (lib/recent.js)
});

export default router;
