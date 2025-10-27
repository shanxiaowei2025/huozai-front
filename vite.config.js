import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Vite 配置文件
// Vite 是一个现代化的前端构建工具，比 Webpack 更快
export default defineConfig({
  // 注册 Vue 插件，让 Vite 能够处理 .vue 文件
  plugins: [vue()],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  // 服务器配置
  server: {
    port: 3000,        // 开发服务器端口号
    open: false,       // 启动时自动打开浏览器（macOS上可能有兼容性问题，建议手动打开）
    host: '0.0.0.0',   // 允许局域网访问
    allowedHosts: [    // 允许的域名列表
      'huozai.zhongyuekuaiji.cn',
      'localhost',
      '127.0.0.1'
    ]
  },
  
  // 构建配置
  build: {
    outDir: 'dist',    // 打包输出目录
    assetsDir: 'assets' // 静态资源目录
  }
})

