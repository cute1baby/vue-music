/*
playing: false  // 当前的播放状态
fullScreen: false // 播放器展开或者收起
playlist: []   // 播放列表
sequenceList: []  // 顺序播放，在config.js中可以设置
mode: playMode.sequence  //playMode.sequence在配置文件中设置，设置模式的状态
currentIndex: -1   // 当前播放的索引，默认设置为-1
*/
import {playMode} from './config'
import {loadSearch, loadFavorite, loadPlay} from '../common/js/cache'
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  toplist: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}
export default state
