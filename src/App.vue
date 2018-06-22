<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--将请求的数据都缓存到内存中，避免多次请求-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from './components/m-header/m-header'
import Tab from './components/tab/tab'
import Player from './components/player/player'
export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "./common/stylus/variable.styl"
#app
  color :$color-theme
</style>
