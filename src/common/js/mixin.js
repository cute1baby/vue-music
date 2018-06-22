/**
 * Created by lizhong on 2018/3/30.
 */
import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from '../../store/config'
import {setRandom} from './utils'
// 解决底部的mini播放器的问题
export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
// 解决playlist.vue和player.vue某些逻辑复用的问题
export const playerMixin = {
  computed: {
    ...mapGetters(['sequenceList', 'currentSong', 'mode', 'playlist', 'favoriteList']),
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    ...mapMutations({
      set_mode: 'SET_MODE',
      setCurrentIndex: 'SET_CURRENTINDEX',
      set_playlist: 'SET_PLAYLIST'
    }),
    ...mapActions(['saveFavoriteList', 'deleteFavoriteList']),
    changeMode() {
      const modeNum = (this.mode + 1) % 3
      this.set_mode(modeNum)
      let list = null
      if (this.mode === playMode.random) {
        list = setRandom(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 将当前的index在列表顺序改变之后仍然重置为原来的currentSong
      this.resetlist(list)
      // 重新设置列表的顺序
      this.set_playlist(list)
    },
    resetlist(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      // 设置当前的修改后的index
      this.setCurrentIndex(index)
    },
    isFavorite(song) {
      // 判断当且歌曲是否在最喜爱列表中,返回布尔值
      const index = this.favoriteList.findIndex((item) => {
        return song.id === item.id
      })
      return index > -1
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    }
  }
}
