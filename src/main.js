// Vue 应用的入口文件
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载到 #app 元素上
app.mount('#app')

