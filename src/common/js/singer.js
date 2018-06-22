/**
 * Created by lizhong on 2018/3/13.
 */
export default class Singer {
  // 父级继承函数，定义一个父级的类
  constructor({id, name}) {
    this.id = id
    this.name = name
    this.avator = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}
