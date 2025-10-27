/**
 * 百度地图 API 服务
 * 提供地点搜索、小区查询等功能
 */

/**
 * 搜索指定区域内的小区
 * @param {Object} options - 搜索选项
 * @param {string} options.city - 城市名称，如 "定兴县"
 * @param {string} options.query - 搜索关键词，默认 "小区"
 * @param {number} options.pageSize - 每页结果数，默认 10
 * @returns {Promise<Array>} 小区列表
 */
export const searchCommunities = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 检查百度地图 API 是否加载
    if (typeof BMap === 'undefined') {
      reject(new Error('百度地图 API 未加载'))
      return
    }

    const {
      city = '定兴县',
      query = '小区',
      pageSize = 10
    } = options

    // 创建地点搜索实例
    const localSearch = new BMap.LocalSearch(city, {
      pageCapacity: pageSize,
      onSearchComplete: (results) => {
        if (localSearch.getStatus() === BMAP_STATUS_SUCCESS) {
          const communities = []
          
          // 遍历搜索结果
          for (let i = 0; i < results.getCurrentNumPois(); i++) {
            const poi = results.getPoi(i)
            
            communities.push({
              id: `community_${i + 1}`,
              name: poi.title,
              address: poi.address,
              lng: poi.point.lng,
              lat: poi.point.lat,
              // 模拟摄像头数量（实际应该从后端获取）
              cameraCount: Math.floor(Math.random() * 10) + 5
            })
          }
          
          resolve(communities)
        } else {
          reject(new Error('搜索失败'))
        }
      }
    })

    // 执行搜索
    localSearch.search(query)
  })
}

/**
 * 搜索指定坐标附近的小区
 * @param {Object} options - 搜索选项
 * @param {number} options.lng - 经度
 * @param {number} options.lat - 纬度
 * @param {number} options.radius - 搜索半径（米），默认 5000
 * @param {number} options.pageSize - 每页结果数，默认 10
 * @returns {Promise<Array>} 小区列表
 */
export const searchNearbyCommunities = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof BMap === 'undefined') {
      reject(new Error('百度地图 API 未加载'))
      return
    }

    const {
      lng = 115.808,
      lat = 39.267,
      radius = 5000,
      pageSize = 10
    } = options

    // 创建中心点
    const center = new BMap.Point(lng, lat)
    
    // 创建本地搜索实例
    const localSearch = new BMap.LocalSearch('定兴县', {
      pageCapacity: pageSize,
      onSearchComplete: (results) => {
        if (localSearch.getStatus() === BMAP_STATUS_SUCCESS) {
          const communities = []
          
          for (let i = 0; i < results.getCurrentNumPois(); i++) {
            const poi = results.getPoi(i)
            
            // 计算距离
            const poiPoint = new BMap.Point(poi.point.lng, poi.point.lat)
            const distance = calculateDistance(center, poiPoint)
            
            // 只返回指定半径内的结果
            if (distance <= radius) {
              communities.push({
                id: `community_${i + 1}`,
                name: poi.title,
                address: poi.address,
                lng: poi.point.lng,
                lat: poi.point.lat,
                distance: Math.round(distance),
                cameraCount: Math.floor(Math.random() * 10) + 5
              })
            }
          }
          
          resolve(communities)
        } else {
          reject(new Error('搜索失败'))
        }
      }
    })

    // 执行附近搜索
    localSearch.searchNearby('小区', center, radius)
  })
}

/**
 * 根据小区名称搜索详细信息
 * @param {string} communityName - 小区名称
 * @param {string} city - 城市名称
 * @returns {Promise<Object>} 小区详细信息
 */
export const getCommunityDetail = (communityName, city = '定兴县') => {
  return new Promise((resolve, reject) => {
    if (typeof BMap === 'undefined') {
      reject(new Error('百度地图 API 未加载'))
      return
    }

    const localSearch = new BMap.LocalSearch(city, {
      onSearchComplete: (results) => {
        if (localSearch.getStatus() === BMAP_STATUS_SUCCESS && results.getCurrentNumPois() > 0) {
          const poi = results.getPoi(0)
          
          resolve({
            id: poi.uid || `community_${Date.now()}`,
            name: poi.title,
            address: poi.address,
            lng: poi.point.lng,
            lat: poi.point.lat,
            city: poi.city,
            province: poi.province
          })
        } else {
          reject(new Error('未找到该小区'))
        }
      }
    })

    localSearch.search(communityName)
  })
}

/**
 * 计算两点之间的距离（米）
 * @param {BMap.Point} point1 - 点1
 * @param {BMap.Point} point2 - 点2
 * @returns {number} 距离（米）
 */
const calculateDistance = (point1, point2) => {
  if (typeof BMap === 'undefined') return 0
  
  const map = new BMap.Map()
  return map.getDistance(point1, point2)
}

/**
 * 地理编码：根据地址获取经纬度
 * @param {string} address - 地址
 * @param {string} city - 城市
 * @returns {Promise<Object>} 包含经纬度的对象
 */
export const getLocationByAddress = (address, city = '定兴县') => {
  return new Promise((resolve, reject) => {
    if (typeof BMap === 'undefined') {
      reject(new Error('百度地图 API 未加载'))
      return
    }

    const geocoder = new BMap.Geocoder()
    
    geocoder.getPoint(address, (point) => {
      if (point) {
        resolve({
          lng: point.lng,
          lat: point.lat,
          address
        })
      } else {
        reject(new Error('地址解析失败'))
      }
    }, city)
  })
}

/**
 * 逆地理编码：根据经纬度获取地址
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise<Object>} 地址信息
 */
export const getAddressByLocation = (lng, lat) => {
  return new Promise((resolve, reject) => {
    if (typeof BMap === 'undefined') {
      reject(new Error('百度地图 API 未加载'))
      return
    }

    const geocoder = new BMap.Geocoder()
    const point = new BMap.Point(lng, lat)
    
    geocoder.getLocation(point, (result) => {
      if (result) {
        resolve({
          address: result.address,
          city: result.addressComponents.city,
          district: result.addressComponents.district,
          province: result.addressComponents.province,
          street: result.addressComponents.street,
          streetNumber: result.addressComponents.streetNumber
        })
      } else {
        reject(new Error('位置解析失败'))
      }
    })
  })
}

export default {
  searchCommunities,
  searchNearbyCommunities,
  getCommunityDetail,
  getLocationByAddress,
  getAddressByLocation
}

