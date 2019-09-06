<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    name: 'app'
  })
</script>

<style lang="scss">
  body {
    margin: 0px;
    padding: 0px;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;

    #app {
      position: absolute;
      top: 0px;
      bottom: 0px;
      padding: 0 20px;
    }

    .el-input__inner {
      @media (max-width: 768px) {
        width: auto;
      }
    }

    .el-dialog {
      @media (max-width: 768px) {
        width: 80%;
      }
    }

  }
</style>