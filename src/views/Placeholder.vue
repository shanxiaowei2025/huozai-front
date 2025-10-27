<template>
  <div class="placeholder">
    <div class="placeholder-content">
      <div class="icon">{{ icon }}</div>
      <h2>{{ title }}</h2>
      <p>此功能正在开发中...</p>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0f1419 0%, #1a1f3a 100%);
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

