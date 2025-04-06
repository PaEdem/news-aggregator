import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import VueToast from 'vue-toast-notification';
// import 'vue-toast-notification/dist/theme-sugar.css';
import 'vue-toast-notification/dist/theme-default.css';

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(VueToast, {
    position: 'bottom-left',
    duration: 3000,
  })
  .mount('#app');
