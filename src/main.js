import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router.js';
import { registerServiceWorker } from './lib/pwa.js';

createApp(App).use(router).mount('#app');
registerServiceWorker();
