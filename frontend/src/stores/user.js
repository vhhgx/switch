import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as userApi from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const stats = ref({
    onlineCount: 0,
    totalRequests: 0,
    successRate: '0%',
    avgDuration: '0ms'
  })
  const loading = ref(false)
  const lastCheckIn = ref(null)

  // Actions
  async function fetchStats() {
    loading.value = true
    try {
      const data = await userApi.getStats()
      stats.value = data
      return data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function checkIn() {
    try {
      const result = await userApi.checkIn()
      lastCheckIn.value = new Date().toISOString()
      return result
    } catch (error) {
      console.error('Failed to check in:', error)
      throw error
    }
  }

  return {
    // State
    stats,
    loading,
    lastCheckIn,
    // Actions
    fetchStats,
    checkIn
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['lastCheckIn']
  }
})
