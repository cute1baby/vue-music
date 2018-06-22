/**
 * Created by lizhong on 2018/4/16.
 */
import Storage from 'good-storage'
const SEARCH_KEY = '_search_'
const SEARCH_MAX_LENGTH = 15

const FAVORITE_KEY = '_favorite_'
const FAVORITE_MAX_LENGTH = 200

const HISTORY_KEY = '_history_'
const HISTORY_MAX_LENGTH = 200
// 用于搜索组件中的历史记录的存储
/**
 * arr:是当前的存储在历史记录中的那个数组
 * val：在搜索框中搜索的数值，也是需要添加到数组中的那个值
 * compare：比较函数，判断该值是否存在于数组中
 * maxLen：历史记录中允许存储的最大长度值
 * **/
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  // 如果搜索的值在数组中的第一位
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 将搜索框中的值插入到数组中
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    // 在arr中存在compare，则删除该项
    arr.splice(index, 1)
  }
}
export function saveSearch(query) {
  // 在本地存储中获取存储的值
  let searches = Storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    // 判断输入的值是否跟数组中的值相等
    return item === query
  }, SEARCH_MAX_LENGTH)
  // 将新的数组值存入到本地存储中
  Storage.set(SEARCH_KEY, searches)
  return searches
}
export function loadSearch() {
  return Storage.get(SEARCH_KEY, [])
}
export function clearHistory() {
  Storage.remove(SEARCH_KEY)
  return []
}
export function saveFavorite(song) {
  // 获取本地存储的值，如果没有则显示空数组
  let songs = Storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    // 判断输入的值是否跟数组中的值相等
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  Storage.set(FAVORITE_KEY, songs)
  return songs
}
export function deleteFavorite(song) {
  let songs = Storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    // 判断输入的值是否跟数组中的值相等
    return song.id === item.id
  })
  // 将新的数组值存入到本地存储中
  Storage.set(FAVORITE_KEY, songs)
  return songs
}
export function loadFavorite() {
  let songs = Storage.get(FAVORITE_KEY, [])
  return songs
}
// 保存播放历史列表
export function saveplayHistory(song) {
  const songs = Storage.get(HISTORY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, HISTORY_MAX_LENGTH)
  Storage.set(HISTORY_KEY, songs)
  return songs
}
// 初始状态下的历史记录列表
export function loadPlay() {
  const songs = Storage.get(HISTORY_KEY, [])
  return songs
}
