import axios from 'axios'
import config from '../config/index.js'

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

  console.log(
    `[${new Date().toLocaleTimeString()}] 尝试: [${provider.name}] -> ${targetUrl}`
  )

  const response = await axios({
    method: ctx.method,
    url: targetUrl,
    data: ctx.request.body,
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
      console.error(`❌ [${provider.name}] Stream 传输错误: ${err.message}`)
      if (err.code === 'ECONNRESET') {
        console.error(`   (原因: 连接被远程服务器重置，可能是网络不稳定或服务器过载)`)
      }
    })
  }

  return response
}

export { buildTargetUrl, forwardRequest }
