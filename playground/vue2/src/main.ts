import { castToVueI18n } from '@intlify/vue-i18n-bridge'
import Vue from 'vue'

import App from './App.vue'
import i18n from './i18n'
import { createRouter } from './router'

import './assets/main.css'

const router = createRouter(i18n)

Vue.use(i18n)

const app = new Vue({
  router,
  i18n: castToVueI18n(i18n),
  render: h => h(App)
})

app.$mount('#app')
