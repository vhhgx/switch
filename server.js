const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const serve = require('koa-static')
const fs = require('fs-extra')
const axios = require('axios')
const path = require('path')

const app = new Koa()
const CONFIG_PATH = path.join(__dirname, 'providers.json')

// 📊 请求日志存储（最多保留 100 条）
const requestLogs = []
const MAX_LOGS = 100

// ⚠️ 必须最先注册 bodyParser，否则 POST 请求读不到 body
app.use(bodyParser())

// --- 配置文件管理 ---
const getProviders = () => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) fs.writeJsonSync(CONFIG_PATH, [])
    return fs.readJsonSync(CONFIG_PATH)
  } catch (e) {
    return []
  }
}
const saveProviders = (data) =>
  fs.writeJsonSync(CONFIG_PATH, data, { spaces: 2 })

// --- 管理后台路由 ---
app.use(async (ctx, next) => {
  // GET: 获取所有配置
  if (ctx.path === '/api/providers' && ctx.method === 'GET') {
    ctx.body = getProviders()
    return
  }

  // POST: 添加新配置
  if (ctx.path === '/api/providers' && ctx.method === 'POST') {
    const providers = getProviders()
    providers.push({ id: Date.now(), ...ctx.request.body, enabled: true })
    saveProviders(providers)
    ctx.body = { success: true }
    return
  }

  // PATCH: 切换启用/禁用
  if (ctx.path.match(/\/api\/providers\/\d+\/toggle/) && ctx.method === 'PATCH') {
    const id = parseInt(ctx.path.split('/')[3])
    const providers = getProviders()
    const item = providers.find((p) => p.id === id)
    if (item) item.enabled = !item.enabled
    saveProviders(providers)
    ctx.body = { success: true }
    return
  }

  // PATCH: 更新中转站信息
  if (ctx.path.match(/\/api\/providers\/\d+$/) && ctx.method === 'PATCH') {
    const id = parseInt(ctx.path.split('/')[3])
    const providers = getProviders()
    const item = providers.find((p) => p.id === id)
    if (item) {
      // 更新名称、Base URL 和 API Key
      if (ctx.request.body.name) item.name = ctx.request.body.name
      if (ctx.request.body.baseUrl) item.baseUrl = ctx.request.body.baseUrl
      if (ctx.request.body.apiKey) item.apiKey = ctx.request.body.apiKey
    }
    saveProviders(providers)
    ctx.body = { success: true }
    return
  }

  // DELETE: 删除配置
  if (ctx.path.match(/\/api\/providers\/\d+$/) && ctx.method === 'DELETE') {
    const id = parseInt(ctx.path.split('/')[3])
    const providers = getProviders().filter((p) => p.id !== id)
    saveProviders(providers)
    ctx.body = { success: true }
    return
  }

  // GET: 获取请求日志
  if (ctx.path === '/api/logs' && ctx.method === 'GET') {
    ctx.body = requestLogs.slice().reverse() // 最新的在前
    return
  }

  // DELETE: 清空日志
  if (ctx.path === '/api/logs' && ctx.method === 'DELETE') {
    requestLogs.length = 0
    ctx.body = { success: true }
    return
  }

  await next()
})

// --- 🛡️ 核心修复：智能 URL 拼接函数 ---
function buildTargetUrl(baseUrl, requestPath) {
  // 1. 清洗 Base URL：去掉末尾的所有 / 和 /v1
  // 例如: "https://api.x.com/v1/" -> "https://api.x.com"
  let cleanBase = baseUrl.trim().replace(/\/+$/, '')
  if (cleanBase.endsWith('/v1')) {
    cleanBase = cleanBase.substring(0, cleanBase.length - 3)
  }

  // 2. 清洗请求路径：确保只保留一个 /v1 开头
  // Claude 有时会发 /v1/messages，有时配置错会发 /v1/v1/messages
  let cleanPath = requestPath
  if (cleanPath.startsWith('/v1/v1/')) {
    cleanPath = cleanPath.replace('/v1/v1/', '/v1/')
  } else if (!cleanPath.startsWith('/v1/')) {
    // 如果请求没带 v1 (极少见)，手动补上
    cleanPath = '/v1' + cleanPath
  }

  return `${cleanBase}${cleanPath}`
}

// --- 核心转发逻辑 ---
app.use(async (ctx) => {
  // 静态资源服务
  if (!ctx.path.startsWith('/v1/')) {
    if (ctx.path === '/' || ctx.path.endsWith('.html')) {
      return await serve(path.join(__dirname, 'public'))(ctx, () => {})
    }
    return
  }

  const providers = getProviders().filter((p) => p.enabled)
  if (providers.length === 0) {
    ctx.status = 503
    ctx.body = {
      error: {
        type: 'overloaded_error',
        message: '本地代理：没有可用的中转站',
      },
    }
    return
  }

  // 📊 记录请求开始时间
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
    success: false,
  }

  for (const provider of providers) {
    // 使用智能拼接函数
    const targetUrl = buildTargetUrl(provider.baseUrl, ctx.path)

    try {
      console.log(
        `[${new Date().toLocaleTimeString()}] 尝试: [${provider.name}] -> ${targetUrl}`,
      )

      const response = await axios({
        method: ctx.method,
        url: targetUrl,
        data: ctx.request.body,
        headers: {
          ...ctx.headers,
          host: new URL(targetUrl).host, // 修正 Host 头
          'x-api-key': provider.apiKey,
          'anthropic-version': ctx.headers['anthropic-version'] || '2023-06-01',
          'accept-encoding': 'identity', // 禁用压缩，防止乱码
        },
        responseType: 'stream',
        timeout: 30000, // 30秒超时，避免无限等待
        validateStatus: (status) => status < 500,
        proxy: false, // 🛡️ 关键！强制禁用代理，防止读取环境变量导致请求回环
      })

      // 🚨 关键逻辑：先检测错误码，决定是切换还是返回
      const isErrorStatus = [401, 402, 404, 429].includes(response.status)

      if (isErrorStatus) {
        const errorMsg =
          response.status === 401 ? 'API Key 无效' :
          response.status === 402 ? '余额不足' :
          response.status === 404 ? 'URL 路径错误' :
          '请求过于频繁'

        console.warn(`⚠️ [${provider.name}] 返回 ${response.status} (${errorMsg})`)

        // 如果还有其他可用中转站，切换到下一个
        if (providers.length > 1) {
          console.log(`   ↻ 正在切换到下一个中转站...`)
          continue
        } else {
          // 只有 1 个中转站且失败了，立即返回 JSON 错误（非流式）
          // 🔴 关键：读取完整错误响应体
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
                message: `代理错误: ${errorMsg}`,
              }
            }
          }

          ctx.status = response.status
          ctx.set('Content-Type', 'application/json')
          ctx.body = errorBody

          // 📊 记录失败日志
          logEntry.status = response.status
          logEntry.provider = provider.name
          logEntry.duration = Date.now() - startTime
          logEntry.success = false
          if (ctx.request.body && ctx.request.body.model) {
            logEntry.model = ctx.request.body.model
          }
          requestLogs.push(logEntry)
          if (requestLogs.length > MAX_LOGS) requestLogs.shift()

          console.error(`   ✗ 没有其他可用中转站，请求失败`)
          return
        }
      }

      // ✅ 只有成功响应才透传
      ctx.status = response.status

      // 透传所有 anthropic-* 开头的响应头（用于额度统计）
      Object.keys(response.headers).forEach((key) => {
        if (key.toLowerCase().startsWith('anthropic-')) {
          ctx.set(key, response.headers[key])
        }
      })

      // 确保流式响应头（SSE）
      if (ctx.path.includes('messages')) {
        ctx.set('Content-Type', 'text/event-stream')
        ctx.set('Cache-Control', 'no-cache')
        ctx.set('Connection', 'keep-alive')
      } else {
        // 非流式请求也要透传 Content-Type
        if (response.headers['content-type']) {
          ctx.set('Content-Type', response.headers['content-type'])
        }
      }

      ctx.body = response.data

      // 📊 记录成功日志
      logEntry.status = response.status
      logEntry.provider = provider.name
      logEntry.duration = Date.now() - startTime
      logEntry.success = true
      logEntry.account = ctx.headers['anthropic-client-id'] || 'N/A'

      // 尝试从响应头提取 token 信息
      if (response.headers['anthropic-ratelimit-tokens-input']) {
        logEntry.tokenInput = parseInt(response.headers['anthropic-ratelimit-tokens-input']) || 0
      }
      if (response.headers['anthropic-ratelimit-tokens-output']) {
        logEntry.tokenOutput = parseInt(response.headers['anthropic-ratelimit-tokens-output']) || 0
      }

      // 提取模型信息（从请求体）
      if (ctx.request.body && ctx.request.body.model) {
        logEntry.model = ctx.request.body.model
      }

      requestLogs.push(logEntry)
      if (requestLogs.length > MAX_LOGS) requestLogs.shift()

      console.log(`✅ [${provider.name}] 请求成功 (${response.status})`)
      return // 成功！
    } catch (err) {
      console.error(`❌ [${provider.name}] 连接失败: ${err.message}`)
      if (err.code === 'ECONNABORTED') {
        console.error(`   (原因: 请求超时，请检查该中转站是否被墙或 URL 错误)`)
      }
    }
  }

  ctx.status = 502
  ctx.body = { error: { type: 'api_error', message: '所有中转站均请求失败' } }

  // 📊 记录所有中转站都失败的日志
  logEntry.status = 502
  logEntry.provider = '所有中转站'
  logEntry.duration = Date.now() - startTime
  logEntry.success = false
  if (ctx.request.body && ctx.request.body.model) {
    logEntry.model = ctx.request.body.model
  }
  requestLogs.push(logEntry)
  if (requestLogs.length > MAX_LOGS) requestLogs.shift()
})

// 启动服务器
app.listen(3000, () => {
  console.log(`
    ✅ 修复版代理已启动 (端口 3000)
    --------------------------------
    请检查下方日志中的 Target URL 是否正常:
    例如应为: https://api.xxx.com/v1/messages
    而不是:   .../v1/v1/messages
    --------------------------------
    `)
})
