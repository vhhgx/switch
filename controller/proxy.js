import * as providerService from '../services/provider.js'
import * as logService from '../services/log.js'
import * as proxyService from '../services/proxy.js'
import { scheduleBalanceCheck } from '../services/balance.js'
import { c, ts, providerTag, statusBadge, ms } from '../utils/logger.js'

const handleProxyRequest = async (ctx) => {
  const providers = providerService.getProviders().filter((p) => p.enabled)

  if (providers.length === 0) {
    ctx.status = 503
    ctx.body = {
      error: {
        type: 'overloaded_error',
        message: '本地代理：没有可用的中转站'
      }
    }
    return
  }

  const startTime = Date.now()
  let logEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    method: ctx.method,
    path: ctx.path,
    status: null,
    provider: null,
    model: null,
    protocol: 'Claude',
    account: null,
    tokenInput: 0,
    tokenOutput: 0,
    duration: 0,
    success: false
  }

  for (const provider of providers) {
    try {
      const { response, actualModel } = await proxyService.forwardRequest(provider, ctx)

      const isErrorStatus = [401, 402, 404, 429].includes(response.status)

      if (isErrorStatus) {
        const errorMsg =
          response.status === 401 ? 'API Key 无效' :
          response.status === 402 ? '余额不足' :
          response.status === 404 ? 'URL 路径错误' :
          '请求过于频繁'

        console.log(`${ts()}  ${c.yellow}✗${c.r}  ${providerTag(provider.name, c.yellow)}  ${statusBadge(response.status)}  ${c.yellow}${errorMsg}${c.r}  ${c.gray}→ 切换...${c.r}`)

        if (providers.length > 1) {
          continue
        } else {
          let errorBody
          try {
            const chunks = []
            for await (const chunk of response.data) {
              chunks.push(chunk)
            }
            const text = Buffer.concat(chunks).toString('utf-8')
            errorBody = JSON.parse(text)
          } catch (e) {
            errorBody = {
              error: {
                type: 'authentication_error',
                message: `代理错误: ${errorMsg}`
              }
            }
          }

          ctx.status = response.status
          ctx.set('Content-Type', 'application/json')
          ctx.body = errorBody

          logEntry.status = response.status
          logEntry.provider = provider.name
          logEntry.duration = Date.now() - startTime
          logEntry.success = false
          logEntry.model = actualModel || ctx.request.body?.model || null
          logService.addLog(logEntry)

          console.log(`${ts()}  ${c.red}✗${c.r}  ${providerTag(provider.name, c.red)}  ${statusBadge(response.status)}  ${c.red}${errorMsg}${c.r}`)
          return
        }
      }

      ctx.status = response.status

      Object.keys(response.headers).forEach((key) => {
        if (key.toLowerCase().startsWith('anthropic-')) {
          ctx.set(key, response.headers[key])
        }
      })

      if (ctx.path.includes('messages')) {
        ctx.set('Content-Type', 'text/event-stream')
        ctx.set('Cache-Control', 'no-cache')
        ctx.set('Connection', 'keep-alive')
      } else {
        if (response.headers['content-type']) {
          ctx.set('Content-Type', response.headers['content-type'])
        }
      }

      // 为 stream 添加错误处理包装器
      if (response.data && typeof response.data.pipe === 'function') {
        const originalStream = response.data

        // 监听 stream 错误
        originalStream.on('error', (err) => {
          console.log(`${ts()}  ${c.red}✗${c.r}  ${providerTag(provider.name, c.red)}  ${c.red}Stream 中断${c.r}  ${c.gray}${err.code || err.message}  数据已部分传输，无法切换${c.r}`)

          // 记录失败日志
          logEntry.status = 502
          logEntry.provider = provider.name
          logEntry.duration = Date.now() - startTime
          logEntry.success = false
          if (ctx.request.body && ctx.request.body.model) {
            logEntry.model = ctx.request.body.model
          }
          logService.addLog(logEntry)
        })

        originalStream.on('end', () => {}) // 传输完成由下方成功行统一打印
      }

      ctx.body = response.data

      logEntry.status = response.status
      logEntry.provider = provider.name
      logEntry.duration = Date.now() - startTime
      logEntry.success = true
      logEntry.account = ctx.headers['anthropic-client-id'] || 'N/A'

      if (response.headers['anthropic-ratelimit-tokens-input']) {
        logEntry.tokenInput = parseInt(response.headers['anthropic-ratelimit-tokens-input']) || 0
      }
      if (response.headers['anthropic-ratelimit-tokens-output']) {
        logEntry.tokenOutput = parseInt(response.headers['anthropic-ratelimit-tokens-output']) || 0
      }

      logEntry.model = actualModel || ctx.request.body?.model || null

      logService.addLog(logEntry)

      // 异步余额检查（fire-and-forget，冷却期内最多触发一次，不阻塞响应）
      scheduleBalanceCheck(provider)

      const origModel = ctx.request.body?.model
      const modelLabel = !actualModel
        ? c.gray + '-' + c.r
        : origModel && origModel !== actualModel
          ? `${c.dim}${origModel}${c.r} ${c.gray}→${c.r} ${c.cyan}${actualModel}${c.r}`
          : `${c.cyan}${actualModel}${c.r}`
      console.log(`${ts()}  ${c.green}✓${c.r}  ${providerTag(provider.name, c.green)}  ${statusBadge(response.status)}  ${modelLabel}  ${ms(Date.now() - startTime)}`)
      return
    } catch (err) {
      const errorDetails = {
        message: err.message,
        code: err.code,
        status: err.response?.status
      }

      const errHint =
        err.code === 'ECONNABORTED' ? '请求超时' :
        err.code === 'ECONNRESET'   ? '连接被重置' :
        err.code === 'ENOTFOUND'    ? '域名解析失败' :
        err.code === 'ETIMEDOUT'    ? '连接超时' :
        err.message
      const isLast = providers.indexOf(provider) >= providers.length - 1
      const suffix = isLast ? '' : `  ${c.gray}→ 切换...${c.r}`
      console.log(`${ts()}  ${c.red}✗${c.r}  ${providerTag(provider.name, c.red)}  ${c.red}${err.code || 'ERR'}${c.r}  ${c.gray}${errHint}${c.r}${suffix}`)
    }
  }

  console.log(`${ts()}  ${c.red}✗${c.r}  ${c.red}${c.bold}502${c.r}  ${c.red}所有中转站均失败${c.r}`)

  ctx.status = 502
  ctx.body = { error: { type: 'api_error', message: '所有中转站均请求失败' } }

  logEntry.status = 502
  logEntry.provider = '所有中转站'
  logEntry.duration = Date.now() - startTime
  logEntry.success = false
  logEntry.model = ctx.request.body?.model || null
  logService.addLog(logEntry)
}

export { handleProxyRequest }
