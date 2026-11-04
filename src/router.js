import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/setup', component: () => import('./views/SetupView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
