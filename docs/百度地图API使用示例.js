/**
 * 百度地图 API 使用示例
 * 展示如何在不同场景下使用百度地图服务
 */

import {
  searchCommunities,
  searchNearbyCommunities,
  getCommunityDetail,
  getLocationByAddress,
  getAddressByLocation
} from '@/services/baiduMapService'

// ========================================
// 示例 1：搜索城市内的小区
// ========================================
export const example1_SearchByCity = async () => {
  console.log('=== 示例1：按城市搜索小区 ===')
  
  try {
    const communities = await searchCommunities({
      city: '定兴县',
      query: '小区',
      pageSize: 10
    })
    
    console.log(`找到 ${communities.length} 个小区：`)
    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.name}`)
      console.log(`   地址：${community.address}`)
      console.log(`   坐标：${community.lng}, ${community.lat}`)
      console.log(`   摄像头：${community.cameraCount} 个`)
    })
    
    return communities
  } catch (error) {
    console.error('搜索失败：', error)
  }
}

// ========================================
// 示例 2：搜索指定坐标附近的小区
// ========================================
export const example2_SearchNearby = async () => {
  console.log('=== 示例2：搜索附近小区 ===')
  
  try {
    // 定兴县中心坐标
    const centerLng = 115.808
    const centerLat = 39.267
    
    const communities = await searchNearbyCommunities({
      lng: centerLng,
      lat: centerLat,
      radius: 5000,  // 5公里
      pageSize: 10
    })
    
    console.log(`在 (${centerLng}, ${centerLat}) 附近 5km 内找到 ${communities.length} 个小区：`)
    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.name}`)
      console.log(`   距离：${community.distance} 米`)
      console.log(`   坐标：${community.lng}, ${community.lat}`)
    })
    
    return communities
  } catch (error) {
    console.error('搜索失败：', error)
  }
}

// ========================================
// 示例 3：获取小区详细信息
// ========================================
export const example3_GetCommunityDetail = async (communityName) => {
  console.log('=== 示例3：获取小区详情 ===')
  
  try {
    const detail = await getCommunityDetail(communityName, '定兴县')
    
    console.log(`${detail.name} 的详细信息：`)
    console.log(`ID：${detail.id}`)
    console.log(`地址：${detail.address}`)
    console.log(`城市：${detail.city}`)
    console.log(`省份：${detail.province}`)
    console.log(`坐标：${detail.lng}, ${detail.lat}`)
    
    return detail
  } catch (error) {
    console.error('获取详情失败：', error)
  }
}

// ========================================
// 示例 4：地址转经纬度（地理编码）
// ========================================
export const example4_AddressToLocation = async (address) => {
  console.log('=== 示例4：地址转经纬度 ===')
  
  try {
    const location = await getLocationByAddress(address, '定兴县')
    
    console.log(`地址：${address}`)
    console.log(`经度：${location.lng}`)
    console.log(`纬度：${location.lat}`)
    
    return location
  } catch (error) {
    console.error('地理编码失败：', error)
  }
}

// ========================================
// 示例 5：经纬度转地址（逆地理编码）
// ========================================
export const example5_LocationToAddress = async (lng, lat) => {
  console.log('=== 示例5：经纬度转地址 ===')
  
  try {
    const addressInfo = await getAddressByLocation(lng, lat)
    
    console.log(`坐标：${lng}, ${lat}`)
    console.log(`详细地址：${addressInfo.address}`)
    console.log(`省份：${addressInfo.province}`)
    console.log(`城市：${addressInfo.city}`)
    console.log(`区县：${addressInfo.district}`)
    console.log(`街道：${addressInfo.street}`)
    
    return addressInfo
  } catch (error) {
    console.error('逆地理编码失败：', error)
  }
}

// ========================================
// 示例 6：在 Vue 组件中使用
// ========================================
export const example6_VueComponent = `
<template>
  <div class="community-search">
    <input v-model="searchQuery" placeholder="输入城市名称" />
    <button @click="search">搜索小区</button>
    
    <div v-if="loading">加载中...</div>
    
    <ul v-else>
      <li v-for="community in communities" :key="community.id">
        {{ community.name }} - {{ community.address }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchCommunities } from '@/services/baiduMapService'

const searchQuery = ref('定兴县')
const communities = ref([])
const loading = ref(false)

const search = async () => {
  loading.value = true
  try {
    const result = await searchCommunities({
      city: searchQuery.value,
      query: '小区',
      pageSize: 20
    })
    communities.value = result
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    loading.value = false
  }
}
</script>
`

// ========================================
// 示例 7：批量查询多个小区的详情
// ========================================
export const example7_BatchQuery = async (communityNames) => {
  console.log('=== 示例7：批量查询小区 ===')
  
  try {
    const promises = communityNames.map(name => 
      getCommunityDetail(name, '定兴县')
    )
    
    const results = await Promise.all(promises)
    
    console.log(`成功查询 ${results.length} 个小区：`)
    results.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.name} - ${detail.address}`)
    })
    
    return results
  } catch (error) {
    console.error('批量查询失败：', error)
  }
}

// ========================================
// 示例 8：带缓存的小区搜索
// ========================================
export const example8_SearchWithCache = (() => {
  const cache = new Map()
  
  return async (city, query) => {
    console.log('=== 示例8：带缓存的搜索 ===')
    
    const cacheKey = `${city}_${query}`
    
    // 检查缓存
    if (cache.has(cacheKey)) {
      console.log('从缓存中获取数据')
      return cache.get(cacheKey)
    }
    
    // 从 API 获取
    console.log('从 API 获取数据')
    try {
      const result = await searchCommunities({ city, query, pageSize: 20 })
      
      // 存入缓存（缓存 5 分钟）
      cache.set(cacheKey, result)
      setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000)
      
      return result
    } catch (error) {
      console.error('搜索失败：', error)
    }
  }
})()

// ========================================
// 示例 9：计算小区覆盖范围
// ========================================
export const example9_CalculateCoverage = async (city) => {
  console.log('=== 示例9：计算小区覆盖范围 ===')
  
  try {
    const communities = await searchCommunities({
      city,
      query: '小区',
      pageSize: 50
    })
    
    if (communities.length === 0) {
      console.log('未找到小区数据')
      return
    }
    
    // 计算经纬度范围
    const lngs = communities.map(c => c.lng)
    const lats = communities.map(c => c.lat)
    
    const bounds = {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      centerLat: (Math.min(...lats) + Math.max(...lats)) / 2
    }
    
    console.log(`${city} 小区分布范围：`)
    console.log(`经度：${bounds.minLng.toFixed(6)} ~ ${bounds.maxLng.toFixed(6)}`)
    console.log(`纬度：${bounds.minLat.toFixed(6)} ~ ${bounds.maxLat.toFixed(6)}`)
    console.log(`中心点：${bounds.centerLng.toFixed(6)}, ${bounds.centerLat.toFixed(6)}`)
    
    return bounds
  } catch (error) {
    console.error('计算失败：', error)
  }
}

// ========================================
// 示例 10：错误处理和重试机制
// ========================================
export const example10_SearchWithRetry = async (options, maxRetries = 3) => {
  console.log('=== 示例10：带重试的搜索 ===')
  
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`尝试第 ${i + 1} 次...`)
      const result = await searchCommunities(options)
      console.log('搜索成功！')
      return result
    } catch (error) {
      console.warn(`第 ${i + 1} 次尝试失败：`, error.message)
      lastError = error
      
      // 等待一段时间后重试
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 // 指数退避：1s, 2s, 4s
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error(`所有重试都失败了`)
  throw lastError
}

// ========================================
// 测试所有示例
// ========================================
export const runAllExamples = async () => {
  console.log('🚀 开始运行所有示例...\n')
  
  // 示例 1
  await example1_SearchByCity()
  console.log('\n')
  
  // 示例 2
  await example2_SearchNearby()
  console.log('\n')
  
  // 示例 3
  await example3_GetCommunityDetail('阳光小区')
  console.log('\n')
  
  // 示例 4
  await example4_AddressToLocation('定兴县金台路88号')
  console.log('\n')
  
  // 示例 5
  await example5_LocationToAddress(115.808, 39.267)
  console.log('\n')
  
  // 示例 7
  await example7_BatchQuery(['阳光小区', '金地花园', '碧桂园'])
  console.log('\n')
  
  // 示例 8
  await example8_SearchWithCache('定兴县', '小区')
  console.log('\n')
  
  // 示例 9
  await example9_CalculateCoverage('定兴县')
  console.log('\n')
  
  console.log('✅ 所有示例运行完成！')
}

// 导出所有示例
export default {
  example1_SearchByCity,
  example2_SearchNearby,
  example3_GetCommunityDetail,
  example4_AddressToLocation,
  example5_LocationToAddress,
  example7_BatchQuery,
  example8_SearchWithCache,
  example9_CalculateCoverage,
  example10_SearchWithRetry,
  runAllExamples
}

