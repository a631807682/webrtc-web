declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '@/components/*' {
  import Vue from 'vue'
  const value: Vue.ComponentOptions<Vue>
  export default value
}

declare module '@/views/*' {
  import Vue from 'vue'
  const value: Vue.ComponentOptions<Vue>
  export default value
}
