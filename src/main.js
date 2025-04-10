import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'  
import 'element-ui/lib/theme-chalk/index.css'  
import '@fortawesome/fontawesome-free/css/all.css'

import axios from 'axios'

Vue.use(ElementUI)  
Vue.config.productionTip = false
//Vue.prototype.$baseUrl = ''; // 设置全局的baseUrl
Vue.prototype.$baseUrl = 'http://localhost:8090'; // Windows 环境下的值
// 创建事件总线
Vue.prototype.$eventBus = new Vue()

// 设置 axios 默认 baseURL
axios.defaults.baseURL = Vue.prototype.$baseUrl;

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElementUI.Message.error('Token已过期，请重新登录')
          // 清除所有登录信息
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('userRole')
          // 触发登出事件
          Vue.prototype.$eventBus.$emit('logout')
          router.push('/login')
          break
        case 403:
          ElementUI.Message.error('没有权限访问')
          break
        default:
          ElementUI.Message.error(error.response.data || '请求失败')
      }
    } else if (error.request) {
        console.log(error.request)
      ElementUI.Message.error('服务器无响应，请检查网络连接')
    } else {
      ElementUI.Message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
