# Claude Proxy Switcher - Vue 3 迁移文档

## 📋 目录

- [项目概述](#项目概述)
- [技术栈升级](#技术栈升级)
- [项目结构设计](#项目结构设计)
- [依赖清单](#依赖清单)
- [组件拆分方案](#组件拆分方案)
- [状态管理设计](#状态管理设计)
- [路由设计](#路由设计)
- [API 服务层](#api-服务层)
- [迁移步骤](#迁移步骤)
- [注意事项](#注意事项)

---

## 项目概述

### 当前状态
- **前端架构**: 单 HTML 文件 (109KB)
- **JavaScript**: 原生 JS + 内联脚本
- **样式**: 独立 CSS 文件
- **状态管理**: 全局变量 + localStorage
- **路由**: 手动 Tab 切换

### 目标状态
- **前端架构**: Vue 3 + Vite
- **语法**: Composition API (setup 语法糖)
- **状态管理**: Pinia + 持久化插件
- **页面切换**: Tab 切换（单页面应用）
- **构建工具**: Vite 6
- **UI 组件**: 保持原有设计，组件化拆分

---

## 技术栈升级

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.5.13 | 最新稳定版，支持 setup 语法糖 |
| Vite | ^7.0.0 | 最新构建工具，极速开发体验 |
| Pinia | ^2.3.0 | 官方状态管理库 |

### 开发依赖

| 技术 | 版本 | 说明 |
|------|------|------|
| ESLint | ^9.17.0 | 代码规范 |
| Prettier | ^3.4.2 | 代码格式化 |
| Sass | ^1.83.0 | CSS 预处理器 |

### 工具库

| 技术 | 版本 | 说明 |
|------|------|------|
| Axios | ^1.7.9 | HTTP 客户端 |
| Day.js | ^1.11.13 | 日期处理 |
| VueUse | ^11.4.0 | Vue 组合式工具集 |
| pinia-plugin-persistedstate | ^4.1.3 | Pinia 持久化插件 |

---

## 项目结构设计

```
switcher-frontend/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── fonts/                   # 字体文件
├── src/
│   ├── assets/                  # 资源文件
│   │   ├── styles/              # 全局样式
│   │   │   ├── main.scss        # 主样式文件
│   │   │   ├── variables.scss   # CSS 变量
│   │   │   ├── mixins.scss      # Sass mixins
│   │   │   └── reset.scss       # 样式重置
│   │   └── images/              # 图片资源
│   │
│   ├── components/              # 公共组件
│   │   ├── common/              # 通用组件
│   │   │   ├── AppHeader.vue    # 页面头部
│   │   │   ├── StatCard.vue     # 统计卡片
│   │   │   ├── EmptyState.vue   # 空状态
│   │   │   ├── Modal.vue        # 模态框
│   │   │   └── ToggleSwitch.vue # 开关组件
│   │   │
│   │   ├── provider/            # 中转站相关组件
│   │   │   ├── ProviderCard.vue      # 中转站卡片
│   │   │   ├── ProviderList.vue      # 中转站列表
│   │   │   ├── AddProviderModal.vue  # 添加中转站弹窗
│   │   │   └── EditProviderModal.vue # 编辑中转站弹窗
│   │   │
│   │   ├── logs/                # 日志相关组件
│   │   │   ├── LogTable.vue     # 日志表格
│   │   │   └── LogFilters.vue   # 日志筛选
│   │   │
│   │   └── settings/            # 设置相关组件
│   │       ├── SettingSection.vue    # 设置区块
│   │       ├── SettingRow.vue        # 设置行
│   │       ├── QuotaModal.vue        # 配额弹窗
│   │       ├── EnvVarModal.vue       # 环境变量弹窗
│   │       └── QuotaList.vue         # 配额列表
│   │
│   ├── views/                   # 页面视图
│   │   ├── Dashboard.vue        # 首页
│   │   ├── Logs.vue             # 日志页
│   │   └── Settings.vue         # 设置页
│   │
│   ├── stores/                  # Pinia 状态管理
│   │   ├── provider.js          # 中转站状态
│   │   ├── logs.js              # 日志状态
│   │   ├── settings.js          # 设置状态
│   │   └── stats.js             # 统计状态
│   │
│   ├── api/                     # API 服务层
│   │   ├── index.js             # Axios 实例配置
│   │   ├── provider.js          # 中转站 API
│   │   ├── logs.js              # 日志 API
│   │   ├── settings.js          # 设置 API
│   │   └── user.js              # 用户 API (余额/签到)
│   │
│   ├── composables/             # 组合式函数
│   │   ├── useAutoRefresh.js    # 自动刷新
│   │   ├── useNotification.js   # 通知
│   │   ├── useTabs.js           # Tab 切换逻辑
│   │   └── useLocalStorage.js   # 本地存储
│   │
│   ├── utils/                   # 工具函数
│   │   ├── format.js            # 格式化工具
│   │   ├── validation.js        # 验证工具
│   │   └── constants.js         # 常量定义
│   │
│   ├── App.vue                  # 根组件
│   └── main.js                  # 入口文件
│
├── .env.development             # 开发环境变量
├── .env.production              # 生产环境变量
├── .eslintrc.cjs                # ESLint 配置
├── .prettierrc.json             # Prettier 配置
├── index.html                   # HTML 模板
├── package.json                 # 项目配置
├── vite.config.js               # Vite 配置
└── README.md                    # 项目说明
```

---

## 依赖清单

### package.json 配置

```json
{
  "name": "claude-proxy-switcher-frontend",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx",
    "format": "prettier --write \"src/**/*.{vue,js,jsx,json,css,scss}\""
  },
  "dependencies": {
    "vue": "^3.5.13",
    "pinia": "^2.3.0",
    "pinia-plugin-persistedstate": "^4.1.3",
    "axios": "^1.7.9",
    "dayjs": "^1.11.13",
    "@vueuse/core": "^11.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^7.0.0",
    "sass": "^1.83.0",
    "eslint": "^9.17.0",
    "eslint-plugin-vue": "^9.31.0",
    "prettier": "^3.4.2"
  }
}
```

---

## 组件拆分方案

### 1. 公共组件 (components/common/)

#### AppHeader.vue
**功能**: 页面顶部导航栏（包含 Tab 切换）
```vue
<script setup>
import { useUserStore } from '@/stores/user'

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab', 'refresh'])

const userStore = useUserStore()

const tabs = [
  { id: 'dashboard', label: '首页' },
  { id: 'logs', label: '日志' },
  { id: 'settings', label: '设置' }
]

const handleTabChange = (tabId) => {
  emit('update:activeTab', tabId)
}

// 签到、刷新余额等功能
</script>
```

**Props**:
- `activeTab`: 当前激活的 tab

**Emits**:
- `update:activeTab`: 更新当前 tab
- `refresh`: 刷新数据

---

#### StatCard.vue
**功能**: 统计数据卡片
```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  }
})
</script>
```

**Props**:
- `title`: 卡片标题
- `value`: 显示值
- `icon`: 图标 (可选)
- `color`: 主题色 (可选)

---

#### Modal.vue
**功能**: 通用模态框组件
```vue
<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '500px'
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
</script>
```

**Props**:
- `modelValue`: 显示状态 (v-model)
- `title`: 标题
- `width`: 宽度
- `showFooter`: 是否显示底部按钮

**Emits**:
- `update:modelValue`: 更新显示状态
- `confirm`: 确认事件
- `cancel`: 取消事件

---

### 2. 中转站组件 (components/provider/)

#### ProviderCard.vue
**功能**: 单个中转站卡片
```vue
<script setup>
const props = defineProps({
  provider: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle', 'test'])
</script>
```

**Props**:
- `provider`: 中转站数据对象

**Emits**:
- `edit`: 编辑中转站
- `delete`: 删除中转站
- `toggle`: 切换启用状态
- `test`: 测试连接

---

#### ProviderList.vue
**功能**: 中转站列表容器
```vue
<script setup>
import { useProviderStore } from '@/stores/provider'
import ProviderCard from './ProviderCard.vue'

const providerStore = useProviderStore()
</script>
```

---

#### AddProviderModal.vue
**功能**: 添加中转站弹窗
```vue
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: '',
  url: '',
  apiKey: '',
  enabled: true
})
</script>
```

---

### 3. 日志组件 (components/logs/)

#### LogTable.vue
**功能**: 日志表格
```vue
<script setup>
const props = defineProps({
  logs: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>
```

**Props**:
- `logs`: 日志数据数组
- `loading`: 加载状态

---

#### LogFilters.vue
**功能**: 日志筛选器
```vue
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter'])

const filters = ref({
  level: 'all',
  search: '',
  dateRange: []
})
</script>
```

---

### 4. 设置组件 (components/settings/)

#### SettingSection.vue
**功能**: 设置区块容器
```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>
```

---

#### QuotaModal.vue
**功能**: 配额管理弹窗
```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  quota: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])
</script>
```

---

## 状态管理设计

### 1. Provider Store (stores/provider.js)

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as providerApi from '@/api/provider'

export const useProviderStore = defineStore('provider', () => {
  // State
  const providers = ref([])
  const loading = ref(false)
  const currentProvider = ref(null)

  // Getters
  const enabledProviders = computed(() =>
    providers.value.filter(p => p.enabled)
  )

  const providerCount = computed(() => providers.value.length)

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

  return {
    // State
    providers,
    loading,
    currentProvider,
    // Getters
    enabledProviders,
    providerCount,
    // Actions
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    toggleProvider,
    testProvider
  }
}, {
  persist: {
    key: 'provider-store',
    storage: localStorage,
    paths: ['providers', 'currentProvider']
  }
})
```

---

### 2. Logs Store (stores/logs.js)

```javascript
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
        log.message.toLowerCase().includes(search) ||
        log.provider?.toLowerCase().includes(search)
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
```

---

### 3. Settings Store (stores/settings.js)

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as settingsApi from '@/api/settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref({
    autoRefresh: true,
    refreshInterval: 30,
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

  return {
    // State
    settings,
    loading,
    // Actions
    fetchSettings,
    updateSettings,
    addQuota,
    updateQuota,
    deleteQuota
  }
}, {
  persist: {
    key: 'settings-store',
    storage: localStorage,
    paths: ['settings']
  }
})
```

---

### 4. User Store (stores/user.js)

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as userApi from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const balance = ref(0)
  const lastCheckIn = ref(null)
  const loading = ref(false)

  // Actions
  async function fetchBalance() {
    loading.value = true
    try {
      const data = await userApi.getBalance()
      balance.value = data.balance
      return data
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function checkIn() {
    try {
      const result = await userApi.checkIn()
      lastCheckIn.value = new Date().toISOString()
      await fetchBalance()
      return result
    } catch (error) {
      console.error('Failed to check in:', error)
      throw error
    }
  }

  return {
    // State
    balance,
    lastCheckIn,
    loading,
    // Actions
    fetchBalance,
    checkIn
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['balance', 'lastCheckIn']
  }
})
```

---

## Tab 切换设计

### App.vue 主组件

```javascript
<template>
  <div id="app">
    <AppHeader
      v-model:activeTab="activeTab"
      @refresh="handleRefresh"
    />

    <main class="main-content">
      <!-- Dashboard 视图 -->
      <Dashboard v-show="activeTab === 'dashboard'" />

      <!-- Logs 视图 -->
      <Logs v-show="activeTab === 'logs'" />

      <!-- Settings 视图 -->
      <Settings v-show="activeTab === 'settings'" />
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import Dashboard from '@/views/Dashboard.vue'
import Logs from '@/views/Logs.vue'
import Settings from '@/views/Settings.vue'

// 当前激活的 tab，默认为 dashboard
const activeTab = ref('dashboard')

// 监听 tab 变化，可以在这里做一些额外处理
watch(activeTab, (newTab) => {
  console.log('Tab changed to:', newTab)
  // 可以保存到 localStorage
  localStorage.setItem('activeTab', newTab)
})

// 从 localStorage 恢复上次的 tab
const savedTab = localStorage.getItem('activeTab')
if (savedTab) {
  activeTab.value = savedTab
}

const handleRefresh = () => {
  // 刷新当前页面的数据
  console.log('Refresh data for:', activeTab.value)
}
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding: 20px;
}
</style>
```

### composables/useTabs.js

可以创建一个可复用的 composable 来管理 tab 状态：

```javascript
import { ref, watch } from 'vue'

export function useTabs(defaultTab = 'dashboard') {
  const activeTab = ref(defaultTab)

  // 从 localStorage 恢复
  const savedTab = localStorage.getItem('activeTab')
  if (savedTab) {
    activeTab.value = savedTab
  }

  // 监听变化并保存
  watch(activeTab, (newTab) => {
    localStorage.setItem('activeTab', newTab)
  })

  const switchTab = (tabId) => {
    activeTab.value = tabId
  }

  return {
    activeTab,
    switchTab
  }
}
```

使用示例：

```javascript
<script setup>
import { useTabs } from '@/composables/useTabs'

const { activeTab, switchTab } = useTabs('dashboard')
</script>
```

---

## API 服务层

### 1. Axios 实例配置 (api/index.js)

```javascript
import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message || '请求失败'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default api
```

---

### 2. Provider API (api/provider.js)

```javascript
import api from './index'

// 获取所有中转站
export const getProviders = async () => {
  const response = await api.get('/providers')
  return response.providers
}

// 创建中转站
export const createProvider = async (provider) => {
  return await api.post('/providers', provider)
}

// 更新中转站
export const updateProvider = async (id, updates) => {
  return await api.put(`/providers/${id}`, updates)
}

// 删除中转站
export const deleteProvider = async (id) => {
  await api.delete(`/providers/${id}`)
}

// 测试中转站连接
export const testProvider = async (id) => {
  return await api.post(`/providers/${id}/test`)
}
```

---

### 3. Logs API (api/logs.js)

```javascript
import api from './index'

// 获取日志
export const getLogs = async () => {
  const response = await api.get('/logs')
  return response.logs
}

// 清空日志
export const clearLogs = async () => {
  await api.delete('/logs')
}
```

---

### 4. Settings API (api/settings.js)

```javascript
import api from './index'

// 获取设置
export const getSettings = async () => {
  return await api.get('/settings')
}

// 更新设置
export const updateSettings = async (updates) => {
  return await api.put('/settings', updates)
}

// 添加配额
export const addQuota = async (quota) => {
  return await api.post('/settings/quotas', quota)
}

// 更新配额
export const updateQuota = async (id, updates) => {
  return await api.put(`/settings/quotas/${id}`, updates)
}

// 删除配额
export const deleteQuota = async (id) => {
  await api.delete(`/settings/quotas/${id}`)
}
```

---

### 5. User API (api/user.js)

```javascript
import api from './index'

// 获取余额
export const getBalance = async () => {
  return await api.get('/user/balance')
}

// 签到
export const checkIn = async () => {
  return await api.post('/user/checkin')
}
```

---

## 迁移步骤

### 阶段 1: 项目初始化 (第 1 天)

#### 1.1 创建 Vue 3 项目

```bash
# 使用 Vite 创建项目
npm create vite@latest switcher-frontend -- --template vue

# 进入项目目录
cd switcher-frontend

# 安装依赖
npm install
```

#### 1.2 安装核心依赖

```bash
# 核心框架
npm install vue@^3.5.13 pinia@^2.3.0

# Pinia 持久化插件
npm install pinia-plugin-persistedstate@^4.1.3

# 工具库
npm install axios@^1.7.9 dayjs@^1.11.13 @vueuse/core@^11.4.0

# 开发依赖
npm install -D sass@^1.83.0 eslint@^9.17.0 prettier@^3.4.2
npm install -D eslint-plugin-vue@^9.31.0
```

#### 1.3 配置开发环境

创建配置文件：
- `.env.development`
- `.env.production`
- `.eslintrc.cjs`
- `.prettierrc.json`
- `vite.config.js`

#### 1.4 配置 Pinia 持久化

在 `src/main.js` 中配置 Pinia 持久化插件：

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')
```

#### 1.5 开发环境启动

**重要**: Vite 在开发环境下**不需要打包**，直接启动开发服务器即可。

```bash
# 启动开发服务器
npm run dev
```

启动后，Vite 会：
1. 启动一个本地开发服务器（默认 http://localhost:5173）
2. 自动打开浏览器
3. 实时监听文件变化
4. 自动热更新（HMR - Hot Module Replacement）

**热更新说明**:
- 修改 `.vue` 文件后，浏览器会**自动刷新**显示最新内容
- 修改 `.js` 文件后，也会**自动更新**
- 修改 `.scss` 文件后，样式会**即时更新**，无需刷新页面
- **无需手动刷新浏览器**，Vite 会自动处理

**开发流程**:
```bash
# 1. 启动开发服务器
npm run dev

# 2. 在编辑器中修改代码
# 3. 保存文件
# 4. 浏览器自动更新，立即看到效果

# 开发完成后，构建生产版本
npm run build
```

**与传统开发的区别**:
- ❌ 传统方式: 修改代码 → 重新打包 → 刷新浏览器 → 看到效果（慢）
- ✅ Vite 方式: 修改代码 → 保存 → 自动更新 → 立即看到效果（快）

#### 1.5 开发环境启动

**重要说明**：Vite 在开发环境下**不需要打包**，直接启动开发服务器即可。

```bash
# 启动开发服务器
npm run dev
```

**Vite 开发模式特点**：
1. **即时启动**：无需打包，秒级启动开发服务器
2. **热模块替换 (HMR)**：修改代码后，浏览器会自动更新，无需刷新页面
3. **按需编译**：只编译当前访问的页面，速度极快
4. **实时预览**：保存文件后，浏览器立即显示最新效果

**开发流程**：
```bash
# 1. 启动开发服务器
npm run dev

# 2. 浏览器自动打开 http://localhost:3000

# 3. 修改代码（如 src/App.vue）

# 4. 保存文件

# 5. 浏览器自动热更新，立即看到效果（无需手动刷新）
```

**热更新说明**：
- **Vue 组件**：修改 `.vue` 文件后，组件会自动热更新，保持当前状态
- **样式文件**：修改 CSS/SCSS 后，样式会立即更新，无需刷新页面
- **JavaScript**：修改 JS 文件后，会自动重新加载模块
- **配置文件**：修改 `vite.config.js` 等配置文件需要重启开发服务器

**生产环境打包**：
```bash
# 只有在部署时才需要打包
npm run build

# 打包后的文件在 dist/ 目录
# 可以使用 npm run preview 预览打包结果
npm run preview
```

---

#### 1.6 前后端联调配置

由于你的 Node.js 后端运行在 `localhost:5679`，而 Vite 开发服务器默认运行在 `localhost:5173`，需要配置代理来实现前后端联调。

**配置步骤**：

##### 1. 配置 Vite 代理

创建/修改 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  server: {
    port: 5173, // 前端开发服务器端口
    proxy: {
      // 所有以 /api 开头的请求都会被代理到后端
      '/api': {
        target: 'http://localhost:5679', // 后端服务器地址
        changeOrigin: true,
        // 如果后端 API 路径不包含 /api 前缀，可以使用 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

**代理说明**：
- 前端请求 `http://localhost:5173/api/providers`
- Vite 会自动转发到 `http://localhost:5679/api/providers`
- 浏览器不会有跨域问题

##### 2. 配置环境变量

创建 `.env.development`（开发环境）：

```bash
# 开发环境 - API 基础路径
VITE_API_BASE_URL=/api

# 如果后端 API 没有 /api 前缀，直接使用空字符串
# VITE_API_BASE_URL=
```

创建 `.env.production`（生产环境）：

```bash
# 生产环境 - API 基础路径
VITE_API_BASE_URL=http://localhost:5679/api

# 或者使用实际的生产域名
# VITE_API_BASE_URL=https://your-domain.com/api
```

##### 3. 配置 Axios 基础路径

修改 `src/api/index.js`：

```javascript
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 token 等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request
```

##### 4. 开发环境运行流程

**启动顺序**：

```bash
# 终端 1: 启动后端服务器（Node.js）
cd e:\switcher
node server.js  # 或者你的后端启动命令，运行在 5679 端口

# 终端 2: 启动前端开发服务器（Vite）
cd e:\switcher\frontend  # 假设前端项目在 frontend 目录
npm run dev  # 运行在 5173 端口
```

**访问方式**：
- 打开浏览器访问 `http://localhost:5173`
- 前端页面会通过 Vite 代理自动转发 API 请求到后端 `localhost:5679`

**调试说明**：
- 前端修改代码后，Vite 会自动热更新
- 后端修改代码后，需要重启 Node.js 服务器（可以使用 nodemon 实现自动重启）
- 在浏览器开发者工具的 Network 面板可以看到所有 API 请求

##### 5. 生产环境部署

生产环境下，有两种部署方式：

**方式 1: 前后端分离部署**
```bash
# 1. 构建前端
npm run build

# 2. 前端静态文件部署到 Nginx/CDN
# dist/ 目录包含所有静态文件

# 3. 后端独立部署
# 需要配置 CORS 允许前端域名访问
```

**方式 2: 前端静态文件由后端服务**
```bash
# 1. 构建前端
npm run build

# 2. 将 dist/ 目录复制到后端项目
cp -r dist/* ../public/

# 3. 后端配置静态文件服务
# Node.js 使用 express.static('public') 提供静态文件服务

# 4. 访问 http://localhost:5679 即可
```

**推荐使用方式 2**，这样只需要运行一个服务器，配置更简单。

---

### 阶段 2: 基础架构搭建 (第 2-3 天)

#### 2.1 创建项目结构

```bash
# 创建目录结构
mkdir -p src/{assets/styles,components/{common,provider,logs,settings},views,stores,api,composables,utils}
```

#### 2.2 配置 Tab 切换

创建 `src/composables/useTabs.js`，实现 tab 切换逻辑。

#### 2.3 配置 Pinia

创建 `src/stores/` 下的各个 store 文件：
- `provider.js`
- `logs.js`
- `settings.js`
- `user.js`

**注意**: 每个 store 都需要配置 `persist` 选项来启用持久化，例如：

```javascript
export const useProviderStore = defineStore('provider', () => {
  // ... store 逻辑
}, {
  persist: {
    key: 'provider-store',
    storage: localStorage,
    paths: ['providers', 'currentProvider'] // 指定需要持久化的字段
  }
})
```

#### 2.4 配置 Axios

创建 `src/api/index.js`，配置请求拦截器和响应拦截器。

#### 2.5 创建 App.vue

创建主组件 `src/App.vue`，实现 tab 切换逻辑：
- 使用 `v-show` 控制不同视图的显示
- 集成 AppHeader 组件
- 实现 tab 状态管理

---

### 阶段 3: 数据结构定义 (第 3 天)

#### 3.1 定义数据结构

在 `src/utils/constants.js` 中定义常量和数据结构说明：

**数据结构示例**:
```javascript
// Provider 数据结构
// {
//   id: string,
//   name: string,
//   url: string,
//   apiKey: string,
//   enabled: boolean,
//   status: 'online' | 'offline' | 'testing',
//   latency: number,
//   lastTest: string,
//   createdAt: string,
//   updatedAt: string
// }

// LogEntry 数据结构
// {
//   id: string,
//   timestamp: string,
//   level: 'info' | 'warn' | 'error' | 'debug',
//   message: string,
//   provider: string,
//   details: any
// }

// Settings 数据结构
// {
//   autoRefresh: boolean,
//   refreshInterval: number,
//   quotas: QuotaConfig[],
//   envVars: EnvVar[]
// }

export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
}

export const PROVIDER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  TESTING: 'testing'
}
```

---

### 阶段 4: 公共组件开发 (第 4-5 天)

#### 4.1 基础组件

按优先级开发：
1. `AppHeader.vue` - 页面头部（包含 Tab 切换，最高优先级）
2. `Modal.vue` - 模态框
3. `StatCard.vue` - 统计卡片
4. `ToggleSwitch.vue` - 开关组件
5. `EmptyState.vue` - 空状态

#### 4.2 组件测试

每个组件开发完成后，在对应的 view 中测试显示效果。

---

### 阶段 5: 页面视图开发 (第 6-10 天)

#### 5.1 Dashboard 页面 (第 6-7 天)

**功能模块**:
1. 统计卡片区域 (StatCard × 4)
2. 中转站列表 (ProviderList)
3. 添加/编辑中转站弹窗

**开发顺序**:
1. 创建 `Dashboard.vue` 基础结构
2. 集成 `useProviderStore`
3. 开发 `ProviderCard.vue`
4. 开发 `ProviderList.vue`
5. 开发 `AddProviderModal.vue`
6. 开发 `EditProviderModal.vue`
7. 实现数据加载和刷新逻辑

**注意**: Dashboard 组件不需要处理路由，只需要在 `v-show="activeTab === 'dashboard'"` 时显示。

#### 5.2 Logs 页面 (第 8 天)

**功能模块**:
1. 日志筛选器 (LogFilters)
2. 日志表格 (LogTable)
3. 清空日志功能

**开发顺序**:
1. 创建 `Logs.vue` 基础结构
2. 集成 `useLogsStore`
3. 开发 `LogFilters.vue`
4. 开发 `LogTable.vue`
5. 实现筛选和搜索逻辑

**注意**: Logs 组件不需要处理路由，只需要在 `v-show="activeTab === 'logs'"` 时显示。

#### 5.3 Settings 页面 (第 9-10 天)

**功能模块**:
1. 基础设置区块
2. 配额管理 (QuotaModal, QuotaList)
3. 环境变量管理 (EnvVarModal)

**开发顺序**:
1. 创建 `Settings.vue` 基础结构
2. 集成 `useSettingsStore`
3. 开发 `SettingSection.vue`
4. 开发 `SettingRow.vue`
5. 开发 `QuotaModal.vue`
6. 开发 `QuotaList.vue`
7. 开发 `EnvVarModal.vue`

**注意**: Settings 组件不需要处理路由，只需要在 `v-show="activeTab === 'settings'"` 时显示。

---

### 阶段 6: 样式迁移 (第 11 天)

#### 6.1 提取原有样式

从原 HTML 文件中提取 CSS：
1. 全局样式 → `assets/styles/main.scss`
2. CSS 变量 → `assets/styles/variables.scss`
3. 通用样式 → `assets/styles/reset.scss`

#### 6.2 组件样式

将样式分配到对应组件的 `<style scoped>` 中。

#### 6.3 响应式适配

确保所有页面在不同屏幕尺寸下正常显示。

---

### 阶段 7: 功能集成 (第 12-13 天)

#### 7.1 API 集成

1. 连接后端 API
2. 测试所有接口调用
3. 处理错误情况

#### 7.2 状态持久化

使用 `localStorage` 或 `sessionStorage` 持久化必要数据：
- 用户偏好设置
- 最后访问的页面
- 筛选条件等

#### 7.3 自动刷新

实现自动刷新功能：
```javascript
// composables/useAutoRefresh.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useAutoRefresh(callback, interval = 30000) {
  const timer = ref(null)

  const start = () => {
    if (timer.value) return
    timer.value = window.setInterval(callback, interval)
  }

  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  onMounted(() => {
    callback() // 立即执行一次
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return { start, stop }
}
```

---

### 阶段 8: 测试与优化 (第 14 天)

#### 8.1 功能测试

测试所有功能点：
- [ ] 中转站的增删改查
- [ ] 中转站启用/禁用切换
- [ ] 中转站连接测试
- [ ] 日志查看和筛选
- [ ] 日志清空
- [ ] 配额管理
- [ ] 环境变量管理
- [ ] 用户签到
- [ ] 余额刷新
- [ ] 自动刷新

#### 8.2 性能优化

1. 组件懒加载
2. 图片优化
3. 代码分割
4. 打包体积优化

#### 8.3 浏览器兼容性测试

测试主流浏览器：
- Chrome
- Firefox
- Safari
- Edge

---

### 阶段 9: 部署准备 (第 15 天)

#### 9.1 构建配置

配置 `vite.config.js`：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5679',
        changeOrigin: true
      }
    }
  }
})
```

#### 9.2 环境变量配置

**.env.development**:
```env
VITE_API_BASE_URL=http://localhost:5679/api
VITE_APP_TITLE=Claude Proxy Switcher
```

**.env.production**:
```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Claude Proxy Switcher
```

#### 9.3 构建和部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 注意事项

### 1. 代码规范

#### 1.1 命名规范
- **组件名**: 使用 PascalCase (如 `ProviderCard.vue`)
- **文件名**: 组件使用 PascalCase，其他使用 kebab-case
- **变量名**: 使用 camelCase
- **常量名**: 使用 UPPER_SNAKE_CASE
- **类型名**: 使用 PascalCase

#### 1.2 组件规范
- 优先使用 `<script setup>` 语法
- Props 和 Emits 使用 `defineProps` 和 `defineEmits` 定义
- 复杂逻辑抽取到 composables
- 使用 JSDoc 注释说明复杂函数

#### 1.3 样式规范
- 组件样式使用 `<style scoped>`
- 全局样式放在 `assets/styles/`
- 使用 CSS 变量管理主题色
- 避免深层嵌套 (最多 3 层)

---

### 2. 性能优化

#### 2.1 组件优化
- 使用 `v-show` 代替频繁切换的 `v-if`
- 长列表使用虚拟滚动
- 大组件使用异步组件 (`defineAsyncComponent`)
- 合理使用 `computed` 缓存计算结果

#### 2.2 请求优化
- 避免重复请求
- 使用请求取消 (AbortController)
- 实现请求缓存
- 合并相似请求

#### 2.3 打包优化
- 代码分割 (路由懒加载)
- Tree Shaking
- 压缩资源
- CDN 加速

---

### 3. 安全注意事项

#### 3.1 XSS 防护
- 避免使用 `v-html`
- 对用户输入进行转义
- 使用 CSP (Content Security Policy)

#### 3.2 API 安全
- 敏感信息不要存储在前端
- API Key 通过环境变量管理
- 实现请求签名验证

#### 3.3 数据验证
- 前端表单验证
- 后端数据二次验证
- 防止 SQL 注入

---

### 4. 兼容性处理

#### 4.1 浏览器兼容
- 使用 Autoprefixer 自动添加前缀
- Polyfill 必要的 API
- 测试主流浏览器

#### 4.2 移动端适配
- 响应式布局
- Touch 事件支持
- 视口配置

---

### 5. 开发建议


#### 5.2 代码审查
- 每个 PR 至少一人审查
- 关注代码质量和性能
- 检查类型定义完整性

#### 5.3 文档维护
- 及时更新 README
- 编写组件使用文档
- 记录重要决策

---

### 6. 常见问题

#### 6.1 Tab 切换状态保持
**问题**: 切换 tab 后，之前的状态丢失

**解决**: 使用 `v-show` 而不是 `v-if`，这样组件不会被销毁
```javascript
<!-- 正确做法 -->
<Dashboard v-show="activeTab === 'dashboard'" />
<Logs v-show="activeTab === 'logs'" />
<Settings v-show="activeTab === 'settings'" />

<!-- 错误做法 -->
<Dashboard v-if="activeTab === 'dashboard'" />
```

#### 6.2 API 跨域问题
**问题**: 开发环境 API 请求跨域

**解决**: Vite 配置代理
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5679',
      changeOrigin: true
    }
  }
}
```

#### 6.3 打包体积过大
**问题**: 打包后文件体积超过 1MB

**解决**:
1. 使用 `v-show` 进行 tab 切换，避免组件重复加载
2. 按需引入第三方库
3. 开启 Gzip 压缩
4. 使用 CDN 加载大型库

#### 6.4 状态丢失
**问题**: 刷新页面后状态丢失

**解决**: 使用 `pinia-plugin-persistedstate` 插件持久化状态（已在项目中配置）

```javascript
// 在 main.js 中配置
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 在 store 中使用
export const useProviderStore = defineStore('provider', () => {
  // ... store 逻辑
}, {
  persist: {
    key: 'provider-store',
    storage: localStorage,
    paths: ['providers'] // 指定需要持久化的字段
  }
})
```

---

### 7. 后续优化方向

#### 7.1 功能增强
- [ ] 添加暗黑模式
- [ ] 支持多语言 (i18n)
- [ ] 添加数据导出功能
- [ ] 实现实时通知

#### 7.2 技术升级
- [ ] 添加单元测试 (Vitest)
- [ ] 添加 E2E 测试 (Playwright)
- [ ] 集成 CI/CD
- [ ] 性能监控

#### 7.3 用户体验
- [ ] 添加加载骨架屏
- [ ] 优化动画效果
- [ ] 添加快捷键支持
- [ ] 改进错误提示

---

## 总结

本迁移文档提供了从单 HTML 文件到 Vue 3 + Vite 现代化前端架构的完整迁移方案。遵循本文档的步骤和规范，可以确保迁移过程顺利进行，并构建出高质量、可维护的前端应用。

**预计工期**: 15 个工作日

**技术栈**: Vue 3.5 + Vite 7 + Pinia 2 + pinia-plugin-persistedstate

**关键优势**:
- ✅ 现代化开发体验
- ✅ 组件化架构，易于维护
- ✅ 状态管理规范 (Pinia + 持久化)
- ✅ Tab 切换流畅（使用 v-show）
- ✅ 构建速度快 (Vite)
- ✅ 代码质量高 (ESLint + Prettier)
- ✅ 数据持久化 (localStorage)
- ✅ 单页面应用，无需路由配置

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-10
**维护者**: Claude Code
```
