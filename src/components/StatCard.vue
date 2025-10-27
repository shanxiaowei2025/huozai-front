<template>
  <!-- 统计卡片组件 -->
  <div class="stat-card" :style="{ background: cardBg }">
    <!-- 装饰性背景图案 -->
    <div class="card-pattern"></div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <div class="card-header">
        <span class="icon">{{ icon }}</span>
        <span class="title">{{ title }}</span>
      </div>
      <div class="card-value">{{ value }}</div>
    </div>

    <!-- 发光效果 -->
    <div class="glow" :style="{ background: glowColor }"></div>
  </div>
</template>

<script setup>
// defineProps 用于接收父组件传递的数据
// 这是 Vue3 的新语法，无需手动声明
const props = defineProps({
  icon: {
    type: String,      // 图标（emoji）
    required: true     // 必填
  },
  title: {
    type: String,      // 卡片标题
    required: true
  },
  value: {
    type: [String, Number], // 值可以是字符串或数字
    required: true
  },
  color: {
    type: String,      // 主题颜色
    default: '#06b6d4' // 默认值
  }
})

// 计算卡片背景渐变色
const cardBg = `linear-gradient(135deg, ${props.color}99, ${props.color}66)`
// 计算发光效果颜色
const glowColor = `${props.color}33`
</script>

<style scoped>
/* 统计卡片容器 */
.stat-card {
  position: relative;
  padding: 24px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

/* 鼠标悬停效果 */
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* 装饰性背景图案 */
.card-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

/* 卡片内容 */
.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.icon {
  font-size: 24px;
}

.title {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 卡片值 */
.card-value {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

/* 底部发光效果 */
.glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0.6;
  filter: blur(4px);
}

/* 进入动画 */
.stat-card {
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

