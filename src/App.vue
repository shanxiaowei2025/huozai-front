<template>
  <div class="app-container">
    <!-- 主内容区 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// 移除了Sidebar导航栏
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

