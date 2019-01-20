import Vue from 'vue'
import store from './store'
import App from './App.vue'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import drag from './drag'
Vue.use(Element, { size: 'small', zIndex: 3000 });
Vue.config.productionTip = false;
Vue.use(drag);
new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
