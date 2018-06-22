/**
 * Created by lizhong on 2018/3/10.
 */
/* 返回布尔值 */
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ')
  /* 在现有的类名下插入新的类名 */
  newClass.push(className)
  el.className = newClass.join(' ')
}
// 获取data-的属性值
export function getData(el, name, val) {
  let prefix = 'data-' + name
  if (val) {
    return el.setAttribute(prefix, val)
  } else {
    return el.getAttribute(prefix)
  }
}

let elementStyle = document.createElement('div').style
// 函数自执行方式
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== 'undefined') {
      return key
    }
  }
  return false
})()

export function prefixStyle(style) {
  if (!vendor) {
    return false
  }
  if (vendor === 'standard') {
    return style
  }
  // charAt表示第一个字母
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
