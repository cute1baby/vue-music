<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
      @touchstart.prevent="progressTouchStart"
      @touchmove.prevent="progressTouchMove"
      @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>
<script>
 import {prefixStyle} from '../../common/js/dom'
 const progressBtnWidth = 16
 const transform = prefixStyle('transform')
export default{
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    // 单向的监听当音乐进度发生变化的时候控制样式小球跟着变化
    percent(newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 宽度偏移量
        const offsetWidth = this.newPercent * barWidth
        // 进度条的宽度等于小球的偏移量
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this._offset(offsetWidth)
      }
    }
  },
  created() {
    // 组件的实例创建已经完成，属性已经绑定，但是DOM还没有完成。所以在这里初始化一个共同的对象，会在多个函数中使用到。
    this.touch = {}
  },
  methods: {
    progressTouchStart(e) {
      // 定义一个标识位initiated,表示初始化已经完成
      this.touch.initiated = true
      // 获取手指停留的位置的值
      this.touch.startX = e.touches[0].pageX
      // 获取小圆点偏移的值
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove(e) {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      if (!this.touch.initiated) {
          return
      }
      // 计算得到进度条滑动的值
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 滑动后最后偏移的距离
      const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
    },
    progressTouchEnd(e) {
      this.touch.initiated = false
      this._triggerPercent()
    },
    progressClick(e) {
      // 获取progressBar的宽度高度和位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 这里当我们点击progressBtn的时候，e.offsetX获取不对
      // this._offset(e.offsetX)
      this._triggerPercent()
    },
    _offset(offsetWidth) {
      // 进度条的宽度等于小球的偏移量
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    },
    _triggerPercent() {
        // 整个滚动条的宽度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percentNum = this.$refs.progress.clientWidth / barWidth
      // 向外部派发事件，将滑动百分比传给音乐播放器内部使用
      this.$emit('percentChange', percentNum)
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
