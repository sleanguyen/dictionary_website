import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/axios';
import clickOutside from './directives/clickOutside';

const app = createApp(App);
app.directive('click-outside', clickOutside);
app.use(router).mount('#app');