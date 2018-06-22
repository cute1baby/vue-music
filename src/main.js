import 'babel-polyfill' // 解决es6的API补丁问题
import  ig.productionTip = false
Vue.use(VueLazyload)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
