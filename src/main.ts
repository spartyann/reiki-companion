import { defineCustomElements } from '@ionic/pwa-elements/loader'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './scss/bootstrap.scss'
import './scss/main.scss'

defineCustomElements(window)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
