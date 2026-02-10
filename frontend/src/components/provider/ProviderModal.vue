<template>
  <div class="modal-overlay active" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ provider ? '编辑中转站' : '添加中转站' }}</h3>
        <button class="modal-close" @click="$emit('close')">
          <span class="material-symbols-outlined" style="font-size: 24px">
            close
          </span>
        </button>
      </div>
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">名称</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="如: 反重力"
            required
          />
        </div>
        <div class="form-group">
          <label for="baseUrl">Base URL</label>
          <input
            id="baseUrl"
            v-model="form.baseUrl"
            type="text"
            placeholder="如: https://api.example.com"
            autocomplete="off"
            required
          />
        </div>
        <div class="form-group">
          <label for="apiKey">API Key</label>
          <div class="input-wrapper">
            <input
              id="apiKey"
              v-model="form.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="sk-..."
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showApiKey = !showApiKey"
            >
              <span
                class="material-symbols-outlined"
                style="font-size: 20px"
              >
                {{ showApiKey ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="token">系统访问令牌</label>
          <div class="input-wrapper">
            <input
              id="token"
              v-model="form.token"
              :type="showToken ? 'text' : 'password'"
              placeholder="请输入令牌（可选）"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showToken = !showToken"
            >
              <span
                class="material-symbols-outlined"
                style="font-size: 20px"
              >
                {{ showToken ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
          <div style="font-size: 12px; color: var(--text-muted)">
            请在中转站个人设置页面【安全设置】标签页生成
          </div>
        </div>
        <div class="form-group">
          <label for="userId">用户ID</label>
          <input
            id="userId"
            v-model="form.userId"
            type="text"
            placeholder="请输入用户ID（可选）"
            autocomplete="off"
          />
          <div style="font-size: 12px; color: var(--text-muted)">
            请在中转站个人设置页面查看
          </div>
        </div>
        <div class="form-group">
          <label for="quotaMethod">配额模式</label>
          <select id="quotaMethod" v-model="form.quotaMethod" class="quota-method">
            <option value="">请选择配额模式</option>
            <option value="remaining">剩余额度</option>
            <option value="total">总额度</option>
            <option value="used">已使用</option>
          </select>
          <div style="font-size: 12px; color: var(--text-muted)">
            配额模式请在设置页面设置
          </div>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ provider ? '保存' : '添加' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  provider: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  baseUrl: '',
  apiKey: '',
  token: '',
  userId: '',
  quotaMethod: '',
  enabled: true
})

const showApiKey = ref(false)
const showToken = ref(false)

// 当 provider 变化时，更新表单
watch(() => props.provider, (newProvider) => {
  if (newProvider) {
    form.value = {
      name: newProvider.name || '',
      baseUrl: newProvider.baseUrl || '',
      apiKey: newProvider.apiKey || '',
      token: newProvider.token || '',
      userId: newProvider.userId || '',
      quotaMethod: newProvider.quotaMethod || '',
      enabled: newProvider.enabled !== undefined ? newProvider.enabled : true
    }
  } else {
    form.value = {
      name: '',
      baseUrl: '',
      apiKey: '',
      token: '',
      userId: '',
      quotaMethod: '',
      enabled: true
    }
  }
}, { immediate: true })

function handleSubmit() {
  emit('save', { ...form.value })
}
</script>
