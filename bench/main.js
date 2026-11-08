// The bench: not part of the site (vite.config.js builds index.html only);
// built by bench/vite.config.js, measured by bench/measure.mjs
import { createApp } from 'vue';
import './bench.css';
import BenchViews from './BenchViews.vue';

createApp(BenchViews).mount('#app');
