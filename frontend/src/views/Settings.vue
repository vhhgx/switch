<template>
  <div id="settings-panel" class="tab-panel active">
    <div class="section">
      <div class="section-header">
        <h2>
          <span class="material-symbols-outlined" style="font-size: 20px">
            tune
          </span>
          系统设置
        </h2>
      </div>

      <div class="settings-container">
        <!-- General Settings Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">display_settings</span>
            <h3>常规设置</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="autoRefresh">自动刷新日志</label>
              <p class="setting-desc">启用后，日志页面将每5秒自动刷新</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                id="autoRefresh"
                v-model="settingsStore.settings.autoRefresh"
                @change="handleSettingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="refreshInterval">刷新间隔</label>
              <p class="setting-desc">设置日志自动刷新的时间间隔</p>
            </div>
            <select
              id="refreshInterval"
              v-model="settingsStore.settings.refreshInterval"
              class="setting-select"
              @change="handleSettingChange"
            >
              <option :value="3">3秒</option>
              <option :value="5">5秒</option>
              <option :value="10">10秒</option>
              <option :value="30">30秒</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="maxLogs">日志保留数量</label>
              <p class="setting-desc">设置系统最多保留的日志条数</p>
            </div>
            <select
              id="maxLogs"
              v-model="settingsStore.settings.maxLogs"
              class="setting-select"
              @change="handleSettingChange"
            >
              <option :value="50">50条</option>
              <option :value="100">100条</option>
              <option :value="200">200条</option>
              <option :value="500">500条</option>
            </select>
          </div>
        </div>

        <!-- Provider Settings Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">cloud_sync</span>
            <h3>中转站设置</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="retryAttempts">重试次数</label>
              <p class="setting-desc">请求失败时的最大重试次数</p>
            </div>
            <select
              id="retryAttempts"
              v-model="settingsStore.settings.retryAttempts"
              class="setting-select"
              @change="handleSettingChange"
            >
              <option :value="1">1次</option>
              <option :value="2">2次</option>
              <option :value="3">3次</option>
              <option :value="5">5次</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="requestTimeout">请求超时</label>
              <p class="setting-desc">单个请求的最大等待时间</p>
            </div>
            <select
              id="requestTimeout"
              v-model="settingsStore.settings.requestTimeout"
              class="setting-select"
              @change="handleSettingChange"
            >
              <option :value="30">30秒</option>
              <option :value="60">60秒</option>
              <option :value="120">120秒</option>
              <option :value="300">300秒</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="autoDisable">自动禁用失败节点</label>
              <p class="setting-desc">连续失败3次后自动禁用该中转站</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                id="autoDisable"
                v-model="settingsStore.settings.autoDisable"
                @change="handleSettingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>配额模式</label>
              <p class="setting-desc">配置不同币种的配额计算方式</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center">
              <button
                class="btn btn-primary btn-small"
                @click="showQuotaModal = true"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  add
                </span>
                添加配额
              </button>
              <button
                class="btn btn-secondary btn-small expand-toggle"
                :class="{ expanded: showQuotaList }"
                @click="showQuotaList = !showQuotaList"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  expand_more
                </span>
              </button>
            </div>
          </div>

          <!-- Quota List (Collapsible) -->
          <div
            v-show="showQuotaList"
            class="quota-list-container"
          >
            <div class="quota-list">
              <div v-if="settingsStore.settings.quotas?.length === 0" class="empty-quota-state">
                <span class="material-symbols-outlined" style="font-size: 32px; opacity: 0.3">
                  payments
                </span>
                <p>暂无配额配置</p>
              </div>
              <div
                v-for="quota in settingsStore.settings.quotas"
                :key="quota.id"
                class="quota-item"
              >
                <div class="quota-item-info">
                  <div class="quota-item-name">
                    {{ quota.name }}
                    <span class="currency-badge">{{ quota.currency }}</span>
                    <span v-if="quota.isDefault" class="default-badge">默认</span>
                  </div>
                  <div class="quota-item-details">
                    <span>比例: {{ quota.ratio?.toLocaleString() }}</span>
                    <span>汇率: {{ quota.exchangeRate }}</span>
                  </div>
                </div>
                <div class="quota-item-actions">
                  <template v-if="!quota.isDefault">
                    <button
                      class="btn btn-primary btn-small"
                      @click="handleEditQuota(quota)"
                    >
                      <span class="material-symbols-outlined" style="font-size: 14px">
                        edit
                      </span>
                    </button>
                    <button
                      class="btn btn-danger btn-small"
                      @click="handleDeleteQuota(quota.id)"
                    >
                      <span class="material-symbols-outlined" style="font-size: 14px">
                        delete
                      </span>
                    </button>
                  </template>
                  <span v-else style="font-size: 12px; color: var(--text-muted); padding: 0 8px">
                    系统默认，不可编辑
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">notifications</span>
            <h3>通知设置</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="notifyOnError">错误通知</label>
              <p class="setting-desc">当请求失败时显示通知</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                id="notifyOnError"
                v-model="settingsStore.settings.notifyOnError"
                @change="handleSettingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="notifyOnProviderDown">节点离线通知</label>
              <p class="setting-desc">当中转站离线时显示通知</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                id="notifyOnProviderDown"
                v-model="settingsStore.settings.notifyOnProviderDown"
                @change="handleSettingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="soundEnabled">声音提示</label>
              <p class="setting-desc">启用通知声音</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                id="soundEnabled"
                v-model="settingsStore.settings.soundEnabled"
                @change="handleSettingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- API Configuration Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">key</span>
            <h3>API配置</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="apiBaseUrl">Base URL</label>
              <p class="setting-desc">API服务地址</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; min-width: 600px">
              <input
                type="text"
                id="apiBaseUrl"
                v-model="apiBaseUrl"
                class="setting-input"
                placeholder="如: http://localhost:5679"
                style="flex: 1"
              />
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label for="apiKey">API Key</label>
              <p class="setting-desc">API访问密钥</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; min-width: 600px">
              <input
                type="text"
                id="apiKey"
                v-model="apiKey"
                class="setting-input"
                placeholder="sk-..."
                readonly
                style="flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12px"
              />
              <button
                class="btn btn-primary btn-small"
                @click="handleGenerateApiKey"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  refresh
                </span>
                生成
              </button>
              <button
                class="btn btn-secondary btn-small"
                @click="handleCopyApiKey"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  content_copy
                </span>
                复制
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>写入系统环境变量</label>
              <p class="setting-desc">
                将Base URL和API Key写入系统级别环境变量
              </p>
            </div>
            <button
              class="btn btn-success btn-small"
              @click="handleWriteApiConfigToSystem"
            >
              <span class="material-symbols-outlined" style="font-size: 14px">
                upload
              </span>
              写入系统变量
            </button>
          </div>
        </div>

        <!-- Environment Variables Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">code</span>
            <h3>环境变量</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>应用环境变量</label>
              <p class="setting-desc">
                配置应用运行时的环境变量，点击"写入系统"按钮后生效
              </p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center">
              <button
                class="btn btn-primary btn-small"
                @click="showEnvModal = true"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  add
                </span>
                添加变量
              </button>
              <button
                class="btn btn-success btn-small"
                @click="handleWriteEnvToSystem"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  upload
                </span>
                写入系统
              </button>
              <button
                class="btn btn-secondary btn-small expand-toggle"
                :class="{ expanded: showEnvList }"
                @click="showEnvList = !showEnvList"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  expand_more
                </span>
              </button>
            </div>
          </div>

          <!-- Environment Variables List (Collapsible) -->
          <div
            v-show="showEnvList"
            class="quota-list-container"
          >
            <div class="quota-list">
              <div v-if="settingsStore.settings.envVars?.length === 0" class="empty-quota-state">
                <span class="material-symbols-outlined" style="font-size: 32px; opacity: 0.3">
                  settings_applications
                </span>
                <p>暂无环境变量配置</p>
              </div>
              <div
                v-for="envVar in settingsStore.settings.envVars"
                :key="envVar.id"
                class="quota-item"
              >
                <div class="quota-item-info">
                  <div class="quota-item-name">
                    {{ envVar.key }}
                    <span v-if="['PORT', 'NODE_ENV'].includes(envVar.key)" class="default-badge">系统</span>
                  </div>
                  <div class="quota-item-details">
                    <span style="font-family: 'JetBrains Mono', monospace">{{ envVar.value }}</span>
                  </div>
                </div>
                <div class="quota-item-actions">
                  <button
                    class="btn btn-primary btn-small"
                    @click="handleEditEnvVar(envVar)"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px">
                      edit
                    </span>
                  </button>
                  <button
                    class="btn btn-secondary btn-small"
                    @click="handleDeleteEnvVar(envVar.id)"
                    title="仅从配置文件中删除"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px">
                      delete
                    </span>
                    删除
                  </button>
                  <button
                    class="btn btn-danger btn-small"
                    @click="handleDeleteEnvFromSystem(envVar.key)"
                    title="从系统环境变量中删除"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px">
                      delete_forever
                    </span>
                    系统删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Info Section -->
        <div class="settings-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">info</span>
            <h3>系统信息</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>版本</label>
            </div>
            <span class="setting-value">v1.0.0</span>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>运行时间</label>
            </div>
            <span class="setting-value">{{ uptime }}</span>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>API端点</label>
            </div>
            <span class="setting-value">/v1/messages</span>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>数据存储</label>
            </div>
            <span class="setting-value">本地 JSON</span>
          </div>
        </div>

        <!-- Danger Zone Section -->
        <div class="settings-section danger-section">
          <div class="settings-section-title">
            <span class="material-symbols-outlined">warning</span>
            <h3>危险区域</h3>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>清空所有日志</label>
              <p class="setting-desc">
                删除所有请求日志记录，此操作无法撤销
              </p>
            </div>
            <button
              class="btn btn-danger btn-small"
              @click="handleClearAllLogs"
            >
              <span class="material-symbols-outlined" style="font-size: 14px">
                delete_sweep
              </span>
              清空日志
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>重置所有设置</label>
              <p class="setting-desc">将所有设置恢复为默认值</p>
            </div>
            <button
              class="btn btn-danger btn-small"
              @click="handleResetAllSettings"
            >
              <span class="material-symbols-outlined" style="font-size: 14px">
                restart_alt
              </span>
              重置设置
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <label>删除所有中转站</label>
              <p class="setting-desc">删除所有中转站配置，此操作无法撤销</p>
            </div>
            <button
              class="btn btn-danger btn-small"
              @click="handleClearAllProviders"
            >
              <span class="material-symbols-outlined" style="font-size: 14px">
                delete_forever
              </span>
              删除全部
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quota Modal -->
    <div v-if="showQuotaModal" class="modal-overlay" @click.self="closeQuotaModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ currentEditQuota ? '编辑配额模式' : '添加配额模式' }}</h3>
          <button class="modal-close" @click="closeQuotaModal">
            <span class="material-symbols-outlined" style="font-size: 24px">
              close
            </span>
          </button>
        </div>
        <form class="modal-form" @submit.prevent="handleSaveQuota">
          <div class="form-group">
            <label for="quotaName">名称</label>
            <input
              id="quotaName"
              v-model="quotaForm.name"
              type="text"
              placeholder="如: 美元配额"
              required
            />
          </div>
          <div class="form-group">
            <label for="quotaCurrency">币种</label>
            <select id="quotaCurrency" v-model="quotaForm.currency" required>
              <option value="">请选择币种</option>
              <option value="USD">美元 (USD)</option>
              <option value="CNY">人民币 (CNY)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="quotaRatio">配额比例</label>
            <input
              id="quotaRatio"
              v-model.number="quotaForm.ratio"
              type="number"
              step="100000"
              placeholder="如: 500000"
              required
            />
            <div style="font-size: 12px; color: var(--text-muted)">
              API返回值需要除以此比例才能得到实际金额
            </div>
          </div>
          <div class="form-group">
            <label for="quotaExchangeRate">汇率</label>
            <input
              id="quotaExchangeRate"
              v-model.number="quotaForm.exchangeRate"
              type="number"
              step="1"
              placeholder="1"
              required
            />
            <div style="font-size: 12px; color: var(--text-muted)">
              相对于人民币的汇率（1 表示与人民币等值）
            </div>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeQuotaModal"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ currentEditQuota ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Environment Variable Modal -->
    <div v-if="showEnvModal" class="modal-overlay" @click.self="closeEnvModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ currentEditEnvVar ? '编辑环境变量' : '添加环境变量' }}</h3>
          <button class="modal-close" @click="closeEnvModal">
            <span class="material-symbols-outlined" style="font-size: 24px">
              close
            </span>
          </button>
        </div>
        <form class="modal-form" @submit.prevent="handleSaveEnvVar">
          <div class="form-group">
            <label for="envKey">变量名</label>
            <input
              id="envKey"
              v-model="envForm.key"
              type="text"
              placeholder="如: PORT"
              :disabled="!!currentEditEnvVar"
              required
            />
            <div style="font-size: 12px; color: var(--text-muted)">
              通常使用大写字母和下划线，如 API_KEY
            </div>
          </div>
          <div class="form-group">
            <label for="envValue">变量值</label>
            <input
              id="envValue"
              v-model="envForm.value"
              type="text"
              placeholder="如: 3000"
              required
            />
            <div style="font-size: 12px; color: var(--text-muted)">
              支持字符串、数字等任意值
            </div>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeEnvModal"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useLogsStore } from '@/stores/logs'
import { useProviderStore } from '@/stores/provider'

const settingsStore = useSettingsStore()
const logsStore = useLogsStore()
const providerStore = useProviderStore()

const showQuotaList = ref(false)
const showEnvList = ref(false)
const showQuotaModal = ref(false)
const showEnvModal = ref(false)
const apiBaseUrl = ref('http://localhost:5679')
const apiKey = ref('')
const uptime = ref('计算中...')

const currentEditQuota = ref(null)
const quotaForm = ref({
  name: '',
  currency: 'CNY',
  ratio: 500000,
  exchangeRate: 1
})

const currentEditEnvVar = ref(null)
const envForm = ref({
  key: '',
  value: ''
})

let uptimeTimer = null

onMounted(async () => {
  await settingsStore.fetchSettings()

  // 计算运行时间
  const startTime = Date.now()
  uptimeTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      uptime.value = `${days}天 ${hours % 24}小时`
    } else if (hours > 0) {
      uptime.value = `${hours}小时 ${minutes % 60}分钟`
    } else if (minutes > 0) {
      uptime.value = `${minutes}分钟 ${seconds % 60}秒`
    } else {
      uptime.value = `${seconds}秒`
    }
  }, 1000)
})

onUnmounted(() => {
  if (uptimeTimer) {
    clearInterval(uptimeTimer)
  }
})

async function handleSettingChange() {
  try {
    await settingsStore.updateSettings(settingsStore.settings)
  } catch (error) {
    console.error('Failed to update settings:', error)
  }
}

function handleEditQuota(quota) {
  currentEditQuota.value = quota
  quotaForm.value = {
    name: quota.name,
    currency: quota.currency,
    ratio: quota.ratio,
    exchangeRate: quota.exchangeRate
  }
  showQuotaModal.value = true
}

async function handleSaveQuota() {
  try {
    if (currentEditQuota.value) {
      // 编辑现有配额
      await settingsStore.updateQuota(currentEditQuota.value.id, quotaForm.value)
    } else {
      // 添加新配额
      await settingsStore.addQuota(quotaForm.value)
    }
    closeQuotaModal()
    // 如果列表是隐藏的，自动展开
    if (!showQuotaList.value) {
      showQuotaList.value = true
    }
  } catch (error) {
    alert(`${currentEditQuota.value ? '更新' : '添加'}配额失败: ${error.message}`)
  }
}

function closeQuotaModal() {
  showQuotaModal.value = false
  currentEditQuota.value = null
  quotaForm.value = {
    name: '',
    currency: 'CNY',
    ratio: 500000,
    exchangeRate: 1
  }
}

async function handleDeleteQuota(id) {
  if (confirm('确定要删除这个配额配置吗？')) {
    try {
      await settingsStore.deleteQuota(id)
    } catch (error) {
      alert(`删除失败: ${error.message}`)
    }
  }
}

function handleEditEnvVar(envVar) {
  currentEditEnvVar.value = envVar
  envForm.value = {
    key: envVar.key,
    value: envVar.value
  }
  showEnvModal.value = true
}

async function handleSaveEnvVar() {
  try {
    // 将变量名转换为大写
    const key = envForm.value.key.trim().toUpperCase()
    const value = envForm.value.value.trim()

    if (currentEditEnvVar.value) {
      // 编辑现有环境变量
      await settingsStore.updateEnvVar(currentEditEnvVar.value.id, { key, value })
    } else {
      // 添加新环境变量
      await settingsStore.addEnvVar({ key, value })
    }
    closeEnvModal()
    // 如果列表是隐藏的，自动展开
    if (!showEnvList.value) {
      showEnvList.value = true
    }
    alert('✅ 环境变量已保存到配置文件，点击"写入系统"按钮可将配置写入系统环境变量')
  } catch (error) {
    alert(`❌ 保存环境变量失败: ${error.message}`)
  }
}

function closeEnvModal() {
  showEnvModal.value = false
  currentEditEnvVar.value = null
  envForm.value = {
    key: '',
    value: ''
  }
}

async function handleDeleteEnvVar(id) {
  if (confirm('确定要删除这个环境变量吗？\n\n这将从配置文件中删除该变量。')) {
    try {
      await settingsStore.deleteEnvVar(id)
      alert('✅ 环境变量已从配置文件中删除')
    } catch (error) {
      alert(`❌ 删除失败: ${error.message}`)
    }
  }
}

async function handleDeleteEnvFromSystem(key) {
  if (confirm(`⚠️ 确定要从系统环境变量中删除 "${key}" 吗？\n\n这将从您的系统环境变量中永久删除此变量。`)) {
    try {
      // TODO: 调用后端API删除系统环境变量
      // const response = await fetch('/api/settings/env/delete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ key })
      // })
      // if (response.ok) {
      //   // 同时从配置文件中删除
      //   const envVar = settingsStore.settings.envVars.find(v => v.key === key)
      //   if (envVar) {
      //     await settingsStore.deleteEnvVar(envVar.id)
      //   }
      //   alert(`✅ 环境变量 "${key}" 已从系统中删除`)
      // }
      alert('从系统删除环境变量功能需要后端支持')
    } catch (error) {
      alert(`❌ 从系统删除环境变量失败: ${error.message}`)
    }
  }
}

function handleGenerateApiKey() {
  // 生成随机 API Key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sk-'
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  apiKey.value = key
}

function handleCopyApiKey() {
  if (!apiKey.value) {
    alert('请先生成 API Key')
    return
  }
  navigator.clipboard.writeText(apiKey.value)
  alert('API Key 已复制到剪贴板')
}

function handleWriteApiConfigToSystem() {
  alert('写入系统环境变量功能需要后端支持')
}

function handleWriteEnvToSystem() {
  alert('写入系统环境变量功能需要后端支持')
}

async function handleClearAllLogs() {
  if (confirm('确定要清空所有日志吗？此操作无法撤销！')) {
    try {
      await logsStore.clearLogs()
      alert('所有日志已清空')
    } catch (error) {
      alert(`清空失败: ${error.message}`)
    }
  }
}

function handleResetAllSettings() {
  if (confirm('确定要重置所有设置吗？此操作无法撤销！')) {
    // 重置设置到默认值
    settingsStore.settings = {
      autoRefresh: true,
      refreshInterval: 5,
      maxLogs: 100,
      retryAttempts: 3,
      requestTimeout: 60,
      autoDisable: false,
      notifyOnError: true,
      notifyOnProviderDown: true,
      soundEnabled: false,
      quotas: [],
      envVars: []
    }
    handleSettingChange()
    alert('所有设置已重置为默认值')
  }
}

async function handleClearAllProviders() {
  if (confirm('确定要删除所有中转站吗？此操作无法撤销！')) {
    try {
      // 删除所有中转站
      const providers = [...providerStore.providers]
      for (const provider of providers) {
        await providerStore.deleteProvider(provider.id)
      }
      alert('所有中转站已删除')
    } catch (error) {
      alert(`删除失败: ${error.message}`)
    }
  }
}
</script>
