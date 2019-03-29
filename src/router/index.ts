import Vue from 'vue'
import Router from 'vue-router'
import LiveIndex from '@/views/live/Index'
import LiveCollector from '@/views/live/Collector'
import LiveWatcher from '@/views/live/Watcher'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '播放',
      component: LiveIndex,
      children: [
        { path: 'collector', component: LiveCollector, name: '采集端' },
        { path: 'watcher', component: LiveWatcher, name: '观察端' }
      ]
    }
  ]
})
