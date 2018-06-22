<template>
  <scroll class="listview"
          :data="data"
          :probe-type="probeType"
          ref="listview"
          :listenScroll="listenScroll"
          @scroll="scroll">
    <!--左边栏-->
    <ul>
      <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" v-for="(item,index) in group.items" :key="index">
            <img class="avatar" v-lazy="item.avator" alt="歌手头像">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--右边栏-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
        <li v-for="(item, index) in shortcutList"
            :data-index="index"
            class="item"
            :class="{'current':currentIndex === index}"
            :key="index">{{item}}

        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-if="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script>
  import Scroll from '../scroll/scroll'
  import Loading from '../loading/loading'
  import {getData} from '../../common/js/dom'
  // 18是右侧每一个字母的高度
  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30
  export default{
    created() {
      /* 这里创建一个变量的目的是在onShortcutTouchStart和onShortcutTouchMove中都要用到
       相同的一些变量值，所以就把他们存储到一个对象中，这些变量作为这个对象的属性。 */
      this.probeType = 3
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    props: {
      data: {
        type: Array,
        default: null
      }
    },
    methods: {
      refresh() {
        this.$refs.listview.refresh()
      },
      onShortcutTouchStart(e) {
        // 获取data-index的属性值
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anotherIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anotherIndex) + delta
        this._scrollTo(anchorIndex)
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        // 在头部以上scroll值为整数的时候
        if (index < 0) {
          index = 0
          // 超出了底部以下的部分
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        console.log(this.listHeight)
        this.scrollY = -(this.listHeight[index])
        // 滚到当前的第index项中
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      selectItem(item) {
        // 派发事件，告知被点击
        this.$emit('selectSinger', item)
      }
    },
    watch: {
      data () {
        // 当data数据发生变化的时候...
        this.$nextTick(() => {
          this._calculateHeight()
        })
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 滚动到中间位置
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newval) {
        // 最后一个在顶部动画产生的效果，没有太明白
        let fixedTop = (newval > 0 && newval < TITLE_HEIGHT) ? newval - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((item) => {
          return item.title.substring(0, 1)
        })
      },
      fixedTitle() {
        // 显示当前是以哪个歌手开头的区间
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
