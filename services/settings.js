import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SETTINGS_FILE = path.join(__dirname, '../settings.json')

// 默认设置
const DEFAULT_SETTINGS = {
  general: {
    autoRefresh: true,
    refreshInterval: 5,
    maxLogs: 100
  },
  provider: {
    retryAttempts: 3,
    requestTimeout: 60,
    autoDisable: false
  },
  notification: {
    notifyOnError: true,
    notifyOnProviderDown: true,
    soundEnabled: false
  },
  quotaModes: [
    {
      id: 0,
      name: '默认',
      currency: 'CNY',
      ratio: 500000,
      exchangeRate: 1,
      isDefault: true
    }
  ],
  envVariables: {
    PORT: '3000',
    NODE_ENV: 'production'
  }
}

// 读取设置
export async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    const settings = JSON.parse(data)

    // 确保默认配额模式存在
    if (!settings.quotaModes) {
      settings.quotaModes = []
    }

    // 检查是否存在默认配额模式
    const hasDefaultQuota = settings.quotaModes.some(q => q.isDefault)
    if (!hasDefaultQuota) {
      // 添加默认配额模式到列表开头
      settings.quotaModes.unshift({
        id: 0,
        name: '默认',
        currency: 'CNY',
        ratio: 500000,
        exchangeRate: 1,
        isDefault: true
      })
      // 保存更新后的设置
      await saveSettings(settings)
    }

    return settings
  } catch (error) {
    // 如果文件不存在，创建默认设置
    await saveSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
}

// 保存设置
export async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

// 更新设置
export async function updateSettings(updates) {
  const currentSettings = await getSettings()
  const newSettings = {
    ...currentSettings,
    ...updates,
    // 深度合并嵌套对象
    general: { ...currentSettings.general, ...updates.general },
    provider: { ...currentSettings.provider, ...updates.provider },
    notification: { ...currentSettings.notification, ...updates.notification }
  }
  await saveSettings(newSettings)
  return newSettings
}

// 添加配额模式
export async function addQuotaMode(quotaMode) {
  const settings = await getSettings()
  const newQuotaMode = {
    id: Date.now(),
    ...quotaMode
  }
  settings.quotaModes.push(newQuotaMode)
  await saveSettings(settings)
  return newQuotaMode
}

// 更新配额模式
export async function updateQuotaMode(id, updates) {
  const settings = await getSettings()
  const index = settings.quotaModes.findIndex(q => q.id === parseInt(id))
  if (index === -1) {
    throw new Error('配额模式不存在')
  }
  settings.quotaModes[index] = {
    ...settings.quotaModes[index],
    ...updates
  }
  await saveSettings(settings)
  return settings.quotaModes[index]
}

// 删除配额模式
export async function deleteQuotaMode(id) {
  const settings = await getSettings()
  const quotaToDelete = settings.quotaModes.find(q => q.id === parseInt(id))

  // 防止删除默认配额模式
  if (quotaToDelete && quotaToDelete.isDefault) {
    throw new Error('默认配额模式不可删除')
  }

  settings.quotaModes = settings.quotaModes.filter(q => q.id !== parseInt(id))
  await saveSettings(settings)
  return settings.quotaModes
}

// 重置设置
export async function resetSettings() {
  await saveSettings(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
