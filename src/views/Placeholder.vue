<template>
  <div class="placeholder">
    <button class="back-btn" @click="goBack">
      ← 返回主页
    </button>
    <div class="placeholder-content">
      <div class="icon">{{ icon }}</div>
      <h2>{{ title }}</h2>
      <p>此功能正在开发中...</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    default: '页面'
  },
  icon: {
    type: String,
    default: '🚧'
  }
})

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.placeholder {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0f1419 0%, #1a1f3a 100%);
}

.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  padding: 12px 24px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

.back-btn:hover {
  background: rgba(6, 182, 212, 0.25);
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  transform: translateY(-2px);
}

.back-btn:active {
  transform: translateY(0);
}

.placeholder-content {
  text-align: center;
}

.icon {
  font-size: 100px;
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

h2 {
  font-size: 36px;
  color: #fff;
  margin-bottom: 15px;
}

p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
}
</style>

