<template>
  <!-- 视频监控墙组件 -->
  <div class="video-wall">
    <!-- 标题栏 -->
    <div class="module-title">
      <span class="icon">📹</span>
      <span>
        实时视频监控（{{ splitMode }}分屏）
        <span v-if="totalPages > 1" class="page-info">
          - 第 {{ currentPage + 1 }}/{{ totalPages }} 页
        </span>
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

// 滚轮翻页相关
const currentPage = ref(0) // 当前页索引
const overlapCount = 3 // 每次翻页保留的重叠监控数量

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

// 筛选当前小区的所有监控
const communityVideos = computed(() => {
  return allVideos.value.filter(video => video.community === selectedCommunity.value)
})

// 计算总页数
const totalPages = computed(() => {
  const total = communityVideos.value.length
  if (total <= splitMode.value) {
    return 1 // 只有一页
  }
  // 计算需要多少页：第一页显示splitMode个，之后每页新增(splitMode - overlapCount)个
  const remainingVideos = total - splitMode.value
  const videosPerPage = splitMode.value - overlapCount
  return 1 + Math.ceil(remainingVideos / videosPerPage)
})

// 根据选中的小区和当前页码显示对应的视频（带重叠的分页）
const displayVideos = computed(() => {
  const videos = communityVideos.value
  const total = videos.length
  
  console.log('📊 displayVideos计算:', {
    总监控数: total,
    分屏模式: splitMode.value,
    当前页: currentPage.value,
    重叠数: overlapCount
  })
  
  // 如果监控数量不超过分屏数，显示全部
  if (total <= splitMode.value) {
    console.log('✅ 监控数量不超过分屏数，显示全部', videos.length, '个')
    return videos
  }
  
  // 计算当前页的起始索引
  // 每次翻页，保留最后3个，新增6个（9分屏时）
  // 第1页：索引0（显示0-8，共9个）
  // 第2页：索引6（显示6-14，保留6、7、8，新增9-14，共9个）
  // 第3页：索引12（显示12-20，保留12、13、14，新增15-20，共9个）
  const videosPerPage = splitMode.value - overlapCount // 每页新增的监控数
  const startIndex = currentPage.value * videosPerPage
  
  const result = videos.slice(startIndex, startIndex + splitMode.value)
  console.log('📹 分页显示:', {
    每页新增: videosPerPage,
    起始索引: startIndex,
    结束索引: startIndex + splitMode.value,
    实际显示: result.length
  })
  
  // 返回当前页的监控（最多splitMode个）
  return result
})

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

// 滚轮事件处理（翻页）
let wheelTimeout = null
const handleWheel = (event) => {
  // 防抖：避免滚动过快
  if (wheelTimeout) return
  
  wheelTimeout = setTimeout(() => {
    wheelTimeout = null
  }, 300) // 300ms内只能翻一次页
  
  event.preventDefault()
  
  if (event.deltaY > 0) {
    // 向下滚动 - 下一页
    if (currentPage.value < totalPages.value - 1) {
      currentPage.value++
      console.log(`📄 翻页：第 ${currentPage.value + 1}/${totalPages.value} 页`)
    }
  } else {
    // 向上滚动 - 上一页
    if (currentPage.value > 0) {
      currentPage.value--
      console.log(`📄 翻页：第 ${currentPage.value + 1}/${totalPages.value} 页`)
    }
  }
}

// 监听小区切换，重置页码
const handleCommunityChange = (communityId) => {
  selectedCommunity.value = communityId
  currentPage.value = 0 // 切换小区时重置到第一页
  console.log(`🏘️ 切换小区，重置到第1页`)
}

// 监听分屏模式切换，重置页码
const handleSplitModeChange = (mode) => {
  splitMode.value = mode
  currentPage.value = 0 // 切换分屏模式时重置到第一页
  console.log(`📺 切换到 ${mode} 分屏，重置到第1页`)
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

// 从百度地图 API 加载小区数据
const loadCommunities = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 方法1：按城市搜索小区
    const result = await searchCommunities({
      city: '定兴县',
      query: '小区',
      pageSize: 20
    })
    
    // 方法2：搜索附近的小区（备选）
    // const result = await searchNearbyCommunities({
    //   lng: 115.808,
    //   lat: 39.267,
    //   radius: 10000,
    //   pageSize: 20
    // })
    
    if (result && result.length > 0) {
      communities.value = result
      // 默认选中第一个小区
      selectedCommunity.value = result[0].id
      
      console.log('✅ 成功加载小区数据：', result)
      
      // 为每个小区生成模拟摄像头数据
      generateCamerasForCommunities(result)
    } else {
      // 如果 API 没有返回结果，使用备用数据
      useFallbackData()
    }
  } catch (err) {
    console.error('❌ 加载小区数据失败：', err)
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
  
  // 添加滚轮事件监听
  if (videoGridRef.value) {
    videoGridRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
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

/* 控制按钮组 */
.controls {
  margin-left: auto;
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
  overflow: hidden; /* 禁用滚动条，改用滚轮翻页 */
  align-content: start;
  padding-right: 8px;
}

/* 9分屏：3列，自动行 */
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, 1fr);
}

/* 16分屏：4列，自动行 */
.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(150px, 1fr);
}

/* 25分屏：5列，自动行 */
.grid-25 {
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: minmax(120px, 1fr);
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

