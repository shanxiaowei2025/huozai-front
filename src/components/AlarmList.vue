<template>
  <!-- 报警列表组件 -->
  <div class="alarm-list">
    <!-- 标题 -->
    <div class="module-title">
      <span class="icon">📋</span>
      <span>实时报警列表</span>
      <button class="test-alarm-btn" @click="generateNewAlarm" title="测试新报警弹窗">
        🚨 测试报警
      </button>
    </div>

    <!-- 报警项列表 -->
    <div class="alarm-items">
      <div 
        v-for="alarm in alarms" 
        :key="alarm.id"
        class="alarm-item"
        :class="`status-${alarm.status}`"
        @click="handleAlarm(alarm)"
      >
        <!-- 报警类型图标 -->
        <div class="alarm-type">
          <span class="type-icon">{{ alarm.icon }}</span>
          <span class="type-text">{{ alarm.type }}</span>
        </div>

        <!-- 报警信息 -->
        <div class="alarm-info">
          <div class="location">{{ alarm.location }}</div>
          <div class="time">{{ alarm.time }}</div>
        </div>

        <!-- 状态标签和修改按钮 -->
        <div class="alarm-status">
          <span v-if="alarm.status === 'pending'" class="status-badge pending">
            未处置
          </span>
          <span v-else-if="alarm.status === 'processing'" class="status-badge processing">
            处置中
          </span>
          <span v-else class="status-badge resolved">
            已处置
          </span>
          <button class="change-status-btn" @click.stop="openStatusDialog(alarm)">
            修改状态
          </button>
        </div>
      </div>
    </div>

    <!-- 状态修改对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>修改报警状态</h3>
          <button class="close-btn" @click="closeDialog">✕</button>
        </div>
        
        <div class="dialog-body">
          <div class="alarm-detail">
            <div class="detail-row">
              <span class="label">报警类型：</span>
              <span class="value">{{ currentAlarm?.icon }} {{ currentAlarm?.type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">报警位置：</span>
              <span class="value">{{ currentAlarm?.location }}</span>
            </div>
            <div class="detail-row">
              <span class="label">报警时间：</span>
              <span class="value">{{ currentAlarm?.time }}</span>
            </div>
          </div>

          <div class="status-options">
            <div class="option-label">选择新状态：</div>
            <div class="status-buttons">
              <button 
                class="status-option pending"
                :class="{ active: selectedStatus === 'pending' }"
                @click="selectedStatus = 'pending'"
              >
                未处置
              </button>
              <button 
                class="status-option processing"
                :class="{ active: selectedStatus === 'processing' }"
                @click="selectedStatus = 'processing'"
              >
                处置中
              </button>
              <button 
                class="status-option resolved"
                :class="{ active: selectedStatus === 'resolved' }"
                @click="selectedStatus = 'resolved'"
              >
                已处置
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="confirm-btn" @click="confirmStatusChange">确认修改</button>
        </div>
      </div>
    </div>

    <!-- 新报警弹窗 -->
    <div v-if="showNewAlarmPopup" class="new-alarm-overlay" @click="closeNewAlarmPopup">
      <div class="new-alarm-popup" @click.stop>
        <!-- 警报标题 -->
        <div class="popup-header">
          <div class="alarm-badge">
            <span class="badge-icon">🚨</span>
            <span class="badge-text">紧急报警</span>
          </div>
          <button class="popup-close-btn" @click="closeNewAlarmPopup">✕</button>
        </div>

        <!-- 报警信息 -->
        <div class="popup-info">
          <div class="info-title">
            <span class="title-icon">{{ newAlarm?.icon }}</span>
            <span class="title-text">{{ newAlarm?.type }}</span>
          </div>
          <div class="info-details">
            <div class="info-item">
              <span class="item-label">📍</span>
              <span class="item-value">{{ newAlarm?.location }}</span>
            </div>
            <div class="info-item" v-if="newAlarm?.fullAddress">
              <span class="item-label">🏠</span>
              <span class="item-value address">{{ newAlarm?.fullAddress }}</span>
            </div>
            <div class="info-item" v-if="newAlarm?.coordinates">
              <span class="item-label">🗺️</span>
              <span class="item-value coordinates">
                经度: {{ newAlarm?.coordinates.lng.toFixed(6) }} | 纬度: {{ newAlarm?.coordinates.lat.toFixed(6) }}
              </span>
            </div>
            <div class="info-item">
              <span class="item-label">⏰</span>
              <span class="item-value">{{ newAlarm?.time }}</span>
            </div>
            <div class="info-item description">
              <span class="item-label">📝</span>
              <span class="item-value">{{ newAlarm?.description }}</span>
            </div>
          </div>
        </div>

        <!-- 监控视频 -->
        <div class="popup-video">
          <div class="video-title">实时监控画面</div>
          <div class="video-container">
            <!-- 加载中效果 -->
            <div class="video-loading">
              <div class="loading-spinner"></div>
              <div class="loading-text">正在加载监控画面...</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="popup-actions">
          <button class="action-btn ignore-btn" @click="closeNewAlarmPopup">
            稍后处理
          </button>
          <button class="action-btn handle-btn" @click="handleNewAlarm">
            立即处理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, inject, computed } from 'vue'

// 从百度地图获取的真实地点数据
const realLocations = ref([])
const isLoadingLocations = ref(false)

// 备用的定兴县城区地点数据（当API无法获取真实数据时使用）
// 所有地点均在县中心3公里范围内
const fallbackLocations = [
  { name: '定兴县政府家属院', address: '河北省保定市定兴县', point: { lng: 115.808, lat: 39.267 } }, // 县中心
  { name: '定兴县人民医院家属楼', address: '河北省保定市定兴县', point: { lng: 115.810, lat: 39.268 } }, // 0.2km
  { name: '定兴县实验中学家属区', address: '河北省保定市定兴县', point: { lng: 115.806, lat: 39.266 } }, // 0.2km
  { name: '定兴县水岸花园', address: '河北省保定市定兴县', point: { lng: 115.812, lat: 39.269 } }, // 0.5km
  { name: '定兴县阳光小区', address: '河北省保定市定兴县', point: { lng: 115.805, lat: 39.265 } }, // 0.4km
  { name: '定兴县锦绣家园', address: '河北省保定市定兴县', point: { lng: 115.815, lat: 39.270 } }, // 0.8km
  { name: '定兴县幸福里小区', address: '河北省保定市定兴县', point: { lng: 115.803, lat: 39.264 } }, // 0.6km
  { name: '定兴县书香苑', address: '河北省保定市定兴县', point: { lng: 115.818, lat: 39.271 } }, // 1.2km
  { name: '定兴县金色家园', address: '河北省保定市定兴县', point: { lng: 115.810, lat: 39.265 } }, // 0.3km
  { name: '定兴县世纪花园', address: '河北省保定市定兴县', point: { lng: 115.805, lat: 39.268 } }, // 0.3km
  { name: '定兴县银河小区', address: '河北省保定市定兴县', point: { lng: 115.813, lat: 39.266 } }, // 0.5km
  { name: '定兴县文苑小区', address: '河北省保定市定兴县', point: { lng: 115.807, lat: 39.270 } }, // 0.3km
  { name: '定兴县康泰家园', address: '河北省保定市定兴县', point: { lng: 115.811, lat: 39.264 } }, // 0.4km
  { name: '定兴县福临门小区', address: '河北省保定市定兴县', point: { lng: 115.804, lat: 39.269 } }, // 0.5km
  { name: '定兴县盛世华庭', address: '河北省保定市定兴县', point: { lng: 115.816, lat: 39.268 } }, // 0.9km
  { name: '定兴县龙凤城', address: '河北省保定市定兴县', point: { lng: 115.809, lat: 39.263 } } // 0.5km
]

// 注入报警数据共享机制
const alarmData = inject('alarmData', null)

// 定兴县城区中心坐标
const DINGXING_CENTER = { lng: 115.808, lat: 39.267 }
// 定兴县城区范围半径（公里）
const CITY_RADIUS_KM = 3

// 计算两点之间的距离（公里）
const calculateDistance = (point1, point2) => {
  const radLat1 = point1.lat * Math.PI / 180
  const radLat2 = point2.lat * Math.PI / 180
  const a = radLat1 - radLat2
  const b = point1.lng * Math.PI / 180 - point2.lng * Math.PI / 180
  const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2), 2) + 
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b/2), 2)))
  return s * 6378.137 // 地球半径 6378.137km
}

// 判断是否在定兴县城区范围内
const isInCityArea = (point) => {
  if (!point || !point.lng || !point.lat) return false
  const distance = calculateDistance(DINGXING_CENTER, point)
  return distance <= CITY_RADIUS_KM
}

// 获取定兴县城区的真实地点（小区、住宅楼等）
const fetchRealLocations = async () => {
  if (typeof BMap === 'undefined') {
    console.error('百度地图API未加载')
    return
  }
  
  isLoadingLocations.value = true
  
  try {
    // 定义多个搜索关键词，获取更多地点
    const searchKeywords = ['小区', '住宅', '家园', '公寓']
    const allLocations = []
    let completedSearches = 0
    
    // 对每个关键词进行搜索
    searchKeywords.forEach(keyword => {
      const localSearch = new BMap.LocalSearch('定兴县', {
        pageCapacity: 10, // 每页显示10个结果
        onSearchComplete: (results) => {
          completedSearches++
          
          if (localSearch.getStatus() === BMAP_STATUS_SUCCESS) {
            // 获取搜索结果
            for (let i = 0; i < results.getCurrentNumPois(); i++) {
              const poi = results.getPoi(i)
              if (poi) {
                // 严格过滤：只保留地址中包含"定兴县"的结果
                const address = poi.address || ''
                if (!address.includes('定兴县')) {
                  continue // 跳过非定兴县的地址
                }
                
                // 🎯 新增：只保留城区范围内的小区（距离县中心3公里以内）
                if (!isInCityArea(poi.point)) {
                  console.log(`⏭️ 跳过非城区地点: ${poi.title} (距离: ${calculateDistance(DINGXING_CENTER, poi.point).toFixed(2)}km)`)
                  continue
                }
                
                // 避免重复添加
                const isDuplicate = allLocations.some(loc => 
                  loc.name === poi.title && loc.address === poi.address
                )
                
                if (!isDuplicate) {
                  allLocations.push({
                    name: poi.title,
                    address: poi.address,
                    point: poi.point,
                    keyword: keyword,
                    distance: calculateDistance(DINGXING_CENTER, poi.point)
                  })
                }
              }
            }
          }
          
          // 所有搜索完成后更新数据
          if (completedSearches === searchKeywords.length) {
            realLocations.value = allLocations
            console.log(`✅ 成功获取定兴县城区小区：${allLocations.length} 个`)
            console.log('📋 地点来源:', searchKeywords.join(', '))
            console.log(`🎯 筛选条件：距离县中心 ${CITY_RADIUS_KM}km 以内`)
            
            // 显示前5个地点的详细信息作为示例
            if (allLocations.length > 0) {
              console.log('📍 定兴县城区小区（前5个）:')
              allLocations.slice(0, 5).forEach((loc, index) => {
                console.log(`  ${index + 1}. ${loc.name}`)
                console.log(`     地址: ${loc.address}`)
                if (loc.point) {
                  console.log(`     坐标: ${loc.point.lng.toFixed(6)}, ${loc.point.lat.toFixed(6)}`)
                  console.log(`     距离县中心: ${loc.distance.toFixed(2)}km`)
                }
              })
            } else {
              console.warn('⚠️ 未找到定兴县城区的地点数据，使用备用方案')
              // 使用备用地点数据
              realLocations.value = fallbackLocations
              console.log('📍 已加载备用定兴县地点数据:', fallbackLocations.length, '个')
            }
            
            // 更新现有报警的位置信息
            updateAlarmsWithRealLocations()
            isLoadingLocations.value = false
          }
        }
      })
      
      // 执行搜索
      localSearch.search(keyword)
    })
  } catch (error) {
    console.error('获取地点数据失败：', error)
    isLoadingLocations.value = false
  }
}

// 生成随机楼栋和楼层信息
const generateBuildingInfo = () => {
  const buildingNum = Math.floor(Math.random() * 5) + 1 // 1-5栋
  const floorGroupIndex = Math.floor(Math.random() * 5) // 0-4，对应5个楼层段
  const floorStart = floorGroupIndex * 5 + 1
  const floorEnd = floorStart + 4
  
  return ` ${buildingNum}栋(${floorStart}-${floorEnd}层)`
}

// 从真实地点生成位置字符串
const generateLocationFromReal = () => {
  // 优先使用API获取的真实地点，如果没有则使用备用地点
  const locations = realLocations.value.length > 0 ? realLocations.value : fallbackLocations
  
  if (locations.length === 0) {
    // 如果还没有加载到任何地点，使用默认位置
    return {
      displayName: `定兴县某小区${generateBuildingInfo()}`,
      fullAddress: '河北省保定市定兴县',
      poi: { lng: 115.808, lat: 39.267 } // 定兴县中心坐标
    }
  }
  
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const buildingInfo = generateBuildingInfo()
  
  // 提取小区名称（去除地址中的多余信息）
  let locationName = randomLocation.name
  // 简化名称，只保留小区名
  locationName = locationName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '').trim()
  
  return {
    displayName: `${locationName}${buildingInfo}`,
    fullAddress: randomLocation.address || '河北省保定市定兴县',
    poi: randomLocation.point,
    communityName: locationName,
    buildingInfo: buildingInfo
  }
}

// 更新现有报警的位置信息
const updateAlarmsWithRealLocations = () => {
  alarms.value.forEach(alarm => {
    const locationData = generateLocationFromReal()
    alarm.location = locationData.displayName
    alarm.fullAddress = locationData.fullAddress
    alarm.coordinates = locationData.poi ? {
      lng: locationData.poi.lng,
      lat: locationData.poi.lat
    } : null
  })
}

// 获取今天的日期字符串
const getTodayDateStr = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 模拟报警数据 - 所有状态默认为未处置，日期为今天
const alarms = ref([
  {
    id: 1,
    type: '火灾报警',
    icon: '🔥',
    location: '加载中...',
    time: `${getTodayDateStr()} 14:32:15`,
    status: 'pending',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: '检测到明火和大量烟雾，请立即处理！'
  },
  {
    id: 2,
    type: '高空抛物',
    icon: '📦',
    location: '加载中...',
    time: `${getTodayDateStr()} 14:28:43`,
    status: 'pending',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: '检测到有物体从高空抛下，请注意安全！'
  },
  {
    id: 3,
    type: '火灾误报',
    icon: '✅',
    location: '加载中...',
    time: `${getTodayDateStr()} 14:15:22`,
    status: 'pending',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: '系统误报，已确认无火灾风险。'
  },
  {
    id: 5,
    type: '烟雾报警',
    icon: '💨',
    location: '加载中...',
    time: `${getTodayDateStr()} 13:58:33`,
    status: 'pending',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: '检测到烟雾浓度超标，请及时查看！'
  }
])

// 对话框相关状态
const showDialog = ref(false)
const currentAlarm = ref(null)
const selectedStatus = ref('pending')

// 新报警弹窗相关状态
const showNewAlarmPopup = ref(false)
const newAlarm = ref(null)
const alarmSound = ref(null)

// 点击报警项
const handleAlarm = (alarm) => {
  console.log('查看报警详情：', alarm)
  // 打开新报警弹窗显示详情
  showNewAlarmPopup.value = true
  newAlarm.value = alarm
}

// 打开状态修改对话框
const openStatusDialog = (alarm) => {
  currentAlarm.value = alarm
  selectedStatus.value = alarm.status
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  currentAlarm.value = null
}

// 确认修改状态
const confirmStatusChange = () => {
  if (currentAlarm.value) {
    const alarm = alarms.value.find(a => a.id === currentAlarm.value.id)
    if (alarm) {
      alarm.status = selectedStatus.value
      console.log(`报警 ${alarm.id} 状态已修改为: ${selectedStatus.value}`)
    }
  }
  closeDialog()
}

// 关闭新报警弹窗
const closeNewAlarmPopup = () => {
  showNewAlarmPopup.value = false
  if (alarmSound.value) {
    alarmSound.value.pause()
    alarmSound.value.currentTime = 0
  }
}

// 处理新报警
const handleNewAlarm = () => {
  if (newAlarm.value) {
    // 可以在这里添加处理逻辑
    console.log('处理新报警：', newAlarm.value)
    closeNewAlarmPopup()
    // 打开状态修改对话框
    openStatusDialog(newAlarm.value)
  }
}

// 模拟生成新报警
const generateNewAlarm = () => {
  console.log('🚨 开始生成新报警...')
  
  try {
    const types = [
      { type: '火灾报警', icon: '🔥', description: '检测到明火和大量烟雾，请立即处理！' },
      { type: '高空抛物', icon: '📦', description: '检测到有物体从高空抛下，请注意安全！' },
      { type: '烟雾报警', icon: '💨', description: '检测到烟雾浓度超标，请及时查看！' }
    ]
    
    const randomType = types[Math.floor(Math.random() * types.length)]
    console.log('📝 随机选择的报警类型:', randomType.type)
    
    // 使用从百度地图获取的真实地点
    const locationData = generateLocationFromReal()
    console.log('📍 生成的位置数据:', locationData)
    
    const now = new Date()
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    // 火灾相关视频列表
    const fireVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    ]
    
    const alarm = {
      id: Date.now(),
      type: randomType.type,
      icon: randomType.icon,
      location: locationData.displayName,
      fullAddress: locationData.fullAddress,
      coordinates: locationData.poi ? {
        lng: locationData.poi.lng,
        lat: locationData.poi.lat
      } : null,
      time: timeString,
      status: 'pending',
      videoUrl: fireVideos[Math.floor(Math.random() * fireVideos.length)],
      description: randomType.description
    }
    
    console.log('📋 创建的报警对象:', alarm)
    
    // 添加到列表顶部
    alarms.value.unshift(alarm)
    console.log('✅ 报警已添加到列表')
    
    // 显示新报警弹窗
    newAlarm.value = alarm
    showNewAlarmPopup.value = true
    console.log('✅ 弹窗状态已设置为 true, showNewAlarmPopup =', showNewAlarmPopup.value)
    
    // 播放报警音效
    playAlarmSound()
    
    console.log('📍 新报警位置（来自百度地图）:', locationData.displayName)
    console.log('📫 详细地址:', locationData.fullAddress)
    if (locationData.poi) {
      console.log('🗺️ 坐标:', `${locationData.poi.lng}, ${locationData.poi.lat}`)
    }
    
    console.log('🎉 新报警生成完成！')
  } catch (error) {
    console.error('❌ 生成新报警时出错:', error)
  }
}

// 播放报警音效
const playAlarmSound = () => {
  try {
    // 创建音频上下文播放提示音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log('音频播放失败:', error)
  }
}

// 筛选当天的报警数据（用于地图标记）
const getTodayAlarms = () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] // 格式: YYYY-MM-DD
  
  return alarms.value.filter(alarm => {
    if (!alarm.time || !alarm.coordinates) return false
    
    // 从时间字符串中提取日期部分
    const alarmDate = alarm.time.split(' ')[0] // 格式: YYYY-MM-DD
    return alarmDate === todayStr
  })
}

// 监听报警数据变化，实时更新共享的当天报警
watch(alarms, () => {
  if (alarmData) {
    const todayAlarms = getTodayAlarms()
    alarmData.updateAlarms(todayAlarms)
    console.log('📍 更新当天报警数据到地图:', todayAlarms.length, '条')
  }
}, { deep: true, immediate: true })

// 组件挂载
onMounted(() => {
  console.log('报警列表组件已加载')
  
  // 延迟加载地点数据，等待百度地图API加载完成
  setTimeout(() => {
    fetchRealLocations()
  }, 1000)
})

// 组件卸载时清理
onUnmounted(() => {
  // 停止报警音效
  if (alarmSound.value) {
    alarmSound.value.pause()
    alarmSound.value = null
  }
})
</script>

<style scoped>
/* 报警列表容器 */
.alarm-list {
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
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #00f6ff;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.3);
}

.icon {
  font-size: 24px;
}

/* 测试报警按钮 */
.test-alarm-btn {
  margin-left: auto;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-alarm-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

/* 报警项容器 */
.alarm-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单个报警项 */
.alarm-item {
  padding: 16px;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 不同状态的边框颜色 */
.alarm-item.status-pending {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.alarm-item.status-processing {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.alarm-item.status-resolved {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.alarm-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 报警类型 */
.alarm-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.type-icon {
  font-size: 20px;
}

/* 报警信息 */
.alarm-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  opacity: 0.9;
}

.location {
  font-weight: 500;
}

.time {
  font-size: 12px;
  opacity: 0.7;
}

/* 状态标签 */
.alarm-status {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
}

.status-badge.pending {
  background: #ef4444;
  color: white;
}

.status-badge.processing {
  background: #f59e0b;
  color: white;
}

.status-badge.resolved {
  background: #10b981;
  color: white;
}

/* 修改状态按钮 */
.change-status-btn {
  padding: 4px 12px;
  background: rgba(0, 246, 255, 0.2);
  border: 1px solid rgba(0, 246, 255, 0.5);
  border-radius: 4px;
  color: #00f6ff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.change-status-btn:hover {
  background: rgba(0, 246, 255, 0.3);
  border-color: #00f6ff;
  transform: scale(1.05);
}

/* 滚动条美化 */
.alarm-items::-webkit-scrollbar {
  width: 6px;
}

.alarm-items::-webkit-scrollbar-thumb {
  background: rgba(0, 246, 255, 0.3);
  border-radius: 3px;
}

.alarm-items::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

/* 对话框遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 对话框内容 */
.dialog-content {
  background: linear-gradient(135deg, #1a2332 0%, #0f1923 100%);
  border: 2px solid rgba(0, 246, 255, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 对话框头部 */
.dialog-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 246, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #00f6ff;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #00f6ff;
}

/* 对话框主体 */
.dialog-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 报警详情 */
.alarm-detail {
  background: rgba(0, 20, 40, 0.5);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #00f6ff;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row .label {
  color: #00f6ff;
  font-weight: bold;
  min-width: 80px;
}

.detail-row .value {
  color: #ffffff;
  flex: 1;
}

/* 状态选项 */
.status-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  color: #00f6ff;
  font-weight: bold;
  font-size: 14px;
}

.status-buttons {
  display: flex;
  gap: 12px;
}

.status-option {
  flex: 1;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.status-option.pending {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-option.pending:hover,
.status-option.pending.active {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  transform: scale(1.05);
}

.status-option.processing {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.3);
}

.status-option.processing:hover,
.status-option.processing.active {
  background: rgba(245, 158, 11, 0.3);
  border-color: #f59e0b;
  transform: scale(1.05);
}

.status-option.resolved {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-option.resolved:hover,
.status-option.resolved.active {
  background: rgba(16, 185, 129, 0.3);
  border-color: #10b981;
  transform: scale(1.05);
}

/* 对话框底部 */
.dialog-footer {
  padding: 20px;
  border-top: 1px solid rgba(0, 246, 255, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.confirm-btn {
  background: linear-gradient(135deg, #00f6ff 0%, #0099cc 100%);
  border: none;
  color: #001428;
  box-shadow: 0 4px 12px rgba(0, 246, 255, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 246, 255, 0.4);
}

/* ========== 新报警弹窗样式 ========== */
.new-alarm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s;
}

.new-alarm-popup {
  background: linear-gradient(135deg, #1a2332 0%, #0f1923 100%);
  border: 3px solid #ef4444;
  border-radius: 16px;
  width: 90%;
  max-width: 750px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.5), 0 8px 32px rgba(0, 0, 0, 0.7);
  animation: alarmPulse 2s infinite, slideUp 0.3s;
  overflow: hidden;
}

@keyframes alarmPulse {
  0%, 100% {
    box-shadow: 0 0 50px rgba(239, 68, 68, 0.5), 0 8px 32px rgba(0, 0, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 80px rgba(239, 68, 68, 0.8), 0 8px 32px rgba(0, 0, 0, 0.7);
  }
}

/* 弹窗头部 */
.popup-header {
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%);
  border-bottom: 2px solid rgba(239, 68, 68, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.alarm-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.badge-icon {
  font-size: 26px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.badge-text {
  font-size: 20px;
  font-weight: bold;
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.popup-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s;
}

.popup-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ef4444;
  color: #ef4444;
  transform: rotate(90deg);
}

/* 报警信息区域 */
.popup-info {
  padding: 16px 20px;
  background: rgba(0, 20, 40, 0.3);
  border-bottom: 1px solid rgba(0, 246, 255, 0.1);
  flex-shrink: 0;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.2);
}

.title-icon {
  font-size: 32px;
}

.title-text {
  font-size: 22px;
  font-weight: bold;
  color: #00f6ff;
  text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 3px solid #00f6ff;
}

.info-item.description {
  border-left-color: #f59e0b;
}

.item-label {
  font-size: 18px;
  flex-shrink: 0;
}

.item-value {
  font-size: 14px;
  color: #ffffff;
  line-height: 1.4;
  flex: 1;
}

.item-value.address {
  color: #94a3b8;
  font-size: 13px;
}

.item-value.coordinates {
  color: #64748b;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

/* 监控视频区域 */
.popup-video {
  padding: 16px 20px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  color: #00f6ff;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #00f6ff;
  flex-shrink: 0;
}

.video-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 300px;
  background: #000000;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(0, 246, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 视频加载效果 */
.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 246, 255, 0.1);
  border-top: 4px solid #00f6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #00f6ff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}


/* 操作按钮区域 */
.popup-actions {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.ignore-btn {
  background: rgba(100, 116, 139, 0.3);
  border-color: rgba(100, 116, 139, 0.5);
  color: #cbd5e1;
}

.ignore-btn:hover {
  background: rgba(100, 116, 139, 0.5);
  border-color: #64748b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
}

.handle-btn {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  animation: buttonGlow 2s infinite;
}

@keyframes buttonGlow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 6px 24px rgba(239, 68, 68, 0.6);
  }
}

.handle-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.6);
}

/* 滚动条样式 */
.new-alarm-popup::-webkit-scrollbar {
  width: 8px;
}

.new-alarm-popup::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.5);
  border-radius: 4px;
}

.new-alarm-popup::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .new-alarm-popup {
    width: 95%;
    max-height: 95vh;
  }
  
  .badge-text {
    font-size: 20px;
  }
  
  .title-text {
    font-size: 22px;
  }
  
  .popup-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>

