import * as providerService from '../services/provider.js'

const getAll = async (ctx) => {
  ctx.body = providerService.getProviders()
}

const create = async (ctx) => {
  const newProvider = providerService.addProvider(ctx.request.body)
  // 返回新创建的provider（数组的最后一个元素）
  ctx.body = newProvider[newProvider.length - 1]
}

const toggle = async (ctx) => {
  const id = parseInt(ctx.params.id)
  providerService.toggleProvider(id)
  ctx.body = { success: true }
}

const update = async (ctx) => {
  const id = parseInt(ctx.params.id)
  const updatedProvider = providerService.updateProvider(id, ctx.request.body)
  ctx.body = updatedProvider
}

const remove = async (ctx) => {
  const id = parseInt(ctx.params.id)
  providerService.deleteProvider(id)
  ctx.body = { success: true }
}

export { getAll, create, toggle, update, remove }
