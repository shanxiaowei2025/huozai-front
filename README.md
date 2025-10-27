# 🖥️ 智能监控大屏展示系统

一个基于 Vue3 + Vite 的现代化监控大屏展示项目，包含 GIS 地图、视频监控、实时报警等功能。

## ✨ 功能特点

### 📊 顶部统计模块
- 今日报警总数
- 处置率统计
- 设备在线率
- 总摄像机数量

### 🗺️ GIS 地图监控
- 显示所有摄像头点位分布
- 不同状态颜色标识（正常/预警/报警）
- 点击查看详情
- 报警点位脉冲提示

### 📹 视频监控墙
- 支持 9/16/25 分屏切换
- 报警视频自动高亮
- 视频点击选中
- 实时状态显示

### 📋 实时报警列表
- 按时间倒序排列
- 不同报警类型图标
- 状态跟踪（未处置/处置中/已处置）
- 一键派单功能

### 🖥️ 全屏展示
- 右下角全屏按钮
- 支持 ESC 退出
- 响应式布局适配

---

## 🚀 快速开始

### 1. 安装依赖

首先确保你已经安装了 Node.js（建议 v16 以上版本）。

在项目根目录打开终端，运行：

\`\`\`bash
npm install
\`\`\`

**说明**：
- `npm install` 会根据 `package.json` 文件安装所有需要的依赖包
- 这个过程可能需要 1-3 分钟，取决于网络速度

### 2. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

**说明**：
- Vite 会启动一个本地开发服务器
- 默认地址：http://localhost:3000
- 浏览器会自动打开
- 修改代码后页面会自动刷新（热更新）

### 3. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

**说明**：
- 生成的文件在 `dist` 目录
- 可以部署到任何静态服务器

---

## 📁 项目结构

\`\`\`
daping/
├── index.html              # 入口 HTML 文件
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 构建配置
├── README.md               # 项目说明文档
└── src/
    ├── main.js             # Vue 应用入口
    ├── App.vue             # 根组件
    ├── style.css           # 全局样式
    ├── views/
    │   └── Dashboard.vue   # 大屏主页面
    └── components/
        ├── StatCard.vue    # 统计卡片组件
        ├── GisMap.vue      # GIS 地图组件
        ├── VideoWall.vue   # 视频监控墙组件
        └── AlarmList.vue   # 报警列表组件
\`\`\`

---

## 🎨 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.3.4 | 渐进式 JavaScript 框架 |
| Vite | 5.0.0 | 下一代前端构建工具 |
| ECharts | 5.4.3 | 数据可视化图表库 |
| Leaflet | 1.9.4 | 开源地图库 |
| Video.js | 8.6.1 | HTML5 视频播放器 |
| Axios | 1.6.0 | HTTP 请求库 |

**全部免费开源！**

---

## 🎯 核心概念讲解

### 1. Vue3 组合式 API (`<script setup>`)

这是 Vue3 的新语法，让代码更简洁：

\`\`\`vue
<script setup>
import { ref } from 'vue'

// ref 创建响应式数据
const count = ref(0)

// 函数直接定义
const increment = () => {
  count.value++
}
</script>
\`\`\`

### 2. 响应式数据 (ref)

\`\`\`javascript
const isFullscreen = ref(false)  // 创建响应式变量
isFullscreen.value = true        // 修改值需要 .value
\`\`\`

### 3. 组件通信 (Props)

父组件传数据给子组件：

\`\`\`vue
<!-- 父组件 -->
<StatCard title="今日报警" :value="23" />

<!-- 子组件接收 -->
<script setup>
const props = defineProps({
  title: String,
  value: Number
})
</script>
\`\`\`

### 4. 事件处理 (@click)

\`\`\`vue
<button @click="handleClick">点击</button>

<script setup>
const handleClick = () => {
  alert('按钮被点击了！')
}
</script>
\`\`\`

---

## 🔧 常见问题

### Q1: 如何修改端口号？

在 `vite.config.js` 中修改：

\`\`\`javascript
server: {
  port: 8080  // 改成你想要的端口
}
\`\`\`

### Q2: 如何连接真实数据接口？

1. 在 `src` 目录创建 `api` 文件夹
2. 使用 axios 请求数据：

\`\`\`javascript
import axios from 'axios'

export const getAlarms = async () => {
  const response = await axios.get('/api/alarms')
  return response.data
}
\`\`\`

### Q3: 如何集成真实地图？

将 `GisMap.vue` 中的 SVG 替换为 Leaflet 地图：

\`\`\`javascript
import L from 'leaflet'

const map = L.map(mapContainer.value).setView([31.23, 121.47], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
\`\`\`

### Q4: 如何播放真实视频流？

使用 Video.js + FLV.js 播放 RTMP/HLS 流：

\`\`\`javascript
import videojs from 'video.js'
import 'videojs-flvjs'

const player = videojs('video-player', {
  sources: [{
    src: 'http://your-stream-url.flv',
    type: 'video/x-flv'
  }]
})
\`\`\`

---

## 🎓 学习建议

### 初学者学习路径：

1. **理解项目结构**（10分钟）
   - 看懂每个文件的作用
   - 了解组件之间的关系

2. **修改样式练习**（30分钟）
   - 改变卡片颜色
   - 调整布局间距
   - 修改字体大小

3. **添加新功能**（1小时）
   - 添加一个新的统计卡片
   - 在地图上增加一个摄像头点位
   - 在报警列表添加一条数据

4. **学习 Vue3 核心概念**（持续）
   - ref 和 reactive
   - computed 计算属性
   - watch 监听器
   - 生命周期钩子

### 推荐资源：
- Vue3 官方文档：https://cn.vuejs.org/
- Vite 官方文档：https://cn.vitejs.dev/
- ECharts 示例：https://echarts.apache.org/examples/zh/

---

## 📝 下一步优化建议

- [ ] 接入真实 API 数据
- [ ] 集成高德/百度地图
- [ ] 实现视频实时播放
- [ ] 添加数据定时刷新
- [ ] 实现 WebSocket 推送
- [ ] 添加用户登录功能
- [ ] 优化移动端适配
- [ ] 添加数据导出功能

---

## 💡 遇到问题？

1. 查看浏览器控制台错误信息
2. 检查是否正确安装依赖 (`npm install`)
3. 确认 Node.js 版本 >= 16
4. 清除缓存重新运行 (`npm run dev`)

---

## 📄 许可证

MIT License - 可自由使用和修改

---

**祝你学习愉快！有问题随时提问！** 🎉

