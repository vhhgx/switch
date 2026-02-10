import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as providerApi from '@/api/provider'

export const useProviderStore = defineStore('provider', () => {
  // State
  const providers = ref([])
  const loading = ref(false)

  // Getters
  const enabledProviders = computed(() =>
    providers.value.filter(p => p.enabled)
  )

  const providerCount = computed(() => providers.value.length)

  const onlineCount = computed(() =>
    providers.value.filter(p => p.enabled).length
  )

  // Actions
  async function fetchProviders() {
    loading.value = true
    try {
      const data = await providerApi.getProviders()
      providers.value = data
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addProvider(provider) {
    try {
      const newProvider = await providerApi.createProvider(provider)
      providers.value.push(newProvider)
      return newProvider
    } catch (error) {
      console.error('Failed to add provider:', error)
      throw error
    }
  }

  async function updateProvider(id, updates) {
    try {
      const updated = await providerApi.updateProvider(id, updates)
      const index = providers.value.findIndex(p => p.id === id)
      if (index !== -1) {
        providers.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Failed to update provider:', error)
      throw error
    }
  }

  async function deleteProvider(id) {
    try {
      await providerApi.deleteProvider(id)
      providers.value = providers.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Failed to delete provider:', error)
      throw error
    }
  }

  async function toggleProvider(id) {
    const provider = providers.value.find(p => p.id === id)
    if (provider) {
      await updateProvider(id, { enabled: !provider.enabled })
    }
  }

  async function testProvider(id) {
    try {
      const result = await providerApi.testProvider(id)
      return result
    } catch (error) {
      console.error('Failed to test provider:', error)
      throw error
    }
  }

  async function refreshBalance(id) {
    try {
      const result = await providerApi.refreshBalance(id)
      // 更新本地数据
      const index = providers.value.findIndex(p => p.id === id)
      if (index !== -1 && result.balance !== undefined) {
        providers.value[index].balance = result.balance
      }
      return result
    } catch (error) {
      console.error('Failed to refresh balance:', error)
      throw error
    }
  }

  async function refreshAllBalances() {
    try {
      const result = await providerApi.refreshAllBalances()
      // 重新获取所有中转站数据
      await fetchProviders()
      return result
    } catch (error) {
      console.error('Failed to refresh all balances:', error)
      throw error
    }
  }

  return {
    // State
    providers,
    loading,
    // Getters
    enabledProviders,
    providerCount,
    onlineCount,
    // Actions
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    toggleProvider,
    testProvider,
    refreshBalance,
    refreshAllBalances
  }
}, {
  persist: {
    key: 'provider-store',
    storage: localStorage,
    paths: ['providers']
  }
})
