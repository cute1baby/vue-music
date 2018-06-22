<template>
  <div class="player" v-if="playlist.length > 0">
    <!--平铺时候的-->
    <transition name="normal"
              @enter="enter"
              @after-enter="afterEnter"
              @leave="leave"
              @after-leave="afterLeave"
      >
      <div class="normal-player" v-if="fullScreen">
      <div class="background">
        <img width="100%" height="100%" :src="currentSong.image">
      </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle"
           @touchstart.prevent="middleTouchStart"
           @touchmove.prevent="middleTouchMove"
           @touchend="middleTouchEnd"
      >
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdCls">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
               <p ref="lyricLine"
                 class="text" :class="{'current': currentLineNum === index}"
                  v-for="(line,index) in currentLyric.lines" :key="index">{{line.txt}}</p>
            </div>
          </div>
        </scroll>
      </div>
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active': currentShow==='cd'}"></span>
          <span class="dot" :class="{'active': currentShow==='lyric'}"></span>
        </div>
        <div class="progress-wrapper">
        <span class="time time-l">{{formatime(currentTime)}}</span>
        <div class="progress-bar-wrapper">
          <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
        </div>
        <span class="time time-r">{{formatime(currentSong.duration)}}</span>
      </div>
      <div class="operators">
        <div class="icon i-left">
          <i :class="iconMode" @click="changeMode"></i>
        </div>
        <div class="icon i-left">
          <i class="icon-prev" @click="prev" :class="disabledCls"></i>
        </div>
        <div class="icon i-center">
          <i :class="playIcon" @click="togglePlay"></i>
        </div>
        <div class="icon i-right">
          <i class="icon-next" @click="next" :class="disabledCls"></i>
        </div>
        <div class="icon i-right">
          <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
        </div>
      </div>
  </div>
  </div>
  </transition>
  <!--收起后的播放器-->
  <transition name="mini">
    <div class="mini-player" v-if="!fullScreen" @click="open">
      <div class="icon">
        <img width="40" height="40" :src="currentSong.image" :class="cdCls">
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
        <progress-circle :radius="radius" :percent="percent">
          <i :class="miniIcon" class="icon-mini" @click.stop="togglePlay"></i>
        </progress-circle>
      </div>
      <div class="control" @click="playListshow">
        <i class="icon-playlist" ></i>
      </div>
    </div>
    </transition>
     <playlist ref="playlist"></playlist>
    <!-- 只有让歌曲ready之后才可以点击下一首,否则不行 -->
    <audio src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="updatetime"  ended="end"></audio>
  </div>
</template>
<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  // CD唱片从上面掉下来的位置插件
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from '../../common/js/dom'
  import Scroll from '../../base/scroll/scroll'
  import progressBar from '../../base/progress-bar/progress-bar'
  import progressCircle from '../../base/progress-circle/progress-circle'
  import {playMode} from '../../store/config'
  import playlist from '../playlist/playlist'
  // lyric-parser这个包是用来解析歌词用的，这里的new Lyric(lyricStr, handler)是包定义的一个
  // 通用方法,并且这里的handler带的参数都是定好的。
  import Lyrics from 'lyric-parser'
  import {playerMixin} from '../../common/js/mixin'
  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  export default{
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ]),
      playIcon() {
         return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      disabledCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      playListshow() {
        this.$refs.playlist.show()
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        // x方向和y方向的偏移区间值都是大于0的值
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        // 如果y方向的偏移大于x轴方向的偏移时候,选择Y向上的偏移,在这里就是什么也不做[取绝对值]
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 因为向左移动到歌词页面的时候其实是一个负数值
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const width = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.persent = Math.abs(width / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.persent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        let width
        let persent
        if (this.currentShow === 'cd') {
          if (this.touch.persent > 0.1) {
            width = -window.innerWidth
            this.currentShow = 'lyric'
            persent = 0
          } else {
            width = 0
            persent = 1
          }
        } else {
          if (this.touch.persent < 0.9) {
            width = 0
            persent = 1
            this.currentShow = 'cd'
          } else {
            width = -window.innerWidth
            persent = 0
          }
        }
        this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`
        // 設置500ms的动画时长
        this.$refs.lyricList.$el.style[transitionDuration] = 500
        this.$refs.middleL.style.opacity = persent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent
        // 歌曲不能播放的原因导致音乐无法播放
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlay()
        }
        if (this.currentLyric) {
          // 偏移到歌曲的开始
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      back() {
        this.set_full_screen(false)
      },
      open() {
        this.set_full_screen(true)
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
             transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
             transform: `translate3d(0,0,0) scale(1.4)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1.0)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('tansitionEnd', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        // 目标物宽度
        const targetWidth = 40
        // 目标中心点离上面的距离
        const paddingLeft = 40
        // 目标中心到底部的距离
        const paddingBottom = 30
        // 当前唱片边缘距离顶部的距离
        const paddingTop = 80
        // CD容器的宽度和高度的值
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        // 偏移的x轴值和y轴的值
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlay() {
        this.setPlaying(!this.playing)
      },
      end() {
        if (this.mode === playMode.loop) {
          // 当歌曲为单曲循环的时候，执行loop函数
          this.loop()
        } else {
          // 当歌曲结束之后自动跳转到下一首
          this.next()
        }
      },
      loop() {
        // 将当前的播放时间设置为0
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
            // 偏移到歌曲的开始
            this.currentLyric.seek(0)
        }
      },
      prev() {
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          // 当只有一首歌曲的时候进行单曲播放
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlay()
          }
        }
        this.songReady = false
      },
      next() {
          // 如果歌曲标识songReady不是true时切换无效
         if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlay()
          }
        }
        this.songReady = false
      },
      ready() {
        // 歌曲在ready之后才能正常播放,用一个标识位来确定
        this.songReady = true
        this.saveHistoryList(this.currentSong)
      },
      error() {
        // 歌曲在找不到url源或者读取失败的时候同样让标识位设置为true的状态
        this.songReady = true
      },
      updatetime(e) {
        this.currentTime = e.target.currentTime
      },
      formatime(interval) {
        // 类似于向下取整的写法
        interval = interval | 0
        const minutes = interval / 60 | 0
        const seconds = this._pad(interval % 60)
        return `${minutes}:${seconds}`
      },
      _pad(num, n = 2) {
        // 往前补0的算法
        let len = num.toString().length
         for (let i = len; i < n; i++) {
          num = '0' + num
        }
        /* while (len < n) {
          num = '0' + num
          len++
        } */
        return num
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          // 获取歌词对象
          this.currentLyric = new Lyrics(lyric, this.handleLyric)
          if (this.playing) {
            this.$refs.audio.play()
          }
          console.log(this.currentLyric)
        }).catch(() => {
            this.currentLyric = null
            this.playingLyric = ''
            this.currentLineNum = 0
        })
      },
      handleLyric(lineNum, txt) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
           let lineEl = this.$refs.lyricLine(lineNum - 5)
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      ...mapMutations({
        set_full_screen: 'SET_FULLSCREEN',
        setPlaying: 'SET_PLAYING'
      }),
      ...mapActions(['saveHistoryList'])
    },
    watch: {
        // 监听当前歌曲的变化，自动播放
      currentSong(newVal, oldVal) {
        if (!newVal.id) {
            return
        }
        // 个人添加的逻辑(在列表点击进入选中的歌曲的时候只有newVal而没有oldVal)
        /* if (!oldVal) {
          return
        } */
        // 在改变播放列表的时候,那么当前的currentSong就会发生改变，也会触发这个监听值。
        if (oldVal) {
          if (newVal.id === oldVal.id) {
            return
          }
        }
        // 当当前节点加载完成之后再去执行播放的函数
        /* this.$nextTick(() => {
          this.$refs.audio.play()
          this.getLyric()
        }) */
        setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      // 监听playing值的变化
      playing(newPlaying) {
        this.$nextTick(() => {
          newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause()
        })
      }
    },
    components: {
      Scroll,
      progressBar,
      playlist,
      progressCircle
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
