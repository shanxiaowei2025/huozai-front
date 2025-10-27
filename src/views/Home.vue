<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">智能监控大屏</span>
          <span class="subtitle">展示系统</span>
        </h1>
        <p class="hero-description">
          实时监控 · 智能分析 · 高效管理
        </p>
        <div class="hero-features">
          <div class="feature-item">
            <div class="feature-icon">📹</div>
            <div class="feature-text">视频监控</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🗺️</div>
            <div class="feature-text">GIS地图</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🚨</div>
            <div class="feature-text">实时报警</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-text">数据分析</div>
          </div>
        </div>
        <button class="cta-button" @click="goToDashboard">
          <span>进入大屏</span>
          <span class="arrow">→</span>
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">📹</div>
        <div class="stat-info">
          <div class="stat-value">500</div>
          <div class="stat-label">摄像机总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">🚨</div>
        <div class="stat-info">
          <div class="stat-value">23</div>
          <div class="stat-label">今日报警</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">✅</div>
        <div class="stat-info">
          <div class="stat-value">99.5%</div>
          <div class="stat-label">设备在线率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">⚡</div>
        <div class="stat-info">
          <div class="stat-value">98%</div>
          <div class="stat-label">处置率</div>
        </div>
      </div>
    </div>

    <!-- 功能介绍 -->
    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="card-icon">🖥️</div>
          <h3>大屏展示</h3>
          <p>多维度数据可视化展示，实时监控关键指标</p>
        </div>
        <div class="feature-card">
          <div class="card-icon">🗺️</div>
          <h3>GIS地图</h3>
          <p>地理信息系统集成，直观显示设备分布位置</p>
        </div>
        <div class="feature-card">
          <div class="card-icon">📹</div>
          <h3>视频监控</h3>
          <p>多路视频同屏显示，支持9/16/25分屏切换</p>
        </div>
        <div class="feature-card">
          <div class="card-icon">🚨</div>
          <h3>智能报警</h3>
          <p>实时报警推送，快速响应异常事件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.home {
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f1419 0%, #1a1f3a 50%, #0f1419 100%);
}

/* Hero Section */
.hero-section {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: 64px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(20deg); }
}

.subtitle {
  color: #fff;
  font-size: 48px;
}

.hero-description {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  letter-spacing: 2px;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: bounce 2s ease-in-out infinite;
}

.feature-item:nth-child(2) .feature-icon {
  animation-delay: 0.2s;
}

.feature-item:nth-child(3) .feature-icon {
  animation-delay: 0.4s;
}

.feature-item:nth-child(4) .feature-icon {
  animation-delay: 0.6s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.feature-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.cta-button {
  padding: 18px 50px;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.arrow {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.cta-button:hover .arrow {
  transform: translateX(5px);
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 40px 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 功能介绍 */
.features-section {
  padding: 60px 40px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  color: #fff;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.card-icon {
  font-size: 50px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  color: #fff;
  margin-bottom: 15px;
}

.feature-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

/* 滚动条样式 */
.home::-webkit-scrollbar {
  width: 8px;
}

.home::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.home::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.home::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

