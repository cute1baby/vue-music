/**
 * Created by lizhong on 2018/3/24.
 */
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
export function setRandom(list) {
  // 让着两个数据的栈地址不一样，两者之间不会相互干扰.相当于是创建的一个副本
  let _arr = list.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = randomNum(0, i)
    let d = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = d
  }
  return _arr
}

export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
