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

  return response
}

export { buildTargetUrl, forwardRequest }
