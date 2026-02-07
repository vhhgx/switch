import Router from '@koa/router'
import * as proxyController from '../controller/proxy.js'

const router = new Router()

// Proxy routes - handle all /v1/* requests
// 新版 path-to-regexp 语法：使用 {*path} 匹配所有路径
router.all('/v1/{*path}', proxyController.handleProxyRequest)

export default router
