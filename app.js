import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import { fileURLToPath } from 'url'

import config from './config/index.js'
import routes from './routes/index.js'
import { getProviders } from './services/provider.js'
import { getSettings } from './services/settings.js'

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

// 初始化配置文件
async function initializeConfigFiles() {
  try {
    console.log('正在初始化配置文件...')

    // 初始化 providers.json（如果不存在会自动创建）
    getProviders()
    console.log('✓ providers.json 已就绪')

    // 初始化 settings.json（如果不存在会自动创建）
    await getSettings()
    console.log('✓ settings.json 已就绪')

    console.log('配置文件初始化完成\n')
  } catch (error) {
    console.error('配置文件初始化失败:', error)
    process.exit(1)
  }
}

// 启动服务器
async function startServer() {
  // 先初始化配置文件
  await initializeConfigFiles()

  // 然后启动服务器
  app.listen(config.port, () => {
    console.log(`
    代理已启动
    --------------------------------
    端口: ${config.port}
    --------------------------------
  `)
  })
}

// 执行启动
startServer()
