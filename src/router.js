import { aliasesOf } from './lib/aliases.js';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import { MOVED } from './lib/moved.js';
import { PHYSICS } from './lib/physics.js';
import { ALGORITHMS } from './lib/algorithms.js';
import { ORIGIN, pageFor, fullTitle } from './lib/pages.js';
import { record } from './lib/recent.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/get-started', component: () => import('./views/SetupView.vue') },
    { path: '/blog', component: () => import('./views/BlogView.vue') },
    { path: '/blog/:slug', component: () => import('./views/BlogPostView.vue') },
    { path: '/devices', component: () => import('./views/DevicesView.vue') },
    { path: '/mpu6050', alias: aliasesOf('/mpu6050'), component: () => import('./views/Mpu6050View.vue') },
    { path: '/ina231', component: () => import('./views/Ina231View.vue') },
    { path: '/sht20', component: () => import('./views/Sht20View.vue') },
    { path: '/aht21', alias: aliasesOf('/aht21'), component: () => import('./views/Aht21View.vue') },
    { path: '/spl06', alias: aliasesOf('/spl06'), component: () => import('./views/Spl06View.vue') },
    { path: '/bh1745', alias: aliasesOf('/bh1745'), component: () => import('./views/Bh1745View.vue') },
    { path: '/sht3x', alias: aliasesOf('/sht3x'), component: () => import('./views/Sht3xView.vue') },
    { path: '/max30102', component: () => import('./views/Max30102View.vue') },
    { path: '/vl53l1x', component: () => import('./views/Vl53l1xView.vue') },
    { path: '/mlx90614', component: () => import('./views/Mlx90614View.vue') },
    { path: '/adxl345', component: () => import('./views/Adxl345View.vue') },
    { path: '/hmc5883l', component: () => import('./views/Hmc5883lView.vue') },
    { path: '/itg3200', component: () => import('./views/Itg3200View.vue') },
    { path: '/physics', component: () => import('./views/physics/IndexView.vue') },
    { path: '/learn', component: () => import('./views/learn/LearnView.vue') },
    ...Object.entries(MOVED).map(([path, to]) => ({ path, redirect: to })), // old addresses, before the course's
    { path: '/learn/:slug', component: () => import('./views/learn/CourseView.vue') },
    ...PHYSICS.filter((p) => p.component).map((p) => ({ path: `/physics/${p.slug}`, component: p.component })),
    ...ALGORITHMS.filter((p) => p.component).map((p) => ({ path: `/algorithms/${p.slug}`, component: p.component })),
    { path: '/bridges', component: () => import('./views/DonglesView.vue') },
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
