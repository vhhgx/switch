import request from './index'

// 获取统计数据
export const getStats = async () => {
  return await request.get('/stats')
}

// 签到
export const checkIn = async () => {
  return await request.post('/user/checkin')
}
