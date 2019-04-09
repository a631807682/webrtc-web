import Vue from 'vue'
import Router from 'vue-router'
import LiveIndex from '@/views/live/Index'
import LiveCollector from '@/views/live/Collector'
import LiveWatcher from '@/views/live/Watcher'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/index',
      name: '采集监控',
      component: LiveIndex
    }, {
      path: '/collector/:name',
      component: LiveCollector,
      name: '采集端'
    }, {
      path: '/watcher/:name',
      component: LiveWatcher,
      name: '观察端'
    },
    {
      path: '*',
      redirect: { path: '/index' }
    }
  ]
})
