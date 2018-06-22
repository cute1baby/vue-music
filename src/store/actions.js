import * as types from './mutation-types'
import {playMode} from './config'
import {setRandom} from '../common/js/utils'
import {saveSearch, clearHistory, saveFavorite, deleteFavorite, saveplayHistory} from '../common/js/cache'
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
/* actions函数中可以传两个参数:一个是state,一个是playload */
export function selectPlay({commit, state}, {list, index}) {
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULLSCREEN, true)
  if (state.mode === playMode.mode) {
    let randomList = setRandom(list)
    commit(types.SET_PLAYLIST, randomList)
    // 返回当前歌曲播放的下标,如果是随机播放，那么当修改成随机列表之后对应的下标也要随着修改
    index = findIndex(list, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_SEQUENCELIST, list)
  commit(types.SET_CURRENTINDEX, index)
}
export function randomPlay({commit}, {list}) {
  // 设置mode值的变化
  commit(types.SET_MODE, playMode.random)
  commit(types.SET_SEQUENCELIST, list)
  let randomList = setRandom(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULLSCREEN, true)
  // 这个起始指一定要去设置
  commit(types.SET_CURRENTINDEX, 0)
}
export function insertSong({commit, state}, song) {
  // 上面两个变量是引用类型的变量,如果不进行复制一份的话会修改原来state中的值
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否存在当前歌曲，且返回索引
  let fpIndex = findIndex(playlist, song)
  // 插入歌曲，所以索引值加1
  currentIndex++
  // 在当前列表的前提下增加一首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果存在这首歌曲
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      // 当前的下标在重复下标值的前面，（删除重复值，且下标减）
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      // 当前的下标在重复下标值的前面，（删除重复值，且下标减）
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_SEQUENCELIST, sequenceList)
  commit(types.SET_CURRENTINDEX, currentIndex)
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_PLAYING, true)
  commit(types.SET_FULLSCREEN, true)
}
export function saveSearchHistory({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
export function clearSearchHistory({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearHistory())
}
export function deleteSong({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 只有删除当前播放歌曲前面的歌曲才会让currentIndex减少。
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  commit(types.SET_SEQUENCELIST, sequenceList)
  commit(types.SET_CURRENTINDEX, currentIndex)
  commit(types.SET_PLAYLIST, playlist)
  /* 这一段代码可以换成下面这样
  if (!playlist.length) {
    commit(types.SET_PLAYING, false)
  } else {
    // 当列表中还有歌曲的时候就需要切换后直接播放
    commit(types.SET_PLAYING, true)
  } */
  let playlistState = playlist.length > 0
  commit(types.SET_PLAYING, playlistState)
}
export function deleteSongList({commit}) {
  commit(types.SET_SEQUENCELIST, [])
  commit(types.SET_CURRENTINDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_PLAYING, false)
}
export function saveFavoriteList({commit}, song) {
  commit(types.SET_FAVIRATE_LIST, saveFavorite(song))
}
export function deleteFavoriteList({commit}, song) {
  commit(types.SET_FAVIRATE_LIST, deleteFavorite(song))
}
export function saveHistoryList({commit}, song) {
  commit(types.SET_HISTORY_LIST, saveplayHistory(song))
}
