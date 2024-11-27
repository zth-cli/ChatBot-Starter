import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import router from './router'
import './assets/index.css'
import App from './App.vue'

createApp(App).use(createHead()).use(router).mount('#app')
