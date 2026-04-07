import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONFIG_PATH = path.join(__dirname, '../providers.json')

const getProviders = () => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) fs.writeJsonSync(CONFIG_PATH, [])
    return fs.readJsonSync(CONFIG_PATH)
  } catch (e) {
    return []
  }
}

const saveProviders = (data) =>
  fs.writeJsonSync(CONFIG_PATH, data, { spaces: 2 })

const addProvider = (providerData) => {
  const providers = getProviders()
  providers.push({ id: Date.now(), ...providerData, enabled: true })
  saveProviders(providers)
  return providers
}

const toggleProvider = (id) => {
  const providers = getProviders()
  const item = providers.find((p) => p.id === id)
  if (item) item.enabled = !item.enabled
  saveProviders(providers)
  return item
}

const updateProvider = (id, updateData) => {
  const providers = getProviders()
  const item = providers.find((p) => p.id === id)
  if (item) {
    if (updateData.name) item.name = updateData.name
    if (updateData.baseUrl) item.baseUrl = updateData.baseUrl
    if (updateData.apiKey) item.apiKey = updateData.apiKey
    if (updateData.token !== undefined) item.token = updateData.token
    if (updateData.userId !== undefined) item.userId = updateData.userId
    if (updateData.quotaMethod !== undefined) item.quotaMethod = updateData.quotaMethod
    if (updateData.modelMapping !== undefined) item.modelMapping = updateData.modelMapping
  }
  saveProviders(providers)
  return item
}

const deleteProvider = (id) => {
  const providers = getProviders().filter((p) => p.id !== id)
  saveProviders(providers)
  return providers
}

const enableAllProviders = () => {
  const providers = getProviders()
  providers.forEach(p => p.enabled = true)
  saveProviders(providers)
  return providers
}

const disableAllProviders = () => {
  const providers = getProviders()
  providers.forEach(p => p.enabled = false)
  saveProviders(providers)
  return providers
}

const reorderProviders = (ids) => {
  const providers = getProviders()
  const providerMap = new Map(providers.map((p) => [String(p.id), p]))
  const reordered = ids
    .map((id) => providerMap.get(String(id)))
    .filter(Boolean)

  const remaining = providers.filter((p) => !ids.map(String).includes(String(p.id)))
  const nextProviders = [...reordered, ...remaining]

  saveProviders(nextProviders)
  return nextProviders
}

export {
  getProviders,
  saveProviders,
  addProvider,
  toggleProvider,
  updateProvider,
  deleteProvider,
  enableAllProviders,
  disableAllProviders,
  reorderProviders
}
