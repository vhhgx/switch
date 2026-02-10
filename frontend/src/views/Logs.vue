<template>
  <div id="logs-panel" class="tab-panel active">
    <div class="section">
      <div class="section-header">
        <h2>
          <span class="material-symbols-outlined" style="font-size: 20px">
            description
          </span>
          请求记录
        </h2>
        <div class="section-actions" style="display: flex; gap: 8px">
          <button class="btn btn-success btn-small" @click="handleRefresh">
            <span class="material-symbols-outlined" style="font-size: 14px">
              refresh
            </span>
            刷新
          </button>
          <button
            class="btn btn-danger btn-small"
            @click="handleClear"
          >
            <span class="material-symbols-outlined" style="font-size: 14px">
              delete
            </span>
            清空
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>方法</th>
              <th>模型</th>
              <th>中转站</th>
              <th>路径</th>
              <th>耗时</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody id="logBody">
            <tr v-if="logsStore.logs.length === 0" class="empty-state">
              <td colspan="7">
                <span class="material-symbols-outlined icon">
                  description
                </span>
                <div>暂无请求日志</div>
              </td>
            </tr>
            <tr v-for="log in logsStore.filteredLogs" :key="log.id">
              <td>
                <span
                  class="status-badge"
                  :class="`status-${log.status}`"
                  style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;"
                >
                  {{ log.status }}
                </span>
              </td>
              <td>{{ log.method || 'POST' }}</td>
              <td>
                <span class="model-text">{{ log.model || '-' }}</span>
              </td>
              <td>
                <span class="provider-badge">{{ log.provider || '-' }}</span>
              </td>
              <td>
                <span class="path-text">{{ log.path || '-' }}</span>
              </td>
              <td>
                <span class="duration">{{ formatDuration(log.duration) }}</span>
              </td>
              <td>
                <span class="time">{{ formatTime(log.timestamp) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useSettingsStore } from '@/stores/settings'

const logsStore = useLogsStore()
const settingsStore = useSettingsStore()

let refreshTimer = null

onMounted(async () => {
  await logsStore.fetchLogs()

  // 如果启用了自动刷新，设置定时器
  if (settingsStore.settings.autoRefresh) {
    const interval = (settingsStore.settings.refreshInterval || 5) * 1000
    refreshTimer = setInterval(() => {
      logsStore.fetchLogs()
    }, interval)
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

async function handleRefresh() {
  await logsStore.fetchLogs()
}

async function handleClear() {
  if (confirm('确定要清空所有日志吗？')) {
    await logsStore.clearLogs()
  }
}

function formatDuration(duration) {
  if (!duration) return '-'
  return `${duration}ms`
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>
