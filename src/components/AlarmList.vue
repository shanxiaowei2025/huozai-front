<template>
  <!-- 报警列表组件 -->
  <div class="alarm-list">
    <!-- 标题 -->
    <div class="module-title">
      <span class="icon">📋</span>
      <span>实时报警列表</span>
    </div>

    <!-- 报警项列表 -->
    <div class="alarm-items">
      <div 
        v-for="alarm in alarms" 
        :key="alarm.id"
        class="alarm-item"
        :class="`status-${alarm.status}`"
        @click="handleAlarm(alarm)"
      >
        <!-- 报警类型图标 -->
        <div class="alarm-type">
          <span class="type-icon">{{ alarm.icon }}</span>
          <span class="type-text">{{ alarm.type }}</span>
        </div>

        <!-- 报警信息 -->
        <div class="alarm-info">
          <div class="location">{{ alarm.location }}</div>
          <div class="time">{{ alarm.time }}</div>
        </div>

        <!-- 状态标签 -->
        <div class="alarm-status">
          <span v-if="alarm.status === 'pending'" class="status-badge pending">
            未处置
          </span>
          <span v-else-if="alarm.status === 'processing'" class="status-badge processing">
            处置中
          </span>
          <span v-else class="status-badge resolved">
            已处置
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟报警数据
const alarms = ref([
  {
    id: 1,
    type: '火灾报警',
    icon: '🔥',
    location: 'A小区3栋-3F楼道',
    time: '2025-10-24 14:32:15',
    status: 'pending'
  },
  {
    id: 2,
    type: '高空抛物',
    icon: '📦',
    location: 'E小区12栋-12F',
    time: '2025-10-24 14:28:43',
    status: 'processing'
  },
  {
    id: 3,
    type: '火灾误报',
    icon: '✅',
    location: 'C小区5栋-7F',
    time: '2025-10-24 14:15:22',
    status: 'resolved'
  },
  {
    id: 4,
    type: '电梯困人',
    icon: '🚨',
    location: 'B小区8栋-电梯2',
    time: '2025-10-24 14:05:10',
    status: 'resolved'
  },
  {
    id: 5,
    type: '烟雾报警',
    icon: '💨',
    location: 'D小区1栋-5F',
    time: '2025-10-24 13:58:33',
    status: 'resolved'
  }
])

// 点击报警项
const handleAlarm = (alarm) => {
  console.log('查看报警详情：', alarm)
  alert(`报警详情\n类型: ${alarm.type}\n位置: ${alarm.location}\n时间: ${alarm.time}`)
}
</script>

<style scoped>
/* 报警列表容器 */
.alarm-list {
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
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #00f6ff;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 246, 255, 0.3);
}

.icon {
  font-size: 24px;
}

/* 报警项容器 */
.alarm-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单个报警项 */
.alarm-item {
  padding: 16px;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 不同状态的边框颜色 */
.alarm-item.status-pending {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.alarm-item.status-processing {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.alarm-item.status-resolved {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.alarm-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 报警类型 */
.alarm-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.type-icon {
  font-size: 20px;
}

/* 报警信息 */
.alarm-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  opacity: 0.9;
}

.location {
  font-weight: 500;
}

.time {
  font-size: 12px;
  opacity: 0.7;
}

/* 状态标签 */
.alarm-status {
  display: flex;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
}

.status-badge.pending {
  background: #ef4444;
  color: white;
}

.status-badge.processing {
  background: #f59e0b;
  color: white;
}

.status-badge.resolved {
  background: #10b981;
  color: white;
}

/* 滚动条美化 */
.alarm-items::-webkit-scrollbar {
  width: 6px;
}

.alarm-items::-webkit-scrollbar-thumb {
  background: rgba(0, 246, 255, 0.3);
  border-radius: 3px;
}

.alarm-items::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
</style>

