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

        <!-- 状态标签和修改按钮 -->
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
          <button class="change-status-btn" @click.stop="openStatusDialog(alarm)">
            修改状态
          </button>
        </div>
      </div>
    </div>

    <!-- 状态修改对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>修改报警状态</h3>
          <button class="close-btn" @click="closeDialog">✕</button>
        </div>
        
        <div class="dialog-body">
          <div class="alarm-detail">
            <div class="detail-row">
              <span class="label">报警类型：</span>
              <span class="value">{{ currentAlarm?.icon }} {{ currentAlarm?.type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">报警位置：</span>
              <span class="value">{{ currentAlarm?.location }}</span>
            </div>
            <div class="detail-row">
              <span class="label">报警时间：</span>
              <span class="value">{{ currentAlarm?.time }}</span>
            </div>
          </div>

          <div class="status-options">
            <div class="option-label">选择新状态：</div>
            <div class="status-buttons">
              <button 
                class="status-option pending"
                :class="{ active: selectedStatus === 'pending' }"
                @click="selectedStatus = 'pending'"
              >
                未处置
              </button>
              <button 
                class="status-option processing"
                :class="{ active: selectedStatus === 'processing' }"
                @click="selectedStatus = 'processing'"
              >
                处置中
              </button>
              <button 
                class="status-option resolved"
                :class="{ active: selectedStatus === 'resolved' }"
                @click="selectedStatus = 'resolved'"
              >
                已处置
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="confirm-btn" @click="confirmStatusChange">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟报警数据 - 所有状态默认为未处置
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
    status: 'pending'
  },
  {
    id: 3,
    type: '火灾误报',
    icon: '✅',
    location: 'C小区5栋-7F',
    time: '2025-10-24 14:15:22',
    status: 'pending'
  },
  {
    id: 5,
    type: '烟雾报警',
    icon: '💨',
    location: 'D小区1栋-5F',
    time: '2025-10-24 13:58:33',
    status: 'pending'
  }
])

// 对话框相关状态
const showDialog = ref(false)
const currentAlarm = ref(null)
const selectedStatus = ref('pending')

// 点击报警项
const handleAlarm = (alarm) => {
  console.log('查看报警详情：', alarm)
  alert(`报警详情\n类型: ${alarm.type}\n位置: ${alarm.location}\n时间: ${alarm.time}`)
}

// 打开状态修改对话框
const openStatusDialog = (alarm) => {
  currentAlarm.value = alarm
  selectedStatus.value = alarm.status
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  currentAlarm.value = null
}

// 确认修改状态
const confirmStatusChange = () => {
  if (currentAlarm.value) {
    const alarm = alarms.value.find(a => a.id === currentAlarm.value.id)
    if (alarm) {
      alarm.status = selectedStatus.value
      console.log(`报警 ${alarm.id} 状态已修改为: ${selectedStatus.value}`)
    }
  }
  closeDialog()
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
  align-items: center;
  gap: 8px;
  justify-content: space-between;
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

/* 修改状态按钮 */
.change-status-btn {
  padding: 4px 12px;
  background: rgba(0, 246, 255, 0.2);
  border: 1px solid rgba(0, 246, 255, 0.5);
  border-radius: 4px;
  color: #00f6ff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.change-status-btn:hover {
  background: rgba(0, 246, 255, 0.3);
  border-color: #00f6ff;
  transform: scale(1.05);
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

/* 对话框遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 对话框内容 */
.dialog-content {
  background: linear-gradient(135deg, #1a2332 0%, #0f1923 100%);
  border: 2px solid rgba(0, 246, 255, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 对话框头部 */
.dialog-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 246, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #00f6ff;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #00f6ff;
}

/* 对话框主体 */
.dialog-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 报警详情 */
.alarm-detail {
  background: rgba(0, 20, 40, 0.5);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #00f6ff;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row .label {
  color: #00f6ff;
  font-weight: bold;
  min-width: 80px;
}

.detail-row .value {
  color: #ffffff;
  flex: 1;
}

/* 状态选项 */
.status-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  color: #00f6ff;
  font-weight: bold;
  font-size: 14px;
}

.status-buttons {
  display: flex;
  gap: 12px;
}

.status-option {
  flex: 1;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.status-option.pending {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-option.pending:hover,
.status-option.pending.active {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  transform: scale(1.05);
}

.status-option.processing {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.3);
}

.status-option.processing:hover,
.status-option.processing.active {
  background: rgba(245, 158, 11, 0.3);
  border-color: #f59e0b;
  transform: scale(1.05);
}

.status-option.resolved {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-option.resolved:hover,
.status-option.resolved.active {
  background: rgba(16, 185, 129, 0.3);
  border-color: #10b981;
  transform: scale(1.05);
}

/* 对话框底部 */
.dialog-footer {
  padding: 20px;
  border-top: 1px solid rgba(0, 246, 255, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.confirm-btn {
  background: linear-gradient(135deg, #00f6ff 0%, #0099cc 100%);
  border: none;
  color: #001428;
  box-shadow: 0 4px 12px rgba(0, 246, 255, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 246, 255, 0.4);
}
</style>

