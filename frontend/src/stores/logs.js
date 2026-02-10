import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as logsApi from '@/api/logs'

export const useLogsStore = defineStore('logs', () => {
  // State
  const logs = ref([])
  const loading = ref(false)
  const filters = ref({
    level: 'all',
    search: '',
    dateRange: []
  })

  // Getters
  const filteredLogs = computed(() => {
    let result = logs.value

    // 按级别筛选
    if (filters.value.level !== 'all') {
      result = result.filter(log => log.level === filters.value.level)
    }

    // 按搜索词筛选
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(log =>
        log.message?.toLowerCase().includes(search) ||
        log.provider?.toLowerCase().includes(search) ||
        log.model?.toLowerCase().includes(search)
      )
    }

    return result
  })

  const errorCount = computed(() =>
    logs.value.filter(log => log.level === 'error').length
  )

  // Actions
  async function fetchLogs() {
    loading.value = true
    try {
      const data = await logsApi.getLogs()
      logs.value = data
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function clearLogs() {
    try {
      await logsApi.clearLogs()
      logs.value = []
    } catch (error) {
      console.error('Failed to clear logs:', error)
      throw error
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    // State
    logs,
    loading,
    filters,
    // Getters
    filteredLogs,
    errorCount,
    // Actions
    fetchLogs,
    clearLogs,
    updateFilters
  }
}, {
  persist: {
    key: 'logs-store',
    storage: localStorage,
    paths: ['filters']
  }
})
