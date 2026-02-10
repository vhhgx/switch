import request from './index'

// 获取所有中转站
export const getProviders = async () => {
  const response = await request.get('/providers')
  return response.providers || []
}

// 创建中转站
export const createProvider = async (provider) => {
  return await request.post('/providers', provider)
}

// 更新中转站
export const updateProvider = async (id, updates) => {
  return await request.put(`/providers/${id}`, updates)
}

// 删除中转站
export const deleteProvider = async (id) => {
  await request.delete(`/providers/${id}`)
}

// 测试中转站连接
export const testProvider = async (id) => {
  return await request.post(`/providers/${id}/test`)
}

// 刷新余额
export const refreshBalance = async (id) => {
  return await request.post(`/providers/${id}/refresh-balance`)
}

// 刷新所有余额
export const refreshAllBalances = async () => {
  return await request.post('/providers/refresh-all-balances')
}
