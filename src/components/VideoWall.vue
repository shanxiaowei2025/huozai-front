<template>
  <!-- 视频监控墙组件 -->
  <div class="video-wall">
    <!-- 标题栏 -->
    <div class="module-title">
      <span class="icon">📹</span>
      <span>
        实时视频监控（{{ splitMode }}分屏）
      </span>
      
      <!-- 双击全屏提示 -->
      <span class="fullscreen-tip">
        <span class="tip-icon">💡</span>
        双击视频可全屏查看
      </span>
      
      <!-- 分屏切换按钮 -->
      <div class="controls">
        <button 
          v-for="mode in [9, 16, 25]" 
          :key="mode"
          @click="handleSplitModeChange(mode)"
          :class="{ active: splitMode === mode }"
          class="split-btn"
        >
          {{ mode }}分屏
        </button>
      </div>
    </div>

    <!-- 小区选择标签栏 -->
    <div class="community-tabs">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-message">
        <span class="loading-icon">⏳</span>
        <span>正在从百度地图加载小区数据...</span>
      </div>
      
      <!-- 错误提示 -->
      <div v-else-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }} - 已使用备用数据</span>
      </div>
      
      <!-- 小区标签列表 -->
      <button 
        v-for="community in communities" 
        :key="community.id"
        @click="handleCommunityChange(community.id)"
        :class="{ active: selectedCommunity === community.id }"
        class="community-btn"
      >
        <span class="community-icon">🏘️</span>
        <span>{{ community.name }}</span>
        <span class="camera-count">{{ community.cameraCount }}个</span>
        <span v-if="community.distance" class="distance-badge"></span>
      </button>
    </div>

    <!-- 翻页控制栏 -->
    <div v-if="totalPages > 1" class="pagination-bar">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-btn"
        title="快捷键: ← 左箭头"
      >
        ◀ 上一页
      </button>
      
      <div class="page-info">
        <span class="page-number">{{ currentPage }}</span>
        <span class="page-divider">/</span>
        <span class="page-total">{{ totalPages }}</span>
        <span class="camera-info">（共 {{ communityVideos.length }} 个摄像头）</span>
        <span class="shortcut-tip">💡 可用滚轮或方向键翻页</span>
      </div>
      
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-btn"
        title="快捷键: → 右箭头"
      >
        下一页 ▶
      </button>
    </div>

    <!-- 视频网格 -->
    <div ref="videoGridRef" class="video-grid" :class="`grid-${splitMode}`">
      <div 
        v-for="(video, index) in displayVideos" 
        :key="index"
        class="video-item"
        :class="{ 
          'has-alarm': video.hasAlarm,
          'selected': selectedVideo === index 
        }"
        @click="selectVideo(index)"
        @dblclick="openFullscreen(video, index)"
      >
        <!-- 视频标签 -->
        <div class="video-label">
          <span v-if="video.hasAlarm" class="alarm-icon">🔥</span>
          <span>{{ video.name }}</span>
        </div>

        <!-- 视频预览区（使用颜色模拟摄像头画面） -->
        <div class="video-preview" :style="{ background: video.bgColor }">
          <div class="camera-icon">📹</div>
        </div>

        <!-- 报警标记 -->
        <div v-if="video.hasAlarm" class="alarm-badge">
          {{ video.alarmType }}
        </div>
      </div>
    </div>

    <!-- 全屏监控弹窗 -->
    <div v-if="fullscreenVideo" class="fullscreen-overlay" @click="closeFullscreen">
      <div class="fullscreen-container" @click.stop>
        <!-- 全屏头部 -->
        <div class="fullscreen-header">
          <div class="header-left">
            <span class="fullscreen-icon">📹</span>
            <span class="fullscreen-title">{{ fullscreenVideo.name }}</span>
            <span v-if="fullscreenVideo.hasAlarm" class="fullscreen-alarm-badge">
              🔥 {{ fullscreenVideo.alarmType }}
            </span>
          </div>
          <button class="fullscreen-close-btn" @click="closeFullscreen">✕</button>
        </div>

        <!-- 全屏视频区域 -->
        <div class="fullscreen-video" :style="{ background: fullscreenVideo.bgColor }">
          <div class="fullscreen-camera-icon">📹</div>
          <div class="video-info-overlay">
            <div class="video-status">
              <span class="status-dot"></span>
              <span>实时监控中</span>
            </div>
            <div class="video-time">{{ currentTime }}</div>
          </div>
        </div>

        <!-- 全屏底部信息 -->
        <div class="fullscreen-footer">
          <div class="footer-info">
            <div class="info-group">
              <span class="info-label">监控位置：</span>
              <span class="info-value">{{ fullscreenVideo.name }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">监控状态：</span>
              <span class="info-value" :class="fullscreenVideo.hasAlarm ? 'alarm' : 'normal'">
                {{ fullscreenVideo.hasAlarm ? '⚠️ 报警中' : '✅ 正常' }}
              </span>
            </div>
            <div class="info-group" v-if="fullscreenVideo.lng && fullscreenVideo.lat">
              <span class="info-label">GPS坐标：</span>
              <span class="info-value coordinates">
                {{ fullscreenVideo.lng.toFixed(6) }}, {{ fullscreenVideo.lat.toFixed(6) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { searchCommunities, searchNearbyCommunities } from '@/services/baiduMapService'

// 分屏模式：9/16/25
const splitMode = ref(9)
// 选中的视频
const selectedVideo = ref(null)
// 选中的小区
const selectedCommunity = ref(null)
// 全屏显示的视频
const fullscreenVideo = ref(null)
// 当前时间（用于全屏显示）
const currentTime = ref('')

// 小区数据（从百度地图 API 获取）
const communities = ref([])
// 加载状态
const loading = ref(false)
// 错误信息
const error = ref(null)

// 删除翻页相关变量

// 所有视频数据（按小区分组）
const allVideos = ref([
  // A小区摄像头
  { name: 'A栋-3F', community: 'a', hasAlarm: true, alarmType: '火灾报警', bgColor: 'linear-gradient(135deg, #dc2626, #991b1b)' },
  { name: 'B栋-5F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'C栋-8F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'D栋-2F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'E栋-12F', community: 'a', hasAlarm: true, alarmType: '高空抛物', bgColor: 'linear-gradient(135deg, #d97706, #92400e)' },
  { name: 'F栋-6F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'G栋-4F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'H栋-7F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'I栋-9F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'J栋-1F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'K栋-10F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'L栋-3F', community: 'a', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  
  // B小区摄像头
  { name: '1号楼-1F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '2号楼-2F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '3号楼-5F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '4号楼-3F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '5号楼-8F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '6号楼-4F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '7号楼-6F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '8号楼-7F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '9号楼-9F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '10号楼-2F', community: 'b', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  
  // C小区摄像头
  { name: '东区-1F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '西区-2F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '南区-3F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '北区-4F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '中心-5F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '东门-1F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '西门-1F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '停车场-1F', community: 'c', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  
  // D小区摄像头
  { name: '松园-1栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '竹园-2栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '梅园-3栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '兰园-4栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '菊园-5栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '荷园-6栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '桂园-7栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '樱园-8栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '桃园-9栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '柳园-10栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '梨园-11栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '杏园-12栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '枫园-13栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '柏园-14栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: '槐园-15栋', community: 'd', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' }
])

// 当前页码
const currentPage = ref(1)

// 筛选当前小区的所有监控
const communityVideos = computed(() => {
  return allVideos.value.filter(video => video.community === selectedCommunity.value)
})

// 计算总页数
const totalPages = computed(() => {
  const total = communityVideos.value.length
  return Math.ceil(total / splitMode.value)
})

// 根据选中的小区和当前页码显示对应的视频
const displayVideos = computed(() => {
  const videos = communityVideos.value
  const start = (currentPage.value - 1) * splitMode.value
  const end = start + splitMode.value
  return videos.slice(start, end)
})

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    console.log(`📄 翻到第 ${currentPage.value} 页`)
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    console.log(`📄 翻到第 ${currentPage.value} 页`)
  }
}

// 选择视频
const selectVideo = (index) => {
  selectedVideo.value = index
  console.log('选中视频：', displayVideos.value[index].name)
}

// 打开全屏显示
const openFullscreen = (video, index) => {
  fullscreenVideo.value = video
  selectedVideo.value = index
  updateCurrentTime()
  console.log('📺 全屏显示视频：', video.name)
}

// 关闭全屏显示
const closeFullscreen = () => {
  fullscreenVideo.value = null
  console.log('❌ 关闭全屏显示')
}

// 删除滚轮翻页事件处理

// 监听小区切换
const handleCommunityChange = (communityId) => {
  selectedCommunity.value = communityId
  // 切换小区时重置到第一页
  currentPage.value = 1
}

// 监听分屏模式切换
const handleSplitModeChange = (mode) => {
  splitMode.value = mode
  // 切换分屏模式时重置到第一页
  currentPage.value = 1
}

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

// 时间更新定时器
let timeInterval = null

// 从百度地图 API 加载小区数据（仅定兴县城区）
const loadCommunities = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 使用附近搜索，限制在定兴县城区范围内
    // 定兴县城区中心坐标：经度 115.808，纬度 39.267
    // 搜索半径：5000米（5公里），覆盖城区主要区域
    const result = await searchNearbyCommunities({
      lng: 115.808,      // 定兴县城区中心经度
      lat: 39.267,       // 定兴县城区中心纬度
      radius: 5000,      // 搜索半径5公里，仅限城区
      pageSize: 20       // 最多返回20个小区
    })
    
    if (result && result.length > 0) {
      communities.value = result
      // 默认选中第一个小区
      selectedCommunity.value = result[0].id
      
      console.log('✅ 成功加载定兴县城区小区数据：', result.length, '个小区')
      console.log('📍 搜索范围：城区中心5公里半径内', result)
      
      // 为每个小区生成模拟摄像头数据
      generateCamerasForCommunities(result)
    } else {
      // 如果 API 没有返回结果，使用备用数据
      console.warn('⚠️ 百度地图未返回城区小区数据，使用备用数据')
      useFallbackData()
    }
  } catch (err) {
    console.error('❌ 加载定兴县城区小区数据失败：', err)
    error.value = err.message
    // 使用备用数据
    useFallbackData()
  } finally {
    loading.value = false
  }
}

// 为每个小区生成模拟摄像头数据
const generateCamerasForCommunities = (communitiesList) => {
  const newVideos = []
  
  communitiesList.forEach((community) => {
    const cameraCount = community.cameraCount || 10
    
    // 为每个小区生成摄像头
    for (let i = 0; i < cameraCount; i++) {
      const floors = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F']
      const hasAlarm = Math.random() < 0.1 // 10% 概率有报警
      
      newVideos.push({
        name: `${community.name}-${floors[i % floors.length]}`,
        community: community.id,
        hasAlarm: hasAlarm,
        alarmType: hasAlarm ? (Math.random() > 0.5 ? '火灾报警' : '高空抛物') : null,
        bgColor: hasAlarm 
          ? (Math.random() > 0.5 ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'linear-gradient(135deg, #d97706, #92400e)')
          : 'linear-gradient(135deg, #1e293b, #0f172a)',
        lng: community.lng,
        lat: community.lat
      })
    }
  })
  
  allVideos.value = newVideos
  console.log('📹 生成摄像头数据：', newVideos.length, '个')
}

// 使用备用数据（当 API 失败时）
const useFallbackData = () => {
  console.log('⚠️ 使用备用小区数据')
  
  communities.value = [
    { id: 'a', name: 'A小区', cameraCount: 12 },
    { id: 'b', name: 'B小区', cameraCount: 10 },
    { id: 'c', name: 'C小区', cameraCount: 8 },
    { id: 'd', name: 'D小区', cameraCount: 15 }
  ]
  
  selectedCommunity.value = 'a'
  
  // 保持原有的静态摄像头数据（已在 allVideos.ref 中定义）
}

// 视频网格元素引用
const videoGridRef = ref(null)

// 滚轮事件防抖
let wheelTimeout = null

// 滚轮翻页处理
const handleWheel = (event) => {
  if (totalPages.value <= 1) return
  
  // 防抖处理 - 避免翻页过快
  if (wheelTimeout) return
  
  event.preventDefault()
  
  if (event.deltaY > 0) {
    // 向下滚动 -> 下一页
    nextPage()
  } else {
    // 向上滚动 -> 上一页
    prevPage()
  }
  
  // 设置防抖延迟（800ms）
  wheelTimeout = setTimeout(() => {
    wheelTimeout = null
  }, 800)
}

// 键盘翻页处理
const handleKeyboard = (event) => {
  if (totalPages.value <= 1) return
  
  if (event.key === 'ArrowLeft') {
    prevPage()
  } else if (event.key === 'ArrowRight') {
    nextPage()
  }
}

// 组件挂载时加载小区数据
onMounted(() => {
  // 延迟加载，确保百度地图 API 已加载
  setTimeout(() => {
    loadCommunities()
  }, 1000)
  
  // 启动时间更新定时器
  timeInterval = setInterval(() => {
    if (fullscreenVideo.value) {
      updateCurrentTime()
    }
  }, 1000)
  
  // 添加滚轮事件监听（在视频网格上）
  if (videoGridRef.value) {
    videoGridRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyboard)
})

// 组件卸载时清理定时器和事件监听
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  
  // 移除滚轮事件监听
  if (videoGridRef.value) {
    videoGridRef.value.removeEventListener('wheel', handleWheel)
  }
  
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
/* 视频墙容器 */
.video-wall {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 模块标题 */
.module-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #00f6ff;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.3);
}

.icon {
  font-size: 24px;
}

/* 全屏提示 */
.fullscreen-tip {
  margin-left: auto;
  margin-right: 20px;
  padding: 6px 14px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  color: #a78bfa;
  font-size: 13px;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: pulse-tip 2s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: default;
}

.fullscreen-tip:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

.tip-icon {
  font-size: 14px;
  animation: glow-tip 2s ease-in-out infinite;
}

@keyframes pulse-tip {
  0%, 100% {
    box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
  }
}

@keyframes glow-tip {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.5);
  }
}

/* 控制按钮组 */
.controls {
  margin-left: 0;
  display: flex;
  gap: 8px;
}

.split-btn {
  padding: 6px 12px;
  background: rgba(0, 246, 255, 0.1);
  border: 1px solid rgba(0, 246, 255, 0.3);
  border-radius: 4px;
  color: #00f6ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.split-btn:hover {
  background: rgba(0, 246, 255, 0.2);
}

.split-btn.active {
  background: #00f6ff;
  color: #0a0e27;
  font-weight: bold;
}

/* 页码信息 */
.page-info {
  color: rgba(0, 246, 255, 0.8);
  font-size: 14px;
  font-weight: normal;
  margin-left: 8px;
}

/* 小区选择标签栏 */
.community-tabs {
  display: flex;
  gap: 10px;
  padding: 0 0 16px 0;
  border-bottom: 1px solid rgba(0, 246, 255, 0.2);
  overflow-x: auto;
}

/* 小区按钮 */
.community-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 246, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.community-btn:hover {
  background: rgba(0, 246, 255, 0.1);
  border-color: rgba(0, 246, 255, 0.5);
  transform: translateY(-2px);
}

.community-btn.active {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border-color: #06b6d4;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.community-icon {
  font-size: 18px;
}

.camera-count {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.community-btn.active .camera-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 距离标签 */
.distance-badge {
  padding: 2px 6px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  font-size: 10px;
  color: #10b981;
  font-weight: bold;
}

.community-btn.active .distance-badge {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

/* 翻页控制栏 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 12px 20px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 246, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.page-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
  border: 1px solid rgba(6, 182, 212, 0.5);
  color: #00f6ff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.page-number {
  font-size: 24px;
  font-weight: bold;
  color: #00f6ff;
  text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
}

.page-divider {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.3);
}

.page-total {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.camera-info {
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.shortcut-tip {
  margin-left: 12px;
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10b981;
  font-size: 11px;
  font-weight: normal;
}

/* 加载和错误提示 */
.loading-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.loading-message {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.loading-icon {
  font-size: 18px;
  animation: spin 2s linear infinite;
}

.error-icon {
  font-size: 18px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 视频网格 */
.video-grid {
  flex: 1;
  display: grid;
  gap: 12px;
  overflow: hidden;
  padding-right: 8px;
  min-height: 0; /* 重要：允许flex子项缩小 */
}

/* 9分屏：3x3网格 */
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* 16分屏：4x4网格 */
.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

/* 25分屏：5x5网格 */
.grid-25 {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
}

/* 单个视频项 */
.video-item {
  position: relative;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border: 2px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.video-item:hover {
  border-color: rgba(0, 246, 255, 0.6);
  transform: scale(1.02);
}

.video-item.selected {
  border-color: #00f6ff;
  box-shadow: 0 0 20px rgba(0, 246, 255, 0.5);
}

/* 报警视频边框 */
.video-item.has-alarm {
  border-color: #ef4444;
  animation: alarmBlink 1s infinite;
}

@keyframes alarmBlink {
  0%, 100% { border-color: #ef4444; }
  50% { border-color: #fca5a5; }
}

/* 视频标签 */
.video-label {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.alarm-icon {
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* 视频预览区 */
.video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 48px;
  opacity: 0.3;
}

/* 报警徽章 */
.alarm-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  z-index: 2;
}

/* 全屏监控弹窗 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-container {
  width: 90%;
  max-width: 1600px;
  height: 90%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  border: 2px solid rgba(0, 246, 255, 0.5);
  box-shadow: 0 0 50px rgba(0, 246, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 全屏头部 */
.fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid rgba(0, 246, 255, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.fullscreen-icon {
  font-size: 32px;
}

.fullscreen-title {
  font-size: 24px;
  font-weight: bold;
  color: #00f6ff;
  text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
}

.fullscreen-alarm-badge {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.fullscreen-close-btn {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
  transform: rotate(90deg);
}

/* 全屏视频区域 */
.fullscreen-video {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fullscreen-camera-icon {
  font-size: 120px;
  opacity: 0.2;
}

.video-info-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.video-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  font-size: 14px;
  color: white;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.video-time {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #00f6ff;
  font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px);
  text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
}

/* 全屏底部信息 */
.fullscreen-footer {
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.4);
  border-top: 2px solid rgba(0, 246, 255, 0.3);
}

.footer-info {
  display: flex;
  gap: 40px;
  align-items: center;
}

.info-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.info-value {
  color: #ffffff;
  font-weight: bold;
}

.info-value.normal {
  color: #10b981;
}

.info-value.alarm {
  color: #ef4444;
  animation: textBlink 1s infinite;
}

@keyframes textBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.info-value.coordinates {
  color: #64748b;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}
</style>

