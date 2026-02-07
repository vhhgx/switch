import apiRoutes from './api.js'
import proxyRoutes from './proxy.js'

export default (app) => {
  app.use(apiRoutes.routes()).use(apiRoutes.allowedMethods())
  app.use(proxyRoutes.routes()).use(proxyRoutes.allowedMethods())
}
