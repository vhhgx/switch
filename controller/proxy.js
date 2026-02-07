import * as providerService from '../services/provider.js'
import * as logService from '../services/log.js'
import * as proxyService from '../services/proxy.js'

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
      const response = await proxyService.forwardRequest(provider, ctx)

      const isErrorStatus = [401, 402, 404, 429].includes(response.status)

      if (isErrorStatus) {
        const errorMsg =
          response.status === 401 ? 'API Key 无效' :
          response.status === 402 ? '余额不足' :
          response.status === 404 ? 'URL 路径错误' :
          '请求过于频繁'

        console.warn(`⚠️ [${provider.name}] 返回 ${response.status} (${errorMsg})`)

        if (providers.length > 1) {
          console.log(`   ↻ 正在切换到下一个中转站...`)
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
          if (ctx.request.body && ctx.request.body.model) {
            logEntry.model = ctx.request.body.model
          }
          logService.addLog(logEntry)

          console.error(`   ✗ 没有其他可用中转站，请求失败`)
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

      if (ctx.request.body && ctx.request.body.model) {
        logEntry.model = ctx.request.body.model
      }

      logService.addLog(logEntry)

      console.log(`✅ [${provider.name}] 请求成功 (${response.status})`)
      return
    } catch (err) {
      console.error(`❌ [${provider.name}] 连接失败: ${err.message}`)
      if (err.code === 'ECONNABORTED') {
        console.error(`   (原因: 请求超时，请检查该中转站是否被墙或 URL 错误)`)
      }
    }
  }

  ctx.status = 502
  ctx.body = { error: { type: 'api_error', message: '所有中转站均请求失败' } }

  logEntry.status = 502
  logEntry.provider = '所有中转站'
  logEntry.duration = Date.now() - startTime
  logEntry.success = false
  if (ctx.request.body && ctx.request.body.model) {
    logEntry.model = ctx.request.body.model
  }
  logService.addLog(logEntry)
}

export { handleProxyRequest }
