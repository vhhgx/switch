import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as settingsApi from '@/api/settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref({
    autoRefresh: true,
    refreshInterval: 5,
    quotas: [],
    envVars: []
  })
  const loading = ref(false)

  // Actions
  async function fetchSettings() {
    loading.value = true
    try {
      const data = await settingsApi.getSettings()
      settings.value = data
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(updates) {
    try {
      const updated = await settingsApi.updateSettings(updates)
      settings.value = { ...settings.value, ...updated }
      return updated
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  async function addQuota(quota) {
    try {
      const newQuota = await settingsApi.addQuota(quota)
      settings.value.quotas.push(newQuota)
      return newQuota
    } catch (error) {
      console.error('Failed to add quota:', error)
      throw error
    }
  }

  async function updateQuota(id, updates) {
    try {
      const updated = await settingsApi.updateQuota(id, updates)
      const index = settings.value.quotas.findIndex(q => q.id === id)
      if (index !== -1) {
        settings.value.quotas[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to update quota:', error)
      throw error
    }
  }

  async function deleteQuota(id) {
    try {
      await settingsApi.deleteQuota(id)
      settings.value.quotas = settings.value.quotas.filter(q => q.id !== id)
    } catch (error) {
      console.error('Failed to delete quota:', error)
      throw error
    }
  }

  async function addEnvVar(envVar) {
    try {
      const newEnvVar = await settingsApi.addEnvVar(envVar)
      settings.value.envVars.push(newEnvVar)
      return newEnvVar
    } catch (error) {
      console.error('Failed to add env var:', error)
      throw error
    }
  }

  async function updateEnvVar(id, updates) {
    try {
      const updated = await settingsApi.updateEnvVar(id, updates)
      const index = settings.value.envVars.findIndex(e => e.id === id)
      if (index !== -1) {
        settings.value.envVars[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to update env var:', error)
      throw error
    }
  }

  async function deleteEnvVar(id) {
    try {
      await settingsApi.deleteEnvVar(id)
      settings.value.envVars = settings.value.envVars.filter(e => e.id !== id)
    } catch (error) {
      console.error('Failed to delete env var:', error)
      throw error
    }
  }

  return {
    // State
    settings,
    loading,
    // Actions
    fetchSettings,
    updateSettings,
    addQuota,
    updateQuota,
    deleteQuota,
    addEnvVar,
    updateEnvVar,
    deleteEnvVar
  }
}, {
  persist: {
    key: 'settings-store',
    storage: localStorage,
    paths: ['settings']
  }
})
