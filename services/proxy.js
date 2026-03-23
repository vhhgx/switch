import axios from 'axios'
import config from '../config/index.js'
import { getSettings } from './settings.js'
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

  // 应用模型映射：静默处理，不再输出多余日志
  let requestBody = ctx.request.body
  let actualModel = requestBody?.model || null

  if (requestBody?.model) {
    const originalModel = requestBody.model
    // 优先级 1: 中转站私有映射
    if (provider.modelMapping && provider.modelMapping[originalModel]) {
      actualModel = provider.modelMapping[originalModel]
    } else {
      // 优先级 2: 全局默认映射
      const settings = await getSettings()
      if (settings.defaultModelMapping && settings.defaultModelMapping[originalModel]) {
        actualModel = settings.defaultModelMapping[originalModel]
      }
    }

    if (actualModel !== originalModel) {
      requestBody = { ...requestBody, model: actualModel }
    }
  }

  const headers = { ...ctx.headers }
  delete headers['content-length']
  delete headers['host']

  const response = await axios({
    method: ctx.method,
    url: targetUrl,
    data: requestBody,
    headers: {
      ...headers,
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
