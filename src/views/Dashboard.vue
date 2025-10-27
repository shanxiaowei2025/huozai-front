<template>
  <div class="dashboard" ref="dashboardRef" :class="{ 'fullscreen': isFullscreen }">
    <!-- 顶部统计卡片区域 -->
    <div class="top-stats">
      <StatCard 
        icon="📊" 
        title="今日报警" 
        :value="23" 
        color="#8b5cf6"
      />
      <StatCard 
        icon="⚡" 
        title="处置率" 
        value="98%" 
        color="#ec4899"
      />
      <StatCard 
        icon="🟢" 
        title="设备在线率" 
        value="99.5%" 
        color="#06b6d4"
      />
      <StatCard 
        icon="📹" 
        title="总摄像机" 
        :value="500" 
        color="#10b981"
      />
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧 GIS 地图 -->
      <div class="left-section">
        <GisMap />
      </div>

      <!-- 中间视频监控墙 -->
      <div class="center-section">
        <VideoWall />
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
import { ref, onMounted } from 'vue'

// 导入子组件
import StatCard from '../components/StatCard.vue'
import GisMap from '../components/GisMap.vue'
import VideoWall from '../components/VideoWall.vue'
import AlarmList from '../components/AlarmList.vue'

// 定义响应式数据：是否全屏
const isFullscreen = ref(false)
const dashboardRef = ref(null)

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

// 监听全屏状态变化（用户按 ESC 退出全屏）
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  document.addEventListener('webkitfullscreenchange', () => {
    isFullscreen.value = !!document.webkitFullscreenElement
  })
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

/* 顶部统计卡片区域 */
.top-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4列均分 */
  gap: 20px;
  height: 150px;
}

/* 主内容区域 */
.main-content {
  flex: 1; /* 占据剩余空间 */
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 左:中:右 = 1:2:1 */
  gap: 20px;
  min-height: 0; /* 防止内容溢出 */
}

/* 左侧区域 */
.left-section {
  background: rgba(10, 14, 39, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
}

/* 中间区域 */
.center-section {
  background: rgba(10, 14, 39, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 246, 255, 0.2);
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
    grid-template-rows: auto auto auto;
  }
}
</style>

