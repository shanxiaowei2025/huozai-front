<template>
  <!-- 视频监控墙组件 -->
  <div class="video-wall">
    <!-- 标题栏 -->
    <div class="module-title">
      <span class="icon">📹</span>
      <span>实时视频监控（{{ splitMode }}分屏）</span>
      
      <!-- 分屏切换按钮 -->
      <div class="controls">
        <button 
          v-for="mode in [9, 16, 25]" 
          :key="mode"
          @click="splitMode = mode"
          :class="{ active: splitMode === mode }"
          class="split-btn"
        >
          {{ mode }}分屏
        </button>
      </div>
    </div>

    <!-- 视频网格 -->
    <div class="video-grid" :class="`grid-${splitMode}`">
      <div 
        v-for="(video, index) in displayVideos" 
        :key="index"
        class="video-item"
        :class="{ 
          'has-alarm': video.hasAlarm,
          'selected': selectedVideo === index 
        }"
        @click="selectVideo(index)"
      >
        <!-- 视频标签 -->
        <div class="video-label">
          <span v-if="video.hasAlarm" class="alarm-icon">🔥</span>
          <span>{{ video.name }}</span>
        </div>

        <!-- 视频预览区（使用颜色模拟摄像头画面） -->
        <div class="video-preview" :style="{ background: video.bgColor }">
          <div class="camera-icon">📹</div>
        </div>

        <!-- 报警标记 -->
        <div v-if="video.hasAlarm" class="alarm-badge">
          {{ video.alarmType }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 分屏模式：9/16/25
const splitMode = ref(9)
// 选中的视频
const selectedVideo = ref(null)

// 所有视频数据
const allVideos = ref([
  { name: 'A栋-3F', hasAlarm: true, alarmType: '火灾报警', bgColor: 'linear-gradient(135deg, #dc2626, #991b1b)' },
  { name: 'B栋-5F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'C栋-8F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'D栋-2F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'E栋-12F', hasAlarm: true, alarmType: '高空抛物', bgColor: 'linear-gradient(135deg, #d97706, #92400e)' },
  { name: 'F栋-6F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'G栋-4F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'H栋-7F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'I栋-9F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'J栋-1F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'K栋-10F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { name: 'L栋-3F', hasAlarm: false, bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)' }
])

// 根据分屏模式显示对应数量的视频
const displayVideos = computed(() => {
  return allVideos.value.slice(0, splitMode.value)
})

// 选择视频
const selectVideo = (index) => {
  selectedVideo.value = index
  console.log('选中视频：', displayVideos.value[index].name)
}
</script>

<style scoped>
/* 视频墙容器 */
.video-wall {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 模块标题 */
.module-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #00f6ff;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.3);
}

.icon {
  font-size: 24px;
}

/* 控制按钮组 */
.controls {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.split-btn {
  padding: 6px 12px;
  background: rgba(0, 246, 255, 0.1);
  border: 1px solid rgba(0, 246, 255, 0.3);
  border-radius: 4px;
  color: #00f6ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.split-btn:hover {
  background: rgba(0, 246, 255, 0.2);
}

.split-btn.active {
  background: #00f6ff;
  color: #0a0e27;
  font-weight: bold;
}

/* 视频网格 */
.video-grid {
  flex: 1;
  display: grid;
  gap: 12px;
  overflow-y: auto;
}

/* 9分屏：3x3 */
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* 16分屏：4x4 */
.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

/* 25分屏：5x5 */
.grid-25 {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
}

/* 单个视频项 */
.video-item {
  position: relative;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border: 2px solid rgba(0, 246, 255, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.video-item:hover {
  border-color: rgba(0, 246, 255, 0.6);
  transform: scale(1.02);
}

.video-item.selected {
  border-color: #00f6ff;
  box-shadow: 0 0 20px rgba(0, 246, 255, 0.5);
}

/* 报警视频边框 */
.video-item.has-alarm {
  border-color: #ef4444;
  animation: alarmBlink 1s infinite;
}

@keyframes alarmBlink {
  0%, 100% { border-color: #ef4444; }
  50% { border-color: #fca5a5; }
}

/* 视频标签 */
.video-label {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.alarm-icon {
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* 视频预览区 */
.video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 48px;
  opacity: 0.3;
}

/* 报警徽章 */
.alarm-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  z-index: 2;
}
</style>

