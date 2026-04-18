import './assets/main.css'
import '@vue-flow/core/dist/style.css'
import './assets/css/font-awesome.min.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './queryClient'
import type { Router } from 'vue-router';

import App from './App.vue'
import router from './router'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router;
  }
}

const app = createApp(App)
const pinia = createPinia();

pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.use(VueQueryPlugin, {
  queryClient,
})
app.use(pinia)
app.use(router)

app.mount('#app')
