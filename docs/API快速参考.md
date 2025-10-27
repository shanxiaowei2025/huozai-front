# 🔖 百度地图 API 快速参考卡片

> 快速查找常用 API 和代码片段

---

## 📦 导入服务

```javascript
import {
  searchCommunities,          // 按城市搜索小区
  searchNearbyCommunities,    // 搜索附近小区
  getCommunityDetail,         // 获取小区详情
  getLocationByAddress,       // 地址 → 坐标
  getAddressByLocation        // 坐标 → 地址
} from '@/services/baiduMapService'
```

---

## 🏘️ 搜索小区

### 按城市搜索

```javascript
const result = await searchCommunities({
  city: '定兴县',       // 城市名称
  query: '小区',        // 搜索关键词
  pageSize: 20         // 返回数量
})

// 返回格式
[
  {
    id: 'community_1',
    name: '阳光小区',
    address: '定兴县XX路XX号',
    lng: 115.808,
    lat: 39.267,
    cameraCount: 8
  },
  // ...
]
```

### 搜索附近

```javascript
const result = await searchNearbyCommunities({
  lng: 115.808,        // 中心点经度
  lat: 39.267,         // 中心点纬度
  radius: 5000,        // 半径（米）
  pageSize: 20         // 返回数量
})

// 返回格式（增加 distance 字段）
[
  {
    id: 'community_1',
    name: '阳光小区',
    distance: 1250,    // 距离中心点的距离（米）
    // ...其他字段同上
  }
]
```

---

## 📍 地理编码

### 地址转坐标

```javascript
const location = await getLocationByAddress('定兴县金台路88号', '定兴县')

// 返回
{
  lng: 115.808,
  lat: 39.267,
  address: '定兴县金台路88号'
}
```

### 坐标转地址

```javascript
const info = await getAddressByLocation(115.808, 39.267)

// 返回
{
  address: '河北省保定市定兴县...',
  province: '河北省',
  city: '保定市',
  district: '定兴县',
  street: '金台路',
  streetNumber: '88号'
}
```

---

## 🔍 获取详情

```javascript
const detail = await getCommunityDetail('阳光小区', '定兴县')

// 返回
{
  id: 'community_1',
  name: '阳光小区',
  address: '定兴县XX路XX号',
  city: '定兴县',
  province: '河北省',
  lng: 115.808,
  lat: 39.267,
  cameraCount: 8
}
```

---

## 🎨 在 Vue 组件中使用

### 基础模板

```vue
<template>
  <div>
    <button @click="load" :disabled="loading">
      {{ loading ? '加载中...' : '加载数据' }}
    </button>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <ul v-if="data.length">
      <li v-for="item in data" :key="item.id">
        {{ item.name }} - {{ item.address }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchCommunities } from '@/services/baiduMapService'

const data = ref([])
const loading = ref(false)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  
  try {
    data.value = await searchCommunities({
      city: '定兴县',
      query: '小区',
      pageSize: 20
    })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
```

### 组件挂载时自动加载

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { searchCommunities } from '@/services/baiduMapService'

const data = ref([])

onMounted(async () => {
  // 延迟 1 秒确保百度地图 API 加载完成
  setTimeout(async () => {
    try {
      data.value = await searchCommunities({
        city: '定兴县',
        query: '小区',
        pageSize: 20
      })
    } catch (err) {
      console.error('加载失败', err)
    }
  }, 1000)
})
</script>
```

---

## ⚠️ 错误处理

### 基础错误处理

```javascript
try {
  const result = await searchCommunities({ ... })
} catch (error) {
  if (error.message === '百度地图API未加载') {
    // API 未加载
    console.error('请检查网络和 API Key')
  } else if (error.message.includes('搜索失败')) {
    // 搜索失败
    console.error('请检查城市名称和关键词')
  } else {
    // 其他错误
    console.error('未知错误', error)
  }
}
```

### 带重试的错误处理

```javascript
const searchWithRetry = async (options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await searchCommunities(options)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      // 指数退避：1s, 2s, 4s
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
}
```

### 带降级的错误处理

```javascript
const loadData = async () => {
  try {
    // 尝试从 API 加载
    return await searchCommunities({ ... })
  } catch (error) {
    console.warn('API 失败，使用备用数据', error)
    
    // 降级到备用数据
    return [
      { id: '1', name: 'A小区', address: '...' },
      { id: '2', name: 'B小区', address: '...' }
    ]
  }
}
```

---

## 🚀 性能优化

### 添加缓存

```javascript
const cache = new Map()

const searchWithCache = async (city, query) => {
  const key = `${city}_${query}`
  
  // 检查缓存
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  // 从 API 获取
  const result = await searchCommunities({ city, query, pageSize: 20 })
  
  // 存入缓存（5分钟）
  cache.set(key, result)
  setTimeout(() => cache.delete(key), 5 * 60 * 1000)
  
  return result
}
```

### 批量查询

```javascript
const batchQuery = async (communities) => {
  const promises = communities.map(name => 
    getCommunityDetail(name, '定兴县')
  )
  
  return await Promise.all(promises)
}
```

### 防抖搜索

```javascript
import { ref, watch } from 'vue'

const searchQuery = ref('')
const searchResults = ref([])
let timeoutId = null

watch(searchQuery, (newQuery) => {
  clearTimeout(timeoutId)
  
  timeoutId = setTimeout(async () => {
    if (newQuery) {
      searchResults.value = await searchCommunities({
        city: '定兴县',
        query: newQuery,
        pageSize: 10
      })
    }
  }, 500)  // 500ms 防抖
})
```

---

## 📊 常用工具函数

### 计算两点距离

```javascript
const getDistance = (lng1, lat1, lng2, lat2) => {
  const R = 6371e3  // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c  // 返回米
}
```

### 过滤指定距离内的小区

```javascript
const filterByDistance = (communities, centerLng, centerLat, maxDistance) => {
  return communities.filter(community => {
    const distance = getDistance(
      centerLng, centerLat,
      community.lng, community.lat
    )
    return distance <= maxDistance
  })
}
```

### 按距离排序

```javascript
const sortByDistance = (communities, centerLng, centerLat) => {
  return communities.sort((a, b) => {
    const distA = getDistance(centerLng, centerLat, a.lng, a.lat)
    const distB = getDistance(centerLng, centerLat, b.lng, b.lat)
    return distA - distB
  })
}
```

---

## 🔧 配置说明

### API Key 配置

在 `index.html` 中：

```html
<script src="https://api.map.baidu.com/api?v=3.0&ak=你的API_KEY"></script>
```

### 默认参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `pageSize` | 10 | 搜索结果数量 |
| `radius` | 5000 | 搜索半径（米） |
| `cameraCount` | 8-12 | 每个小区的摄像头数量 |

### 修改默认参数

在 `src/services/baiduMapService.js` 中：

```javascript
const DEFAULT_PAGE_SIZE = 20  // 修改默认数量
const DEFAULT_RADIUS = 10000  // 修改默认半径
```

---

## 🐛 常见问题速查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| API 未加载 | 网络问题/Key 错误 | 检查网络和 API Key |
| 搜索无结果 | 城市名错误/关键词太具体 | 使用完整城市名和宽泛关键词 |
| CORS 错误 | 域名未配置白名单 | 在百度地图平台添加域名 |
| 加载慢 | 请求数据量大 | 减少 pageSize 或添加缓存 |

---

## 🔗 快速链接

- [完整文档](./百度地图API集成说明.md)
- [使用示例](./百度地图API使用示例.js)
- [快速开始](./快速开始.md)
- [文档中心](./README.md)

---

## 💡 提示

- 📌 新手建议先阅读 [快速开始指南](./快速开始.md)
- 📚 完整功能请查看 [API集成说明](./百度地图API集成说明.md)
- 💻 需要示例代码请查看 [使用示例](./百度地图API使用示例.js)
- 🧪 调试问题请使用 [测试工具](../scripts/test-baidu-api.js)

---

**保存此页面以便快速查找！** 🔖

