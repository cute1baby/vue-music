<template>
    <transition name="slide">
      <music-list :title="title" :bg-image="bgImage" :songs="playlist"></music-list>
    </transition>
</template>
<script>
import MusicList from '../music-list/music-list'
import {getSongList} from '../../api/recommend'
import {ERR_OK} from '../../api/config'
import {mapGetters} from 'vuex'
export default{
  created() {
    this._getSongList()
  },
  methods: {
    _getSongList() {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
            debugger
          // console.log(res.cdlist[0])
          console.log(res)
        }
      })
    }
  },
  computed: {
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    },
    ...mapGetters(['disc', 'playlist'])
  },
  components: {
    MusicList
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
