import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR  = path.join(__dirname, '../logs')
const LOG_FILE = path.join(LOG_DIR, 'requests.jsonl')

// 内存缓存（最新的在末尾）
let cache = []

// ─── 初始化：读取文件，恢复内存缓存 ──────────────────────────────────────────
async function initLogs() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true })

    if (!fsSync.existsSync(LOG_FILE)) {
      await fs.writeFile(LOG_FILE, '', 'utf-8')
      return
    }

    const content = await fs.readFile(LOG_FILE, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())

    // 只取最后 maxLogs 条装入内存
    const tail = lines.slice(-config.maxLogs)
    cache = tail.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)

    console.log(`  日志已恢复：${cache.length} 条  (文件共 ${lines.length} 行)`)
  } catch (err) {
    console.error('日志初始化失败:', err.message)
  }
}

// ─── 追加写文件（异步，不阻塞请求） ─────────────────────────────────────────
async function appendToFile(entry) {
  try {
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8')
    await maybeRotate()
  } catch (err) {
    console.error('日志写入失败:', err.message)
  }
}

// ─── 文件自动裁剪：超过 maxLogFile 行时，保留最后 maxLogs 条 ─────────────────
async function maybeRotate() {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())
    if (lines.length > config.maxLogFile) {
      const trimmed = lines.slice(-config.maxLogs).join('\n') + '\n'
      await fs.writeFile(LOG_FILE, trimmed, 'utf-8')
    }
  } catch { /* 裁剪失败不影响主流程 */ }
}

// ─── 公共 API ────────────────────────────────────────────────────────────────
function addLog(entry) {
  cache.push(entry)
  if (cache.length > config.maxLogs) cache.shift()
  appendToFile(entry) // fire-and-forget
}

function getLogs() {
  return cache.slice().reverse()
}

async function clearLogs() {
  cache = []
  try {
    await fs.writeFile(LOG_FILE, '', 'utf-8')
  } catch (err) {
    console.error('日志清空失败:', err.message)
  }
}

export { initLogs, addLog, getLogs, clearLogs }
