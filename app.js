import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import { fileURLToPath } from 'url'

import config from './config/index.js'
import routes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Koa()

// 全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: {
        type: 'server_error',
        message: err.message
      }
    }
    app.emit('error', err, ctx)
  }
})

// 中间件配置（按顺序）
app.use(bodyParser())
app.use(serve(path.join(__dirname, 'public')))

// 自定义日志中间件
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 注册路由
routes(app)

// 错误监听
app.on('error', (err, ctx) => {
  console.error('server error', err)
})

// 启动服务器
app.listen(config.port, () => {
  console.log(`
    代理已启动
    --------------------------------
    端口: ${config.port}
    --------------------------------
  `)
})
