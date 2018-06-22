<template>
  <transition name="slide">
   <!-- <div class="singer-detail"></div>-->
    <music-list :bg-image="bgImage" :songs="songs" :title="title"></music-list>
  </transition>
</template>
<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from '../../api/singer'
  import {ERR_OK} from '../../api/config'
  import {createSong} from '../../common/js/song'
  import musicList from '../music-list/music-list'
  export default{
    data () {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
      console.log(this.singer)
    },
    computed: {
      bgImage() {
       return this.singer.avator
      },
      title() {
       return this.singer.name
      },
      ...mapGetters([
          // 从singer.vue中跳转过来拿到的，通过vuex拿到的（非父子组件）
          'singer'
      ])
    },
    methods: {
      _getDetail() {
        // 如果发现不存在当前的id，那么就回退到歌手列表页面
        if (!this.singer.id) {
          this.$router.push({
            path: '/singer'
          })
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
            console.log(this.songs)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      musicList
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  .slider-enter-active, .slider-leave-slider {
    transition: all 0.5s
  }

  .slider-enter, .slider-leave-to {
    transform: translate3d(100%, 0, 0)
  }

  .singer-detail {
    position: fixed
    z-index: 100
    top: 0
    right: 0
    bottom: 0
    left: 0
    background: $color-background
  }
</style>
