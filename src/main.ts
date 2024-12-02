import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import pinia from './store'
import router from './router'
import './assets/index.css'
import App from './App.vue'

createApp(App).use(pinia).use(createHead()).use(router).mount('#app')
