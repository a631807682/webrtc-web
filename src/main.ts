// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import App from '@/App.vue'
import router from '@/router'
import 'element-ui/lib/theme-chalk/index.css'
import 'webrtc-adapter'

Vue.config.productionTip = false
Vue.use(ElementUI)
/* tslint:disable:no-unused-expression */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
/* tslint:enable:no-unused-expression */
