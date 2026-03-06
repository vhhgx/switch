import * as logService from '../services/log.js'

const getAll = async (ctx) => {
  ctx.body = logService.getLogs()
}

const clear = async (ctx) => {
  await logService.clearLogs()
  ctx.body = { success: true }
}

export { getAll, clear }
