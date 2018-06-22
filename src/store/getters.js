/**
 * Created by lizhong on 2018/3/15.
 */
export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex
// 返回播放列表中当前歌曲的下标
export const currentSong = state => {
  return state.playlist[state.currentIndex]
}

export const disc = state => state.disc
export const toplist = state => state.toplist
export const searchHistory = state => state.searchHistory
export const favoriteList = state => state.favoriteList
// 历史记录列表
export const playHistory = state => state.playHistory
