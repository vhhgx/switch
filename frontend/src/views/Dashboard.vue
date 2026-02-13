<template>
  <div id="dashboard-panel" class="tab-panel active">
    <!-- Stats -->
    <div class="stats">
      <div class="stat-card success">
        <h3>在线中转站</h3>
        <div class="value">{{ providerStore.onlineCount }}</div>
        <div class="label">可用 / 总数</div>
      </div>
      <div class="stat-card info">
        <h3>总请求次数</h3>
        <div class="value">{{ userStore.stats.totalRequests }}</div>
        <div class="label">累计处理</div>
      </div>
      <div class="stat-card primary">
        <h3>成功率</h3>
        <div class="value">{{ userStore.stats.successRate }}</div>
        <div class="label">最近 100 次</div>
      </div>
      <div class="stat-card warning">
        <h3>平均耗时</h3>
        <div class="value">{{ userStore.stats.avgDuration }}</div>
        <div class="label">响应时间</div>
      </div>
    </div>

    <!-- Provider Management -->
    <div class="section">
      <div class="section-header">
        <h2>
          <span class="material-symbols-outlined" style="font-size: 20px">
            language
          </span>
          中转站管理
        </h2>
        <div style="display: flex; gap: 8px">
          <button
            class="btn btn-primary btn-small"
            @click="showAddModal = true"
          >
            <span class="material-symbols-outlined" style="font-size: 14px">
              add
            </span>
            添加
          </button>
          <button
            class="btn btn-danger btn-small"
            @click="handleRefreshAllBalances"
          >
            <span class="material-symbols-outlined" style="font-size: 14px">
              refresh
            </span>
            刷新余额
          </button>
        </div>
      </div>

      <!-- Provider List -->
      <div id="providerList">
        <div v-if="providerStore.providers.length === 0" class="empty-state">
          <span class="material-symbols-outlined icon">search</span>
          <div>暂无中转站配置，请添加</div>
        </div>
        <div v-else style="display: flex; flex-direction: column; gap: 12px">
          <ProviderCard
            v-for="provider in providerStore.providers"
            :key="provider.id"
            :provider="provider"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle="handleToggle"
            @test="handleTest"
            @refresh-balance="handleRefreshBalance"
            @checkin="handleCheckin"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Provider Modal -->
    <ProviderModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :provider="editingProvider"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useUserStore } from '@/stores/user'
import ProviderCard from '@/components/provider/ProviderCard.vue'
import ProviderModal from '@/components/provider/ProviderModal.vue'

const providerStore = useProviderStore()
const userStore = useUserStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProvider = ref(null)

onMounted(async () => {
  await providerStore.fetchProviders()
  await userStore.fetchStats()
})

function handleEdit(provider) {
  editingProvider.value = provider
  showEditModal.value = true
}

function handleDelete(id) {
  if (confirm('确定要删除这个中转站吗？')) {
    providerStore.deleteProvider(id)
  }
}

function handleToggle(id) {
  providerStore.toggleProvider(id)
}

async function handleTest(id) {
  try {
    const result = await providerStore.testProvider(id)
    alert(`测试成功: ${JSON.stringify(result)}`)
  } catch (error) {
    alert(`测试失败: ${error.message}`)
  }
}

async function handleRefreshBalance(id) {
  try {
    await providerStore.refreshBalance(id)
    alert('余额刷新成功')
  } catch (error) {
    alert(`刷新失败: ${error.message}`)
  }
}

async function handleRefreshAllBalances() {
  try {
    await providerStore.refreshAllBalances()
    alert('所有余额刷新成功')
  } catch (error) {
    alert(`刷新失败: ${error.message}`)
  }
}

async function handleCheckin(id) {
  try {
    await userStore.checkIn(id)
    alert('签到成功')
  } catch (error) {
    alert(`签到失败: ${error.message}`)
  }
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingProvider.value = null
}

async function handleSave(provider) {
  try {
    if (editingProvider.value) {
      await providerStore.updateProvider(editingProvider.value.id, provider)
    } else {
      await providerStore.addProvider(provider)
    }
    closeModal()
  } catch (error) {
    alert(`保存失败: ${error.message}`)
  }
}
</script>
