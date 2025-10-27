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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 地图实例
let map = null
const mapContainer = ref(null)

// 摄像头数据（包含经纬度）
const cameras = ref([
  { id: 1, name: 'A栋-3F', lng: 115.808, lat: 39.267, status: 'alarm', color: '#ef4444' },
  { id: 2, name: 'B栋-5F', lng: 115.805, lat: 39.270, status: 'normal', color: '#10b981' },
  { id: 3, name: 'C栋-8F', lng: 115.812, lat: 39.268, status: 'normal', color: '#10b981' },
  { id: 4, name: 'D栋-2F', lng: 115.806, lat: 39.264, status: 'normal', color: '#10b981' },
  { id: 5, name: 'E栋-12F', lng: 115.815, lat: 39.272, status: 'warning', color: '#f59e0b' }
])

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
}

// 添加摄像头标记
const addCameraMarkers = () => {
  cameras.value.forEach(camera => {
    const point = new BMap.Point(camera.lng, camera.lat)
    
    // 创建自定义图标
    const icon = new BMap.Icon(
      createMarkerIcon(camera.color),
      new BMap.Size(30, 30),
      {
        imageSize: new BMap.Size(30, 30)
      }
    )
    
    // 创建标记
    const marker = new BMap.Marker(point, { icon })
    map.addOverlay(marker)
    
    // 添加标签
    const label = new BMap.Label(camera.name, {
      offset: new BMap.Size(15, -15)
    })
    label.setStyle({
      color: '#fff',
      backgroundColor: camera.color,
      border: 'none',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: 'bold'
    })
    marker.setLabel(label)
    
    // 添加点击事件
    marker.addEventListener('click', () => {
      showCameraInfo(camera)
    })
    
    // 如果是报警状态，添加动画效果
    if (camera.status === 'alarm') {
      marker.setAnimation(BMAP_ANIMATION_BOUNCE)
    }
  })
}

// 创建标记图标（使用SVG）
const createMarkerIcon = (color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="${color}" opacity="0.8" stroke="#fff" stroke-width="2"/>
      <circle cx="15" cy="15" r="5" fill="#fff"/>
    </svg>
  `
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 显示摄像头信息
const showCameraInfo = (camera) => {
  const statusText = {
    'normal': '正常',
    'warning': '预警', 
    'alarm': '报警'
  }
  
  const infoWindow = new BMap.InfoWindow(`
    <div style="padding: 10px; min-width: 200px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">${camera.name}</h3>
      <p style="margin: 5px 0; color: #666;">
        <strong>状态：</strong>
        <span style="color: ${camera.color}; font-weight: bold;">${statusText[camera.status]}</span>
      </p>
      <p style="margin: 5px 0; color: #666;">
        <strong>位置：</strong>${camera.lng}, ${camera.lat}
      </p>
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
  if (map) {
    map = null
  }
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
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
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

