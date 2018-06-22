<template>
  <div class="singer" ref="singer">
    <listview @selectSinger="selectSinger" :data="singers" ref="list"></listview>
    <router-view></router-view>
  </div>
</template>
<script>
  import {ERR_OK} from '../../api/config'
  import {getSingerList} from '../../api/singer'
  import Singer from '../../common/js/singer'
  import Listview from '../../base/listview/listview'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from '../../common/js/mixin'
  export default{
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      ...mapMutations({
        setsinger: 'SET_SINGER'
      }),
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            // 模拟歌手列表数据延迟出现，loading的表演
            setTimeout(() => {
              this.singers = this.setDataStyle(res.data.list)
            }, 200)
          }
        })
      },
      setDataStyle(list) {
        // 获取热门的数据
        let map = {
          hot: {
            title: '热门',
            items: []
          }
        }
        list.forEach((item, index) => {
          // debugger
          // 把前面的是10个数据插入到数组中
          if (index < 10) {
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }

          // 获取字母数据的列表
          let key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
            map[key].items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
        })

        // 为了得到有序列表，我们需要处理 map
        let ret = []
        let hot = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === '热门') {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // 使用vuex保存歌手
        this.setsinger(singer)
      }
    },
    components: {
      Listview
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
