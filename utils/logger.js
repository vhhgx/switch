import chalk from 'chalk'

// 原始 ANSI codes（供不想引入 chalk 的地方直接用）
const c = {
  r:       '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  gray:    '\x1b[90m',
  white:   '\x1b[97m',
}

function ts() {
  return c.gray + new Date().toLocaleTimeString('zh-CN', { hour12: false }) + c.r
}

function providerTag(name, color = c.cyan) {
  return `${color}${c.bold}${name}${c.r}`
}

function statusBadge(code) {
  const color = code < 300 ? c.green : code < 500 ? c.yellow : c.red
  return `${color}${c.bold}${code}${c.r}`
}

function ms(duration) {
  const color = duration < 1000 ? c.green : duration < 5000 ? c.yellow : c.red
  return `${color}${duration.toLocaleString()}ms${c.r}`
}

export { c, ts, providerTag, statusBadge, ms, chalk }
