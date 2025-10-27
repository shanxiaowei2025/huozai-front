# 📍 百度地图 API 集成说明

## 🎯 功能概述

项目已集成百度地图 API，可以动态获取指定区域的小区数据，并自动生成监控摄像头信息。

## 🔑 API 密钥配置

当前使用的百度地图 API Key：
```
nsnFL3cWD3LiBc9MFnEADJlKU4ezNc6Y
```

### 修改 API Key

如需更换 API Key，请编辑 `index.html` 文件：

```html
<!-- 百度地图 API -->
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=你的API_KEY"></script>
```

### 申请新的 API Key

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册/登录账号
3. 进入"控制台" > "应用管理" > "我的应用"
4. 创建应用，选择"浏览器端"
5. 复制生成的 AK（API Key）

## 📦 服务模块

### `src/services/baiduMapService.js`

提供以下功能：

#### 1. 搜索城市内的小区

```javascript
import { searchCommunities } from '@/services/baiduMapService'

const result = await searchCommunities({
  city: '定兴县',      // 城市名称
  query: '小区',       // 搜索关键词
  pageSize: 20        // 返回数量
})
```

**返回数据格式：**
```javascript
[
  {
    id: 'community_1',
    name: '阳光小区',
    address: '定兴县XX路XX号',
    lng: 115.808,       // 经度
    lat: 39.267,        // 纬度
    cameraCount: 8      // 摄像头数量
  },
  // ...更多小区
]
```

#### 2. 搜索附近的小区

```javascript
import { searchNearbyCommunities } from '@/services/baiduMapService'

const result = await searchNearbyCommunities({
  lng: 115.808,        // 中心点经度
  lat: 39.267,         // 中心点纬度
  radius: 5000,        // 搜索半径（米）
  pageSize: 20         // 返回数量
})
```

**返回数据格式：**
```javascript
[
  {
    id: 'community_1',
    name: '阳光小区',
    address: '定兴县XX路XX号',
    lng: 115.808,
    lat: 39.267,
    distance: 1250,     // 距离中心点的距离（米）
    cameraCount: 8
  },
  // ...更多小区
]
```

#### 3. 获取小区详细信息

```javascript
import { getCommunityDetail } from '@/services/baiduMapService'

const detail = await getCommunityDetail('阳光小区', '定兴县')
```

#### 4. 地理编码和逆编码

```javascript
import { 
  getLocationByAddress,    // 地址 → 经纬度
  getAddressByLocation     // 经纬度 → 地址
} from '@/services/baiduMapService'

// 地址转经纬度
const location = await getLocationByAddress('定兴县XX路XX号')
// 返回: { lng: 115.808, lat: 39.267, address: '...' }

// 经纬度转地址
const address = await getAddressByLocation(115.808, 39.267)
// 返回: { address: '...', city: '保定市', district: '定兴县', ... }
```

## 🎬 VideoWall 组件使用

`VideoWall.vue` 组件已自动集成百度地图 API：

### 工作流程

1. **组件挂载时**：自动调用 `loadCommunities()` 从百度地图 API 加载小区数据
2. **加载成功**：显示真实小区名称和位置信息
3. **加载失败**：自动降级到备用数据（A/B/C/D小区）
4. **生成摄像头**：根据小区数量自动生成模拟摄像头数据

### 关键代码

```vue
<script setup>
import { searchCommunities } from '@/services/baiduMapService'

// 组件挂载时加载
onMounted(() => {
  setTimeout(() => {
    loadCommunities()
  }, 1000) // 延迟1秒确保百度地图 API 加载完成
})

// 加载小区数据
const loadCommunities = async () => {
  try {
    const result = await searchCommunities({
      city: '定兴县',
      query: '小区',
      pageSize: 20
    })
    
    communities.value = result
    generateCamerasForCommunities(result)
  } catch (err) {
    useFallbackData() // 使用备用数据
  }
}
</script>
```

### UI 状态展示

- **加载中**：显示 "⏳ 正在从百度地图加载小区数据..."
- **加载失败**：显示 "⚠️ 错误信息 - 已使用备用数据"
- **加载成功**：显示小区标签列表

## 🔧 自定义配置

### 修改搜索城市

编辑 `VideoWall.vue` 中的 `loadCommunities` 函数：

```javascript
const result = await searchCommunities({
  city: '你的城市',  // 修改这里
  query: '小区',
  pageSize: 20
})
```

### 修改搜索关键词

```javascript
const result = await searchCommunities({
  city: '定兴县',
  query: '住宅小区',  // 可以改为：小区、花园、公寓等
  pageSize: 20
})
```

### 使用附近搜索模式

在 `VideoWall.vue` 中取消注释：

```javascript
// 方法2：搜索附近的小区
const result = await searchNearbyCommunities({
  lng: 115.808,      // 定兴县中心经度
  lat: 39.267,       // 定兴县中心纬度
  radius: 10000,     // 10公里半径
  pageSize: 20
})
```

### 修改摄像头生成规则

编辑 `generateCamerasForCommunities` 函数：

```javascript
const generateCamerasForCommunities = (communitiesList) => {
  communitiesList.forEach((community) => {
    const cameraCount = community.cameraCount || 10
    
    for (let i = 0; i < cameraCount; i++) {
      // 自定义摄像头命名规则
      const floors = ['1F', '2F', '3F', '4F', '5F']
      const hasAlarm = Math.random() < 0.1  // 调整报警概率
      
      newVideos.push({
        name: `${community.name}-${floors[i % floors.length]}`,
        community: community.id,
        hasAlarm: hasAlarm,
        // ...更多配置
      })
    }
  })
}
```

## 🐛 常见问题

### 1. 百度地图 API 未加载

**错误提示：** `百度地图 API 未加载`

**解决方案：**
- 检查网络连接
- 确认 `index.html` 中的 API Key 是否正确
- 检查浏览器控制台是否有 CORS 错误
- 增加加载延迟时间（在 `onMounted` 中）

### 2. 搜索无结果

**原因：**
- 城市名称不正确
- 关键词太具体
- 该地区百度地图数据不完整

**解决方案：**
```javascript
// 尝试更宽泛的搜索词
query: '小区|住宅|花园'

// 或扩大搜索范围
radius: 20000  // 20公里
```

### 3. 自动降级到备用数据

这是正常的容错机制，不影响系统运行。如需调试：

```javascript
try {
  const result = await searchCommunities(...)
  console.log('搜索结果：', result)
} catch (err) {
  console.error('详细错误：', err)
}
```

## 📊 数据流程图

```
用户访问页面
    ↓
组件挂载 (onMounted)
    ↓
延迟 1 秒
    ↓
调用 loadCommunities()
    ↓
调用百度地图 API
    ↓
    ├─→ 成功
    │      ↓
    │   获取小区列表
    │      ↓
    │   生成摄像头数据
    │      ↓
    │   显示小区标签
    │
    └─→ 失败
           ↓
        使用备用数据
           ↓
        显示错误提示
```

## 🚀 性能优化建议

1. **缓存结果**：将小区数据缓存到 localStorage
2. **分页加载**：一次只加载部分小区，需要时再加载
3. **防抖处理**：搜索时添加防抖，避免频繁请求
4. **并行请求**：同时请求多个城市的数据

## 🔗 相关链接

- [百度地图开放平台](https://lbsyun.baidu.com/)
- [JavaScript API 文档](https://lbsyun.baidu.com/index.php?title=jspopular3.0)
- [Place API 文档](https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/search)

## 📝 更新日志

- **2025-10-27**：初始版本，实现小区数据动态加载
- 集成百度地图 Place API
- 添加容错机制和备用数据
- 支持城市搜索和附近搜索两种模式

---

💡 **提示**：如需更多自定义功能，请参考百度地图 API 官方文档或联系开发团队。

