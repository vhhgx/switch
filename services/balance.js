import { getUserSelf } from './user.js'
import { getProviders, toggleProvider } from './provider.js'
import { getSettings } from './settings.js'
import { c, ts, providerTag } from '../utils/logger.js'

// 每个 provider 上次检查的时间戳  { [providerId]: timestamp }
const lastCheckTime = {}

/**
 * 在代理请求成功后调用。
 * 若该中转站距上次检查超过冷却期，则异步检查余额；低于阈值时自动禁用。
 * 完全 fire-and-forget，不阻塞主请求。
 */
function scheduleBalanceCheck(provider) {
  _check(provider).catch(() => {}) // 不向上抛出
}

async function _check(provider) {
  // 1. 读取设置，判断功能是否启用
  const settings = await getSettings()
  const threshold = settings.provider?.balanceThreshold ?? 0
  const intervalMin = settings.provider?.balanceCheckInterval ?? 10

  if (!settings.provider?.autoDisable || threshold <= 0) return
  if (!provider.token) return

  // 2. 冷却期判断
  const now = Date.now()
  const last = lastCheckTime[provider.id] || 0
  if (now - last < intervalMin * 60 * 1000) return

  lastCheckTime[provider.id] = now

  // 3. 调用余额接口
  const result = await getUserSelf(provider.baseUrl, provider.token, provider.userId)
  if (!result.success) return

  // 4. 使用该中转站配置的配额模式计算余额
  const quotaModes = settings.quotaModes || []
  const quotaModeId = provider.quotaMethod ? parseInt(provider.quotaMethod) : 0
  const quotaMode = quotaModes.find((q) => q.id === quotaModeId) || quotaModes[0]
  if (!quotaMode) return

  const total = result.data?.data?.quota ?? 0
  const used  = result.data?.data?.used_quota ?? 0
  const balance = (total / quotaMode.ratio) * quotaMode.exchangeRate
  const currencySymbol = quotaMode.currency === 'CNY' ? '¥' : '$'

  console.log(
    `${ts()}  ${c.gray}💰 余额检查${c.r}  ${providerTag(provider.name)}  ` +
    `${c.white}${currencySymbol}${balance.toFixed(2)}${c.r}  ${c.gray}阈值 ${currencySymbol}${threshold}${c.r}`
  )

  // 5. 低于阈值 → 自动禁用
  if (balance < threshold) {
    const providers = getProviders()
    const current = providers.find((p) => p.id === provider.id)
    if (current && current.enabled) {
      toggleProvider(provider.id)
      console.log(
        `${ts()}  ${c.yellow}⚠️  余额不足自动禁用${c.r}  ${providerTag(provider.name, c.yellow)}  ` +
        `${c.yellow}${currencySymbol}${balance.toFixed(2)} < 阈值 ${currencySymbol}${threshold}${c.r}`
      )
    }
  }
}

export { scheduleBalanceCheck }
