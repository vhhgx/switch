<template>
  <div class="container">
    <!-- Header and Tabs -->
    <div class="header-wrapper">
      <div class="header">
        <div style="display: flex; gap: 12px">
          <h1 style="font-weight: 700">Claude Proxy</h1>
          <h1 style="font-weight: 300; letter-spacing: 0em">Switcher</h1>
        </div>

        <p style="font-weight: 300; line-height: 32px">
          多账号/多中转站自动故障转移网关
        </p>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'dashboard' }"
          @click="activeTab = 'dashboard'"
        >
          <span class="material-symbols-outlined tab-icon">home</span>
          首页
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'logs' }"
          @click="activeTab = 'logs'"
        >
          <span class="material-symbols-outlined tab-icon">bar_chart</span>
          请求日志
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          <span class="material-symbols-outlined tab-icon">settings</span>
          设置
        </button>
      </div>
    </div>

    <!-- Tab Panels -->
    <Dashboard v-show="activeTab === 'dashboard'" />
    <Logs v-show="activeTab === 'logs'" />
    <Settings v-show="activeTab === 'settings'" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dashboard from './views/Dashboard.vue'
import Logs from './views/Logs.vue'
import Settings from './views/Settings.vue'

// 当前激活的 tab，默认为 dashboard
const activeTab = ref('dashboard')

// 监听 tab 变化，保存到 localStorage
watch(activeTab, (newTab) => {
  localStorage.setItem('activeTab', newTab)
})

// 从 localStorage 恢复上次的 tab
const savedTab = localStorage.getItem('activeTab')
if (savedTab) {
  activeTab.value = savedTab
}
</script>
