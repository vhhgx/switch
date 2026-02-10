import request from './index'

// 获取日志
export const getLogs = async () => {
  const response = await request.get('/logs')
  return response.logs || []
}

// 清空日志
export const clearLogs = async () => {
  await request.delete('/logs')
}
