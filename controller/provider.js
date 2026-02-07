import * as providerService from '../services/provider.js'

const getAll = async (ctx) => {
  ctx.body = providerService.getProviders()
}

const create = async (ctx) => {
  providerService.addProvider(ctx.request.body)
  ctx.body = { success: true }
}

const toggle = async (ctx) => {
  const id = parseInt(ctx.params.id)
  providerService.toggleProvider(id)
  ctx.body = { success: true }
}

const update = async (ctx) => {
  const id = parseInt(ctx.params.id)
  providerService.updateProvider(id, ctx.request.body)
  ctx.body = { success: true }
}

const remove = async (ctx) => {
  const id = parseInt(ctx.params.id)
  providerService.deleteProvider(id)
  ctx.body = { success: true }
}

export { getAll, create, toggle, update, remove }
