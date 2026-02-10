import request from './index'

// 获取设置
export const getSettings = async () => {
  return await request.get('/settings')
}

// 更新设置
export const updateSettings = async (updates) => {
  return await request.put('/settings', updates)
}

// 添加配额
export const addQuota = async (quota) => {
  return await request.post('/settings/quotas', quota)
}

// 更新配额
export const updateQuota = async (id, updates) => {
  return await request.put(`/settings/quotas/${id}`, updates)
}

// 删除配额
export const deleteQuota = async (id) => {
  await request.delete(`/settings/quotas/${id}`)
}

// 添加环境变量
export const addEnvVar = async (envVar) => {
  return await request.post('/settings/env-vars', envVar)
}

// 更新环境变量
export const updateEnvVar = async (id, updates) => {
  return await request.put(`/settings/env-vars/${id}`, updates)
}

// 删除环境变量
export const deleteEnvVar = async (id) => {
  await request.delete(`/settings/env-vars/${id}`)
}
