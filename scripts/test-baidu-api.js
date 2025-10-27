#!/usr/bin/env node

/**
 * 百度地图 API 测试脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台中复制粘贴此代码
 * 2. 或在支持百度地图 API 的页面中执行
 * 
 * 功能：
 * - 测试 API 是否正常加载
 * - 测试各种搜索功能
 * - 输出详细的调试信息
 */

console.log('🚀 开始测试百度地图 API...\n')

// 测试配置
const TEST_CONFIG = {
  city: '定兴县',
  query: '小区',
  testLng: 115.808,
  testLat: 39.267,
  radius: 5000,
  pageSize: 5  // 测试时只取少量数据
}

// ========================================
// 工具函数
// ========================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const logSuccess = (msg) => console.log(`✅ ${msg}`)
const logError = (msg) => console.error(`❌ ${msg}`)
const logInfo = (msg) => console.log(`ℹ️  ${msg}`)
const logWarning = (msg) => console.warn(`⚠️  ${msg}`)

// ========================================
// 测试 1：检查百度地图 API 是否加载
// ========================================
const test1_CheckAPI = () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 测试 1：检查百度地图 API')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (typeof BMap === 'undefined') {
    logError('百度地图 API 未加载！')
    logInfo('请确认：')
    logInfo('1. index.html 中是否正确引入百度地图脚本')
    logInfo('2. 网络连接是否正常')
    logInfo('3. API Key 是否有效')
    return false
  }
  
  logSuccess('百度地图 API 已加载')
  
  // 检查版本信息
  if (typeof BMap.version !== 'undefined') {
    logInfo(`版本：${BMap.version}`)
  }
  
  // 检查必要的类是否存在
  const requiredClasses = ['Map', 'Point', 'LocalSearch', 'Geocoder']
  let allExists = true
  
  requiredClasses.forEach(className => {
    if (typeof BMap[className] === 'undefined') {
      logError(`缺少必要的类：BMap.${className}`)
      allExists = false
    } else {
      logSuccess(`类 BMap.${className} 可用`)
    }
  })
  
  return allExists
}

// ========================================
// 测试 2：创建地图实例
// ========================================
const test2_CreateMap = () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 测试 2：创建地图实例')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // 创建临时容器
    const tempDiv = document.createElement('div')
    tempDiv.id = 'temp-map-test'
    tempDiv.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;'
    document.body.appendChild(tempDiv)
    
    // 创建地图
    const map = new BMap.Map('temp-map-test')
    const point = new BMap.Point(TEST_CONFIG.testLng, TEST_CONFIG.testLat)
    map.centerAndZoom(point, 15)
    
    logSuccess('地图实例创建成功')
    
    // 清理
    document.body.removeChild(tempDiv)
    
    return true
  } catch (error) {
    logError(`地图实例创建失败：${error.message}`)
    return false
  }
}

// ========================================
// 测试 3：地理编码（地址 → 坐标）
// ========================================
const test3_Geocoding = () => {
  return new Promise((resolve) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 测试 3：地理编码（地址转坐标）')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const testAddress = `${TEST_CONFIG.city}金台路`
    logInfo(`测试地址：${testAddress}`)
    
    const geocoder = new BMap.Geocoder()
    
    geocoder.getPoint(testAddress, (point) => {
      if (!point) {
        logWarning('未找到坐标（可能是地址不够具体）')
        resolve(false)
        return
      }
      
      logSuccess(`找到坐标：${point.lng}, ${point.lat}`)
      resolve(true)
    }, TEST_CONFIG.city)
  })
}

// ========================================
// 测试 4：逆地理编码（坐标 → 地址）
// ========================================
const test4_ReverseGeocoding = () => {
  return new Promise((resolve) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 测试 4：逆地理编码（坐标转地址）')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    logInfo(`测试坐标：${TEST_CONFIG.testLng}, ${TEST_CONFIG.testLat}`)
    
    const geocoder = new BMap.Geocoder()
    const point = new BMap.Point(TEST_CONFIG.testLng, TEST_CONFIG.testLat)
    
    geocoder.getLocation(point, (result) => {
      if (!result) {
        logError('获取地址失败')
        resolve(false)
        return
      }
      
      logSuccess(`地址：${result.address}`)
      logInfo(`省份：${result.addressComponents.province}`)
      logInfo(`城市：${result.addressComponents.city}`)
      logInfo(`区县：${result.addressComponents.district}`)
      resolve(true)
    })
  })
}

// ========================================
// 测试 5：本地搜索（搜索小区）
// ========================================
const test5_LocalSearch = () => {
  return new Promise((resolve) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 测试 5：本地搜索（搜索小区）')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    logInfo(`城市：${TEST_CONFIG.city}`)
    logInfo(`关键词：${TEST_CONFIG.query}`)
    
    const localSearch = new BMap.LocalSearch(TEST_CONFIG.city, {
      onSearchComplete: (results) => {
        if (!results || localSearch.getStatus() !== BMAP_STATUS_SUCCESS) {
          logError('搜索失败或无结果')
          logWarning('可能原因：')
          logWarning('- 城市名称不正确')
          logWarning('- 关键词太具体')
          logWarning('- 该地区数据不完整')
          resolve(false)
          return
        }
        
        const count = results.getCurrentNumPois()
        logSuccess(`找到 ${count} 个结果`)
        
        // 显示前几个结果
        for (let i = 0; i < Math.min(count, 3); i++) {
          const poi = results.getPoi(i)
          console.log(`\n${i + 1}. ${poi.title}`)
          console.log(`   地址：${poi.address}`)
          console.log(`   坐标：${poi.point.lng}, ${poi.point.lat}`)
        }
        
        resolve(true)
      },
      pageCapacity: TEST_CONFIG.pageSize
    })
    
    localSearch.search(TEST_CONFIG.query)
  })
}

// ========================================
// 测试 6：附近搜索
// ========================================
const test6_NearbySearch = () => {
  return new Promise((resolve) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 测试 6：附近搜索')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    logInfo(`中心点：${TEST_CONFIG.testLng}, ${TEST_CONFIG.testLat}`)
    logInfo(`半径：${TEST_CONFIG.radius}米`)
    logInfo(`关键词：${TEST_CONFIG.query}`)
    
    const localSearch = new BMap.LocalSearch(TEST_CONFIG.city, {
      onSearchComplete: (results) => {
        if (!results || localSearch.getStatus() !== BMAP_STATUS_SUCCESS) {
          logError('附近搜索失败或无结果')
          resolve(false)
          return
        }
        
        const count = results.getCurrentNumPois()
        logSuccess(`找到 ${count} 个附近的地点`)
        
        // 显示前几个结果
        for (let i = 0; i < Math.min(count, 3); i++) {
          const poi = results.getPoi(i)
          console.log(`\n${i + 1}. ${poi.title}`)
          console.log(`   地址：${poi.address}`)
          console.log(`   坐标：${poi.point.lng}, ${poi.point.lat}`)
        }
        
        resolve(true)
      },
      pageCapacity: TEST_CONFIG.pageSize
    })
    
    const point = new BMap.Point(TEST_CONFIG.testLng, TEST_CONFIG.testLat)
    localSearch.searchNearby(TEST_CONFIG.query, point, TEST_CONFIG.radius)
  })
}

// ========================================
// 运行所有测试
// ========================================
const runAllTests = async () => {
  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║   百度地图 API 测试套件              ║')
  console.log('╚═══════════════════════════════════════╝')
  
  const results = []
  
  // 同步测试
  results.push({ name: '检查 API', passed: test1_CheckAPI() })
  
  if (!results[0].passed) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logError('API 未加载，停止后续测试')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return
  }
  
  results.push({ name: '创建地图', passed: test2_CreateMap() })
  
  // 异步测试
  await sleep(500)
  results.push({ name: '地理编码', passed: await test3_Geocoding() })
  
  await sleep(500)
  results.push({ name: '逆地理编码', passed: await test4_ReverseGeocoding() })
  
  await sleep(500)
  results.push({ name: '本地搜索', passed: await test5_LocalSearch() })
  
  await sleep(500)
  results.push({ name: '附近搜索', passed: await test6_NearbySearch() })
  
  // 汇总结果
  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║   测试结果汇总                        ║')
  console.log('╚═══════════════════════════════════════╝\n')
  
  let passedCount = 0
  results.forEach((result, index) => {
    const status = result.passed ? '✅ 通过' : '❌ 失败'
    console.log(`${index + 1}. ${result.name.padEnd(15)} ${status}`)
    if (result.passed) passedCount++
  })
  
  console.log(`\n总计：${passedCount}/${results.length} 测试通过`)
  
  if (passedCount === results.length) {
    console.log('\n🎉 所有测试通过！百度地图 API 集成成功！')
  } else {
    console.log('\n⚠️  部分测试失败，请查看上方详细信息')
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('测试完成！')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// ========================================
// 启动测试
// ========================================

// 检查是否在浏览器环境中
if (typeof window === 'undefined') {
  console.error('❌ 此脚本需要在浏览器环境中运行！')
  console.log('\n使用方法：')
  console.log('1. 打开项目页面（http://localhost:5173）')
  console.log('2. 按 F12 打开开发者工具')
  console.log('3. 切换到 Console 标签页')
  console.log('4. 复制此脚本内容并粘贴执行\n')
} else {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests)
  } else {
    // 延迟执行，确保百度地图 API 加载完成
    setTimeout(runAllTests, 1000)
  }
}

// 导出测试函数（供浏览器控制台使用）
if (typeof window !== 'undefined') {
  window.testBaiduAPI = runAllTests
  console.log('💡 提示：可以随时在控制台输入 testBaiduAPI() 重新运行测试\n')
}

