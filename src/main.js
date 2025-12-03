import { createApp } from 'vue';
import App from './App.vue';
import router from './router'
import { createPinia } from 'pinia'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app');

//console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)