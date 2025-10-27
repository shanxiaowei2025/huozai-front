<template>
  <!-- GIS 地图组件 -->
  <div class="gis-map">
    <!-- 标题 -->
    <div class="module-title">
      <span class="icon">🗺️</span>
      <span>GIS地图监控 - 定兴县</span>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainer" id="baiduMap"></div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="dot" style="background: #10b981;"></span>
        <span>正常</span>
      </div>
      <div class="legend-item">
        <span class="dot" style="background: #f59e0b;"></span>
        <span>预警</span>
      </div>
      <div class="legend-item">
        <span class="dot" style="background: #ef4444;"></span>
        <span>报警</span>
      </div>
      <div class="legend-item unhandled" v-if="unhandledAlarmCount > 0">
        <span class="dot-unhandled">⚠️</span>
        <span>未处理报警 ({{ unhandledAlarmCount }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, inject } from 'vue'

// 注入报警数据
const alarmData = inject('alarmData', null)

// 地图实例
let map = null
const mapContainer = ref(null)
let markers = [] // 存储所有标记
let alarmMarkers = [] // 存储报警标记

// 摄像头数据（包含经纬度和报警处理状态）
const cameras = ref([
  // 摄像头数据将从后端API获取
  // 格式：{ id, name, lng, lat, status: 'normal'|'warning'|'alarm', alarmHandled: boolean, color }
])

// 计算未处理报警的数量（包括报警列表中的未处理报警）
const unhandledAlarmCount = computed(() => {
  let count = cameras.value.filter(c => c.status === 'alarm' && !c.alarmHandled).length
  
  // 添加报警列表中的未处理报警数量
  if (alarmData && alarmData.alarms.value) {
    count += alarmData.alarms.value.filter(a => a.status === 'pending').length
  }
  
  return count
})

// 初始化百度地图
const initMap = () => {
  // 检查百度地图API是否加载
  if (typeof BMap === 'undefined') {
    console.error('百度地图API未加载')
    setTimeout(initMap, 100) // 延迟重试
    return
  }

  // 创建地图实例 - 定兴县中心坐标
  map = new BMap.Map('baiduMap')
  const point = new BMap.Point(115.808, 39.267) // 定兴县经纬度
  
  // 初始化地图，设置中心点和缩放级别
  map.centerAndZoom(point, 14)
  
  // 启用地图滚轮缩放
  map.enableScrollWheelZoom(true)
  
  // 添加地图控件
  map.addControl(new BMap.NavigationControl())
  map.addControl(new BMap.ScaleControl())
  
  // 设置地图样式（深色主题）
  map.setMapStyleV2({
    styleId: '88fc243e3c7673f58c0eb37f75f26525' // 深夜蓝风格
  })
  
  // 添加摄像头标记
  addCameraMarkers()
  
  // 添加报警标记
  addAlarmMarkers()
}

// 监听报警数据变化，实时更新地图标记
if (alarmData) {
  watch(() => alarmData.alarms.value, () => {
    if (map) {
      addAlarmMarkers()
    }
  }, { deep: true })
}

// 添加报警标记（支持同位置多标记分散显示）
const addAlarmMarkers = () => {
  if (!map || !alarmData || !alarmData.alarms.value) return
  
  // 清除旧的报警标记
  alarmMarkers.forEach(item => {
    if (item.overlay) {
      map.removeOverlay(item.overlay)
    }
    if (item.timer) {
      clearInterval(item.timer)
    }
  })
  alarmMarkers = []
  
  // 按位置分组报警（检测重复坐标）
  const groupedAlarms = groupAlarmsByLocation(alarmData.alarms.value)
  
  // 为每组报警添加标记
  Object.values(groupedAlarms).forEach(group => {
    const alarms = group.alarms
    const count = alarms.length
    
    if (count === 1) {
      // 单个报警，正常显示
      addSingleAlarmMarker(alarms[0])
    } else {
      // 多个报警在同一位置，使用聚合标记或环形分散
      if (count <= 5) {
        // 少于等于5个，环形分散显示
        addCircularAlarmMarkers(alarms, group.center)
      } else {
        // 超过5个，显示聚合标记
        addClusteredAlarmMarker(alarms, group.center)
      }
    }
  })
  
  console.log('🗺️ 地图已更新报警标记:', alarmData.alarms.value.length, '个')
}

// 按位置分组报警（相同或相近位置视为同一组）
const groupAlarmsByLocation = (alarms) => {
  const groups = {}
  const threshold = 0.0005 // 约50米范围内视为同一位置
  
  alarms.forEach(alarm => {
    if (!alarm.coordinates) return
    
    // 查找是否已有相近位置的组
    let foundGroup = null
    for (const [key, group] of Object.entries(groups)) {
      const distance = Math.sqrt(
        Math.pow(group.center.lng - alarm.coordinates.lng, 2) +
        Math.pow(group.center.lat - alarm.coordinates.lat, 2)
      )
      
      if (distance < threshold) {
        foundGroup = key
        break
      }
    }
    
    if (foundGroup) {
      // 添加到现有组
      groups[foundGroup].alarms.push(alarm)
    } else {
      // 创建新组
      const key = `${alarm.coordinates.lng}_${alarm.coordinates.lat}`
      groups[key] = {
        center: { lng: alarm.coordinates.lng, lat: alarm.coordinates.lat },
        alarms: [alarm]
      }
    }
  })
  
  return groups
}

// 添加单个报警标记
const addSingleAlarmMarker = (alarm, offsetLng = 0, offsetLat = 0) => {
  const point = new BMap.Point(
    alarm.coordinates.lng + offsetLng, 
    alarm.coordinates.lat + offsetLat
  )
  
  // 根据报警状态确定颜色
  let color = '#ef4444' // 未处理 - 红色
  if (alarm.status === 'processing') {
    color = '#f59e0b' // 处理中 - 橙色
  } else if (alarm.status === 'resolved') {
    color = '#10b981' // 已处理 - 绿色
  }
  
  // 未处理的报警使用更大更醒目的图标
  const isUnhandled = alarm.status === 'pending'
  const iconSize = isUnhandled ? 50 : 35
  
  // 创建自定义图标
  const icon = new BMap.Icon(
    createAlarmIcon(alarm.icon, color, isUnhandled),
    new BMap.Size(iconSize, iconSize),
    {
      imageSize: new BMap.Size(iconSize, iconSize),
      anchor: new BMap.Size(iconSize / 2, iconSize / 2) // 设置锚点在图标中心
    }
  )
  
  // 创建标记
  const marker = new BMap.Marker(point, { icon })
  map.addOverlay(marker)
  
  // 添加标签
  const labelText = isUnhandled ? `🚨 ${alarm.location}` : alarm.location
  const label = new BMap.Label(labelText, {
    offset: new BMap.Size(0, -iconSize / 2 - 5) // 标签在图标上方，居中对齐
  })
  label.setStyle({
    color: '#fff',
    backgroundColor: color,
    border: isUnhandled ? '2px solid #fff' : 'none',
    borderRadius: '6px',
    padding: isUnhandled ? '8px 14px' : '5px 10px',
    fontSize: isUnhandled ? '13px' : '12px',
    fontWeight: 'bold',
    boxShadow: isUnhandled ? `0 0 25px ${color}` : `0 2px 8px rgba(0,0,0,0.3)`,
    whiteSpace: 'nowrap',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  })
  marker.setLabel(label)
  
  // 添加点击事件
  marker.addEventListener('click', () => {
    showAlarmInfo(alarm)
  })
  
  // 如果是未处理的报警，添加跳动和闪烁效果
  if (isUnhandled) {
    marker.setAnimation(BMAP_ANIMATION_BOUNCE)
    // 添加光圈效果
    const circle = addPulsingCircle(point, color)
    alarmMarkers.push({ overlay: marker, timer: circle.timer })
  } else {
    alarmMarkers.push({ overlay: marker })
  }
}

// 环形分散显示多个报警标记
const addCircularAlarmMarkers = (alarms, center) => {
  const radius = 0.002 // 环形半径（约200米）
  const count = alarms.length
  
  alarms.forEach((alarm, index) => {
    // 计算环形位置（均匀分布）
    const angle = (2 * Math.PI * index) / count
    const offsetLng = radius * Math.cos(angle)
    const offsetLat = radius * Math.sin(angle)
    
    // 添加偏移后的标记
    addSingleAlarmMarker(alarm, offsetLng, offsetLat)
  })
  
  // 在中心添加一个提示标记
  const centerPoint = new BMap.Point(center.lng, center.lat)
  const centerLabel = new BMap.Label(`${count}个报警`, {
    position: centerPoint
  })
  centerLabel.setStyle({
    color: '#fff',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    border: '2px solid #fff',
    borderRadius: '50%',
    padding: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
    textAlign: 'center',
    minWidth: '40px',
    minHeight: '40px',
    lineHeight: '24px'
  })
  map.addOverlay(centerLabel)
  alarmMarkers.push({ overlay: centerLabel })
}

// 添加聚合报警标记（超过5个报警时使用）
const addClusteredAlarmMarker = (alarms, center) => {
  const point = new BMap.Point(center.lng, center.lat)
  const count = alarms.length
  
  // 统计未处理报警数量
  const unhandledCount = alarms.filter(a => a.status === 'pending').length
  const hasUnhandled = unhandledCount > 0
  
  // 创建聚合图标
  const iconSize = 60
  const icon = new BMap.Icon(
    createClusterIcon(count, hasUnhandled),
    new BMap.Size(iconSize, iconSize),
    {
      imageSize: new BMap.Size(iconSize, iconSize)
    }
  )
  
  const marker = new BMap.Marker(point, { icon })
  map.addOverlay(marker)
  
  // 添加标签
  const labelText = hasUnhandled ? `🚨 ${count}个报警 (${unhandledCount}未处理)` : `${count}个报警`
  const label = new BMap.Label(labelText, {
    offset: new BMap.Size(30, -35)
  })
  label.setStyle({
    color: '#fff',
    backgroundColor: hasUnhandled ? '#ef4444' : '#f59e0b',
    border: '2px solid #fff',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 'bold',
    boxShadow: hasUnhandled ? '0 0 25px rgba(239, 68, 68, 0.8)' : '0 2px 8px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap'
  })
  marker.setLabel(label)
  
  // 点击聚合标记显示列表
  marker.addEventListener('click', () => {
    showClusteredAlarmInfo(alarms, center)
  })
  
  // 如果有未处理报警，添加动画效果
  if (hasUnhandled) {
    marker.setAnimation(BMAP_ANIMATION_BOUNCE)
    const circle = addPulsingCircle(point, '#ef4444')
    alarmMarkers.push({ overlay: marker, timer: circle.timer })
  } else {
    alarmMarkers.push({ overlay: marker })
  }
}

// 创建聚合图标
const createClusterIcon = (count, hasUnhandled) => {
  const color = hasUnhandled ? '#ef4444' : '#f59e0b'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <defs>
        <filter id="glow-cluster">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="30" cy="30" r="25" fill="${color}" opacity="0.95" stroke="#fff" stroke-width="3" filter="url(#glow-cluster)"/>
      <text x="30" y="38" font-size="22" fill="#fff" text-anchor="middle" font-weight="bold">${count}</text>
    </svg>
  `
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 显示聚合报警信息列表
const showClusteredAlarmInfo = (alarms, center) => {
  const point = new BMap.Point(center.lng, center.lat)
  
  // 按状态分组统计
  const pending = alarms.filter(a => a.status === 'pending')
  const processing = alarms.filter(a => a.status === 'processing')
  const resolved = alarms.filter(a => a.status === 'resolved')
  
  // 生成报警列表HTML
  const alarmListHtml = alarms.slice(0, 10).map(alarm => {
    const statusColor = {
      'pending': '#ef4444',
      'processing': '#f59e0b',
      'resolved': '#10b981'
    }
    return `
      <div style="padding: 8px; margin: 4px 0; background: #f9fafb; border-left: 3px solid ${statusColor[alarm.status]}; border-radius: 4px; cursor: pointer;" 
           onclick="console.log('点击报警:', '${alarm.id}')">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">${alarm.icon}</span>
          <div style="flex: 1;">
            <strong style="color: #333; font-size: 13px;">${alarm.location}</strong>
            <p style="margin: 2px 0 0 0; color: #666; font-size: 11px;">${alarm.time}</p>
          </div>
        </div>
      </div>
    `
  }).join('')
  
  const moreText = alarms.length > 10 ? `<p style="text-align: center; color: #999; font-size: 12px; margin: 8px 0;">还有 ${alarms.length - 10} 个报警...</p>` : ''
  
  const infoWindow = new BMap.InfoWindow(`
    <div style="padding: 16px; min-width: 320px; max-width: 400px; max-height: 500px; overflow-y: auto;">
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">📍 该位置共有 ${alarms.length} 个报警</h3>
        <div style="display: flex; gap: 12px; font-size: 13px;">
          <span style="color: #ef4444;">⚠️ 未处理: ${pending.length}</span>
          <span style="color: #f59e0b;">🔄 处理中: ${processing.length}</span>
          <span style="color: #10b981;">✅ 已处理: ${resolved.length}</span>
        </div>
      </div>
      <div style="max-height: 300px; overflow-y: auto;">
        ${alarmListHtml}
        ${moreText}
      </div>
    </div>
  `)
  
  map.openInfoWindow(infoWindow, point)
}

// 创建报警图标
const createAlarmIcon = (emoji, color, isUnhandled = false) => {
  const size = isUnhandled ? 50 : 35
  const emojiSize = isUnhandled ? 28 : 20
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="glow-${emoji}">
          <feGaussianBlur stdDeviation="${isUnhandled ? 3 : 2}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${color}" opacity="0.95" stroke="#fff" stroke-width="${isUnhandled ? 3 : 2}" filter="url(#glow-${emoji})"/>
      <text x="${size/2}" y="${size/2 + emojiSize/3}" font-size="${emojiSize}" text-anchor="middle">${emoji}</text>
    </svg>
  `
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 显示报警信息
const showAlarmInfo = (alarm) => {
  const statusText = {
    'pending': '⚠️ 未处置',
    'processing': '🔄 处置中',
    'resolved': '✅ 已处置'
  }
  
  const statusColor = {
    'pending': '#ef4444',
    'processing': '#f59e0b',
    'resolved': '#10b981'
  }
  
  const infoWindow = new BMap.InfoWindow(`
    <div style="padding: 16px; min-width: 280px; max-width: 400px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid ${statusColor[alarm.status]};">
        <span style="font-size: 32px; margin-right: 12px;">${alarm.icon}</span>
        <div>
          <h3 style="margin: 0; color: #333; font-size: 16px;">${alarm.type}</h3>
          <p style="margin: 4px 0 0 0; color: ${statusColor[alarm.status]}; font-weight: bold; font-size: 14px;">
            ${statusText[alarm.status]}
          </p>
        </div>
      </div>
      <div style="color: #666; line-height: 1.8;">
        <p style="margin: 8px 0; display: flex; align-items: flex-start;">
          <strong style="min-width: 70px; color: #333;">📍 位置：</strong>
          <span style="flex: 1;">${alarm.location}</span>
        </p>
        ${alarm.fullAddress ? `
          <p style="margin: 8px 0; display: flex; align-items: flex-start;">
            <strong style="min-width: 70px; color: #333;">🏠 地址：</strong>
            <span style="flex: 1; font-size: 13px; color: #888;">${alarm.fullAddress}</span>
          </p>
        ` : ''}
        <p style="margin: 8px 0; display: flex; align-items: flex-start;">
          <strong style="min-width: 70px; color: #333;">⏰ 时间：</strong>
          <span style="flex: 1;">${alarm.time}</span>
        </p>
        ${alarm.description ? `
          <p style="margin: 8px 0; display: flex; align-items: flex-start;">
            <strong style="min-width: 70px; color: #333;">📝 描述：</strong>
            <span style="flex: 1;">${alarm.description}</span>
          </p>
        ` : ''}
        ${alarm.coordinates ? `
          <p style="margin: 8px 0; display: flex; align-items: flex-start; font-family: monospace; font-size: 11px; color: #999;">
            <strong style="min-width: 70px; color: #333;">🗺️ 坐标：</strong>
            <span style="flex: 1;">${alarm.coordinates.lng.toFixed(6)}, ${alarm.coordinates.lat.toFixed(6)}</span>
          </p>
        ` : ''}
      </div>
      ${alarm.status === 'pending' ? `
        <div style="margin-top: 12px; padding: 10px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
          <span style="color: #dc2626; font-size: 13px; font-weight: bold;">⚠️ 该报警需要立即处理！</span>
        </div>
      ` : ''}
    </div>
  `)
  
  const point = new BMap.Point(alarm.coordinates.lng, alarm.coordinates.lat)
  map.openInfoWindow(infoWindow, point)
}

// 添加摄像头标记
const addCameraMarkers = () => {
  // 清除旧标记
  markers.forEach(marker => map.removeOverlay(marker))
  markers = []
  
  cameras.value.forEach(camera => {
    const point = new BMap.Point(camera.lng, camera.lat)
    
    // 判断是否为未处理报警
    const isUnhandledAlarm = camera.status === 'alarm' && !camera.alarmHandled
    
    // 创建自定义图标（未处理报警使用更大更醒目的图标）
    const iconSize = isUnhandledAlarm ? 45 : 30
    const icon = new BMap.Icon(
      createMarkerIcon(camera.color, isUnhandledAlarm),
      new BMap.Size(iconSize, iconSize),
      {
        imageSize: new BMap.Size(iconSize, iconSize)
      }
    )
    
    // 创建标记
    const marker = new BMap.Marker(point, { icon })
    map.addOverlay(marker)
    markers.push(marker)
    
    // 添加标签
    const labelText = isUnhandledAlarm ? `⚠️ ${camera.name} ⚠️` : camera.name
    const label = new BMap.Label(labelText, {
      offset: new BMap.Size(isUnhandledAlarm ? 23 : 15, isUnhandledAlarm ? -18 : -15)
    })
    label.setStyle({
      color: '#fff',
      backgroundColor: camera.color,
      border: isUnhandledAlarm ? '2px solid #fff' : 'none',
      borderRadius: '6px',
      padding: isUnhandledAlarm ? '6px 12px' : '4px 8px',
      fontSize: isUnhandledAlarm ? '14px' : '12px',
      fontWeight: 'bold',
      boxShadow: isUnhandledAlarm ? '0 0 20px rgba(239, 68, 68, 0.8)' : 'none',
      animation: isUnhandledAlarm ? 'pulse 1.5s infinite' : 'none'
    })
    marker.setLabel(label)
    
    // 添加点击事件
    marker.addEventListener('click', () => {
      showCameraInfo(camera)
    })
    
    // 如果是未处理的报警，添加跳动和闪烁效果
    if (isUnhandledAlarm) {
      marker.setAnimation(BMAP_ANIMATION_BOUNCE)
      // 添加光圈效果
      addPulsingCircle(point, camera.color)
    }
  })
}

// 添加脉动光圈效果
const addPulsingCircle = (point, color) => {
  const circle = new BMap.Circle(point, 50, {
    strokeColor: color,
    strokeWeight: 3,
    strokeOpacity: 0.8,
    fillColor: color,
    fillOpacity: 0.2
  })
  map.addOverlay(circle)
  
  // 创建动画效果
  let radius = 50
  let growing = true
  const animate = setInterval(() => {
    if (growing) {
      radius += 2
      if (radius >= 100) growing = false
    } else {
      radius -= 2
      if (radius <= 50) growing = true
    }
    circle.setRadius(radius)
  }, 50)
  
  // 存储定时器以便清理
  markers.push({ type: 'circle', overlay: circle, timer: animate })
  
  // 返回光圈和定时器
  return { overlay: circle, timer: animate }
}

// 创建标记图标（使用SVG）
const createMarkerIcon = (color, isUnhandled = false) => {
  if (isUnhandled) {
    // 未处理报警：更大的闪烁警示图标
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="22.5" cy="22.5" r="18" fill="${color}" opacity="0.9" stroke="#fff" stroke-width="3" filter="url(#glow)"/>
        <circle cx="22.5" cy="22.5" r="10" fill="#fff" opacity="0.95"/>
        <text x="22.5" y="28" font-size="16" fill="${color}" text-anchor="middle" font-weight="bold">!</text>
      </svg>
    `
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  } else {
    // 正常图标
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="12" fill="${color}" opacity="0.8" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="15" r="5" fill="#fff"/>
      </svg>
    `
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }
}

// 显示摄像头信息
const showCameraInfo = (camera) => {
  const statusText = {
    'normal': '正常',
    'warning': '预警', 
    'alarm': '报警'
  }
  
  const isUnhandled = camera.status === 'alarm' && !camera.alarmHandled
  const handledText = isUnhandled ? '<span style="color: #ef4444; font-weight: bold;">⚠️ 未处理</span>' : '<span style="color: #10b981;">✓ 已处理</span>'
  
  const infoWindow = new BMap.InfoWindow(`
    <div style="padding: 12px; min-width: 220px;">
      <h3 style="margin: 0 0 12px 0; color: #333; border-bottom: 2px solid ${camera.color}; padding-bottom: 8px;">
        ${camera.name}
      </h3>
      <p style="margin: 6px 0; color: #666; display: flex; justify-content: space-between;">
        <strong>状态：</strong>
        <span style="color: ${camera.color}; font-weight: bold;">${statusText[camera.status]}</span>
      </p>
      ${camera.status === 'alarm' ? `
        <p style="margin: 6px 0; color: #666; display: flex; justify-content: space-between;">
          <strong>处理状态：</strong>
          ${handledText}
        </p>
      ` : ''}
      <p style="margin: 6px 0; color: #666;">
        <strong>位置：</strong>${camera.lng}, ${camera.lat}
      </p>
      ${isUnhandled ? `
        <div style="margin-top: 10px; padding: 8px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
          <span style="color: #dc2626; font-size: 12px;">⚠️ 需要立即处理！</span>
        </div>
      ` : ''}
    </div>
  `)
  
  const point = new BMap.Point(camera.lng, camera.lat)
  map.openInfoWindow(infoWindow, point)
}

// 组件挂载时初始化地图
onMounted(() => {
  initMap()
})

// 组件卸载时清理
onUnmounted(() => {
  // 清理所有定时器
  markers.forEach(item => {
    if (item.timer) {
      clearInterval(item.timer)
    }
  })
  
  // 清理报警标记的定时器
  alarmMarkers.forEach(item => {
    if (item.timer) {
      clearInterval(item.timer)
    }
  })
  
  if (map) {
    map = null
  }
})

// 暴露更新方法供外部调用
const updateCameraStatus = (cameraId, status, alarmHandled) => {
  const camera = cameras.value.find(c => c.id === cameraId)
  if (camera) {
    camera.status = status
    camera.alarmHandled = alarmHandled
    // 更新颜色
    if (status === 'alarm') camera.color = '#ef4444'
    else if (status === 'warning') camera.color = '#f59e0b'
    else camera.color = '#10b981'
    
    // 重新绘制标记
    if (map) {
      addCameraMarkers()
    }
  }
}

defineExpose({
  updateCameraStatus
})
</script>

<style scoped>
/* GIS 地图容器 */
.gis-map {
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

/* 地图容器 */
.map-container {
  flex: 1;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

/* 百度地图容器 */
#baiduMap {
  width: 100%;
  height: 100%;
}

/* 图例 */
.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  background: rgba(0, 20, 40, 0.3);
  border-radius: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s;
}

.legend-item:hover {
  transform: scale(1.05);
}

/* 未处理报警图例项 - 突出显示 */
.legend-item.unhandled {
  background: rgba(239, 68, 68, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  border: 2px solid #ef4444;
  color: #fff;
  font-weight: bold;
  animation: pulse-legend 2s infinite;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot-unhandled {
  font-size: 16px;
  animation: shake 0.5s infinite;
}

/* 脉冲动画 */
@keyframes pulse-legend {
  0%, 100% {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
  }
}

/* 抖动动画 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* 自定义百度地图信息窗口样式 */
:deep(.BMap_bubble_content) {
  background: #fff;
  border-radius: 8px;
}

:deep(.BMap_pop) {
  border-radius: 8px;
  overflow: hidden;
}
</style>

