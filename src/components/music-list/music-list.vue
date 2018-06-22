<template>
  <div class="music-list">
    <div class="back" @click="backToList">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgImageset" ref="bgImg">
      <div class="play-wrapper">
        <div class="play" ref="playBtn" v-if="songs.length > 0" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer">

    </div>
    <scroll @scroll='scroll'
            :probe-type='probeType'
            :listen-scroll='listenScroll'
            :data="songs"
            class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div v-if="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>
<script>
import Scroll from '../../base/scroll/scroll'
import Loading from '../../base/loading/loading'
import songList from '../../base/song-list/song-list'
import {prefixStyle} from '../../common/js/dom'
import {playlistMixin} from '../../common/js/mixin'
import {mapActions} from 'vuex'
// 设置最小的预留量
const reserveHeight = 40
// 自动识别浏览器生产厂商，自动生成style的样式
const transform = prefixStyle('transform')
export default{
  mixins: [playlistMixin],
  data() {
    return {
      scrollY: 0
    }
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    bgImageset() {
      return `backgroundImage:url(${this.bgImage})`
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted () {
    this.imgHeight = this.$refs.bgImg.clientHeight
    this.minTranslateY = -this.imgHeight + reserveHeight
    this.$refs.list.$el.style.top = `${this.imgHeight}px`
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    backToList() {
      this.$router.back()
    },
    random() {
      this.randomPlay({
        list: this.songs
      })
    },
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    ...mapActions(['selectPlay', 'randomPlay'])
  },
  watch: {
    scrollY(newY) {
      let translateY = Math.max(this.minTranslateY, newY)
      let zIndex = 0
      let scale = 1
      let persent = Math.abs(newY / this.imgHeight)
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      // this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`
      // 表示向下滑动的时候,此时图片开始放大
      if (newY > 0) {
        scale = 1 + persent
        zIndex = 10
      }
      // 当滚动距离超过最小高度时【因为这个值是负数，所以加上符号之后就是相反的方向】
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs.bgImg.style.paddingTop = 0
        this.$refs.bgImg.style.height = `${reserveHeight}px`
        // 当高度大于最顶部的位置的时候，此时按钮隐藏
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImg.style.paddingTop = `70%`
        this.$refs.bgImg.style.height = 0
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImg.style.zIndex = zIndex
      this.$refs.bgImg.style[transform] = `scale(${scale})`
      // this.$refs.bgImg.style['webkitTransform'] = `scale(${scale})`
    }
  },
  components: {
    songList,
    Scroll,
    Loading
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
