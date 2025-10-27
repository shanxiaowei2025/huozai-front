import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置文件
// Vite 是一个现代化的前端构建工具，比 Webpack 更快
export default defineConfig({
  // 注册 Vue 插件，让 Vite 能够处理 .vue 文件
  plugins: [vue()],
  
  // 服务器配置
  server: {
    port: 3000,        // 开发服务器端口号
    open: true,        // 启动时自动打开浏览器
    host: '0.0.0.0'    // 允许局域网访问
  },
  
  // 构建配置
  build: {
    outDir: 'dist',    // 打包输出目录
    assetsDir: 'assets' // 静态资源目录
  }
})

