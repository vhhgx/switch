import axios from 'axios'
import config from '../config/index.js'
import { c, ts, providerTag } from '../utils/logger.js'

function buildTargetUrl(baseUrl, requestPath) {
  let cleanBase = baseUrl.trim().replace(/\/+$/, '')
  if (cleanBase.endsWith('/v1')) {
    cleanBase = cleanBase.substring(0, cleanBase.length - 3)
  }

  let cleanPath = requestPath
  if (cleanPath.startsWith('/v1/v1/')) {
    cleanPath = cleanPath.replace('/v1/v1/', '/v1/')
  } else if (!cleanPath.startsWith('/v1/')) {
    cleanPath = '/v1' + cleanPath
  }

  return `${cleanBase}${cleanPath}`
}

async function forwardRequest(provider, ctx) {
  const targetUrl = buildTargetUrl(provider.baseUrl, ctx.path)

  console.log(`${ts()}  ${c.gray}→${c.r}  ${providerTag(provider.name)}  ${c.gray}${ctx.method} ${ctx.path}${c.r}`)

  // 应用模型映射：若该中转站配置了 modelMapping，替换请求体中的 model 字段
  let requestBody = ctx.request.body
  let actualModel = requestBody?.model || null
  if (
    requestBody?.model &&
    provider.modelMapping &&
    provider.modelMapping[requestBody.model]
  ) {
    const originalModel = requestBody.model
    actualModel = provider.modelMapping[requestBody.model]
    requestBody = { ...requestBody, model: actualModel }
    console.log(`      ${c.cyan}⇄${c.r}  ${c.dim}${originalModel}${c.r}  ${c.gray}→${c.r}  ${c.white}${actualModel}${c.r}`)
  }

  const response = await axios({
    method: ctx.method,
    url: targetUrl,
    data: requestBody,
    headers: {
      ...ctx.headers,
      host: new URL(targetUrl).host,
      'x-api-key': provider.apiKey,
      'anthropic-version': ctx.headers['anthropic-version'] || '2023-06-01',
      'accept-encoding': 'identity'
    },
    responseType: 'stream',
    timeout: config.requestTimeout,
    validateStatus: (status) => status < 500,
    proxy: false
  })

  // 为 stream 添加错误处理
  if (response.data && typeof response.data.on === 'function') {
    response.data.on('error', (err) => {
      const hint = err.code === 'ECONNRESET' ? '连接被远程服务器重置' : err.message
      console.error(`${ts()}  ${c.red}✗${c.r}  ${providerTag(provider.name, c.red)}  ${c.red}Stream 中断${c.r}  ${c.gray}${hint}${c.r}`)
    })
  }

  return { response, actualModel }
}

export { buildTargetUrl, forwardRequest }
