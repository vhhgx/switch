import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import { fileURLToPath } from 'url'
import figlet from 'figlet'
import tinygradient from 'tinygradient'
import chalk from 'chalk'

import config from './config/index.js'
import routes from './routes/index.js'
import { getProviders } from './services/provider.js'
import { getSettings } from './services/settings.js'
import { initLogs } from './services/log.js'
import { c, ts, statusBadge, ms } from './utils/logger.js'

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

// 管理 API 请求日志（/v1/ 代理请求由 controller/proxy.js 单独处理，此处跳过）
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  if (ctx.path.startsWith('/v1/')) return
  const duration = Date.now() - start
  const ok = ctx.status < 400
  const icon = ok ? `${c.gray}·${c.r}` : `${c.red}✗${c.r}`
  const method = `${c.dim}${ctx.method}${c.r}`
  const path   = `${c.gray}${ctx.path}${c.r}`
  console.log(`${ts()}  ${icon}  ${method} ${path}  ${statusBadge(ctx.status)}  ${ms(duration)}`)
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
    getProviders()
    await getSettings()
    await initLogs()
  } catch (error) {
    console.error(`${c.red}✗ 初始化失败: ${error.message}${c.r}`)
    process.exit(1)
  }
}

// 启动服务器
async function startServer() {
  await initializeConfigFiles()

  app.listen(config.port, () => {
    // ASCII art 大字标题（渐变色）
    const art = figlet.textSync('Proxy', { font: 'ANSI Shadow', horizontalLayout: 'fitted' })
    const artLines = art.split('\n')

    const gradient = tinygradient([
      { color: '#ffffff', pos: 0 },    // 顶部颜色
      { color: '#808080', pos: 0.5 },  // 中间颜色
      { color: '#202020', pos: 1 }     // 底部颜色
    ]);
    const colors = gradient.rgb(Math.max(artLines.length, 2))
    console.log()
    artLines.forEach((line, i) => {
      console.log(chalk.hex(colors[i].toHex())('  ' + line))
    })

    // 副标题与信息栏
    console.log()
    console.log(chalk.bold.white('  Claude Proxy Switcher') + chalk.gray('  —  多账号自动故障转移网关'))
    console.log(chalk.gray('  ' + '─'.repeat(46)))
    console.log(chalk.gray('  Port  ') + chalk.white(String(config.port)))
    console.log(chalk.gray('  URL   ') + chalk.cyan(`http://localhost:${config.port}`))
    console.log(chalk.gray('  ' + '─'.repeat(46)))
    console.log()
  })
}

// 执行启动
startServer()
