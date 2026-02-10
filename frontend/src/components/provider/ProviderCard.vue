<template>
  <div class="provider-card" :class="{ enabled: provider.enabled, disabled: !provider.enabled }">
    <div class="provider-info">
      <div class="name">
        <span class="status-badge" :class="{ online: provider.enabled, offline: !provider.enabled }">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <circle cx="4" cy="4" r="4" />
          </svg>
          {{ provider.enabled ? '在线' : '离线' }}
        </span>
        {{ provider.name }}
      </div>
      <div class="url">{{ provider.baseUrl }}</div>
    </div>

    <div class="balance-info">
      <template v-if="provider.token">
        <div v-if="provider.balance !== undefined" style="display: block;">
          <div class="balance-value">¥ {{ formatBalance(provider.balance) }}</div>
          <div class="balance-value-tip">
            <span class="material-symbols-outlined" style="font-size: 10px">info</span>
            {{ getQuotaMethodLabel(provider.quotaMethod) }}
          </div>
        </div>
        <div v-else class="balance-tip">
          <span class="material-symbols-outlined" style="font-size: 12px">info</span>
          点击刷新获取余额
        </div>
      </template>
      <div v-else class="balance-tip">
        <span class="material-symbols-outlined" style="font-size: 12px">info</span>
        余额功能需要在配置中添加令牌
      </div>
    </div>

    <div class="used-info">
      <template v-if="provider.token">
        <div v-if="provider.used !== undefined" style="display: block;">
          <div class="used-value">¥ {{ formatBalance(provider.used) }}</div>
          <div class="used-value-tip">
            <span class="material-symbols-outlined" style="font-size: 10px">trending_down</span>
            历史消耗
          </div>
        </div>
        <div v-else class="used-tip">
          <span class="material-symbols-outlined" style="font-size: 12px">info</span>
          点击刷新获取消耗
        </div>
      </template>
      <div v-else class="used-tip">
        <span class="material-symbols-outlined" style="font-size: 12px">info</span>
        消耗功能需要配置令牌
      </div>
    </div>

    <div class="provider-actions">
      <div class="action-row">
        <button
          v-if="provider.token"
          class="btn btn-secondary btn-small"
          @click="$emit('refresh-balance', provider.id)"
        >
          <span class="material-symbols-outlined" style="font-size: 14px">refresh</span>
          刷新余额
        </button>
        <button
          class="btn btn-secondary btn-small"
          @click="$emit('edit', provider)"
        >
          <span class="material-symbols-outlined" style="font-size: 14px">edit</span>
          编辑
        </button>
        <button
          class="btn btn-danger btn-small"
          @click="$emit('delete', provider.id)"
        >
          <span class="material-symbols-outlined" style="font-size: 14px">delete</span>
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  provider: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'toggle', 'test', 'refresh-balance'])

function formatBalance(value) {
  if (value === undefined || value === null) return '0.00'
  return Number(value).toFixed(2)
}

function getQuotaMethodLabel(method) {
  const labels = {
    total: '总额度',
    used: '已使用',
    remaining: '剩余额度'
  }
  return labels[method] || '剩余额度'
}
</script>
