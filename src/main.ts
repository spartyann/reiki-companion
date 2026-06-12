import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { createApp } from 'vue';
import App from './App.vue';
import './scss/bootstrap.scss';
import './scss/main.scss';

defineCustomElements(window);

createApp(App).mount('#app');
