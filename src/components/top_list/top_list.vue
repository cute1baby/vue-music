<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>
<script>
  import MusicList from '../music-list/music-list'
  import {getMusicList} from '../../api/rank'
  import {ERR_OK} from '../../api/config'
  import {mapGetters} from 'vuex'
  import {createSong} from '../../common/js/song'
  export default{
    created() {
      this._getMusicList()
    },
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    computed: {
      title() {
        return this.toplist.topTitle
      },
      bgImage() {
        if (this.songs.length > 0) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters(['toplist'])
    },
    methods: {
      _getMusicList() {
        if (!this.toplist.id) {
          this.$router.push('/rank')
          return
        }
        const id = this.$route.params.id
        getMusicList(id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSong(res.songlist)
            console.log(this.songs)
          }
        })
      },
      _normalizeSong(list) {
        const ret = []
        list.forEach((item) => {
          const data = item.data
          if (data.albummid && data.songid) {
            ret.push(createSong(data))
          }
        })
        return ret
      }
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
