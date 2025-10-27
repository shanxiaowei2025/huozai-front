<template>
  <div class="dashboard" ref="dashboardRef" :class="{ 'fullscreen': isFullscreen }">
    <!-- 顶部标题横幅 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <h1 class="header-title">
        <span class="title-icon">📊</span>
        <span class="title-text">定兴县火灾暨高空抛物监控预警</span>
      </h1>
      <div class="header-actions">
        <button class="header-btn" @click="navigateTo('/devices')">
          <span class="btn-icon">📹</span>
          <span>设备管理</span>
        </button>
        <button class="header-btn" @click="navigateTo('/settings')">
          <span class="btn-icon">⚙️</span>
          <span>系统设置</span>
        </button>
      </div>
      <div class="header-datetime">
        <div class="datetime-row">
          <div class="datetime-date">{{ currentDate }}</div>
          <div class="datetime-week">{{ currentWeek }}</div>
        </div>
        <div class="datetime-time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧+中间区域：地图/监控切换 -->
      <div class="left-center-section">
        <!-- 模式切换标签 -->
        <div class="mode-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeMode === 'map' }"
            @click="activeMode = 'map'"
          >
            🗺️ 地图模式
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeMode === 'monitor' }"
            @click="activeMode = 'monitor'"
          >
            📹 监控模式
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="mode-content">
          <!-- 地图模式：显示 GIS 地图 -->
          <div v-show="activeMode === 'map'" class="mode-panel">
            <GisMap />
          </div>

          <!-- 监控模式：显示视频监控墙 -->
          <div v-show="activeMode === 'monitor'" class="mode-panel">
            <VideoWall />
          </div>
        </div>
      </div>

      <!-- 右侧报警列表 -->
      <div class="right-section">
        <AlarmList />
      </div>
    </div>

    <!-- 全屏按钮 -->
    <button class="fullscreen-btn" @click="toggleFullscreen">
      <span v-if="!isFullscreen">🔳 全屏</span>
      <span v-else>🔲 退出</span>
    </button>
  </div>
</template>

<script setup>
// Vue3 的响应式数据，使用 ref 创建
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'

// 导入子组件
import GisMap from '../components/GisMap.vue'
import VideoWall from '../components/VideoWall.vue'
import AlarmList from '../components/AlarmList.vue'

// 路由导航
const router = useRouter()

// 定义响应式数据：是否全屏
const isFullscreen = ref(false)
const dashboardRef = ref(null)

// 定义响应式数据：当前模式（地图/监控）
const activeMode = ref('map') // 默认显示地图模式

// 定义响应式数据：实时时间
const currentDate = ref('')
const currentTime = ref('')
const currentWeek = ref('')
let timeInterval = null

// 共享报警数据 - 用于在子组件间传递
const sharedAlarms = ref([])

// 提供报警数据给子组件
provide('alarmData', {
  alarms: sharedAlarms,
  updateAlarms: (newAlarms) => {
    sharedAlarms.value = newAlarms
  }
})

// 切换全屏功能
const toggleFullscreen = () => {
  // 获取 dashboard 元素
  const element = dashboardRef.value
  
  if (!isFullscreen.value) {
    // 进入全屏
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      // Safari 浏览器
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      // Firefox 浏览器
      element.mozRequestFullScreen()
    }
    isFullscreen.value = true
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    }
    isFullscreen.value = false
  }
}

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path)
}

// 更新时间函数
const updateTime = () => {
  const now = new Date()
  
  // 格式化日期：2025-10-27
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
  
  // 格式化时间：14:32:15
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  // 格式化星期：星期一
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentWeek.value = weeks[now.getDay()]
}

// 监听全屏状态变化（用户按 ESC 退出全屏）
onMounted(() => {
  // 初始化时间
  updateTime()
  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000)
  
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  document.addEventListener('webkitfullscreenchange', () => {
    isFullscreen.value = !!document.webkitFullscreenElement
  })
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* 大屏容器 */
.dashboard {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

/* 全屏状态 */
.dashboard.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  padding: 20px;
}

/* 顶部标题横幅 */
.page-header {
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(10, 14, 39, 0.6);
  border: 1px solid rgba(0, 246, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 246, 255, 0.2);
}

/* 标题背景动画 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(6, 182, 212, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 25%,
    rgba(236, 72, 153, 0.1) 50%,
    rgba(139, 92, 246, 0.1) 75%,
    rgba(6, 182, 212, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: headerGlow 8s linear infinite;
}

@keyframes headerGlow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

/* 标题文字 */
.header-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 246, 255, 0.5);
}

.title-icon {
  font-size: 42px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.title-text {
  background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  font-weight: 900;
}

/* 头部操作按钮区域 */
.header-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
  margin-right: 30px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

.header-btn:hover {
  background: rgba(6, 182, 212, 0.25);
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.header-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 18px;
}

/* 右侧时间显示 */
.header-datetime {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: #fff;
}

.datetime-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.datetime-date {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
}

.datetime-week {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
}

.datetime-time {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #00f6ff 0%, #06b6d4 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Courier New', 'Monaco', monospace;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  line-height: 1;
}

/* 主内容区域 */
.main-content {
  flex: 1; /* 占据剩余空间 */
  display: grid;
  grid-template-columns: 3fr 1fr; /* 左侧+中间(合并):右侧 = 3:1 */
  gap: 20px;
  min-height: 0; /* 防止内容溢出 */
}

/* 左侧+中间合并区域 */
.left-center-section {
  background: rgba(10, 14, 39, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 模式切换标签栏 */
.mode-tabs {
  display: flex;
  gap: 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.2);
}

/* 标签按钮 */
.tab-btn {
  flex: 1;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid rgba(0, 246, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 5px;
}

.tab-btn:hover {
  background: rgba(0, 246, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 246, 255, 0.5);
}

/* 激活状态的标签 */
.tab-btn.active {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border-color: #06b6d4;
  color: white;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

/* 内容区域 */
.mode-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 模式面板 */
.mode-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 右侧区域 */
.right-section {
  background: rgba(10, 14, 39, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
}

/* 全屏按钮 */
.fullscreen-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border: 2px solid #06b6d4;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
  z-index: 1000;
}

.fullscreen-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
}

.fullscreen-btn:active {
  transform: translateY(0);
}

/* 全屏状态下隐藏全屏按钮 */
.dashboard.fullscreen .fullscreen-btn {
  display: none;
}

/* 响应式设计：小屏幕适配 */
@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
  
  .mode-tabs {
    flex-direction: column;
    gap: 10px;
  }
  
  .tab-btn {
    margin: 0;
  }
}
</style>

