import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import '@/assets/css/global.css'
// 导入TreeTable
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入 Nprogress
import nProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 导入 axios
import axios from 'axios'
Vue.prototype.$http = axios
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// request拦截器
axios.interceptors.request.use(config => {
  nProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// response拦截器
axios.interceptors.response.use(config => {
  nProgress.done()
  return config
})
// 使用TreeTable
Vue.component('tree-table', TreeTable)
// 使用QuillEditor
Vue.use(VueQuillEditor)
// 转换时间格式
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
