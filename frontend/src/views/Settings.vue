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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(async () => {
  await settingsStore.fetchSettings()
})

async function handleSettingChange() {
  try {
    await settingsStore.updateSettings(settingsStore.settings)
  } catch (error) {
    console.error('Failed to update settings:', error)
  }
}
</script>
