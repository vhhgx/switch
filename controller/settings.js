import * as settingsService from '../services/settings.js'

// 获取所有设置
export async function getAll(ctx) {
  const settings = await settingsService.getSettings()
  ctx.body = settings
}

// 更新设置
export async function update(ctx) {
  const updates = ctx.request.body
  const settings = await settingsService.updateSettings(updates)
  ctx.body = settings
}

// 添加配额模式
export async function addQuotaMode(ctx) {
  const quotaMode = ctx.request.body
  const newQuotaMode = await settingsService.addQuotaMode(quotaMode)
  ctx.body = newQuotaMode
}

// 更新配额模式
export async function updateQuotaMode(ctx) {
  const { id } = ctx.params
  const updates = ctx.request.body
  const updatedQuotaMode = await settingsService.updateQuotaMode(id, updates)
  ctx.body = updatedQuotaMode
}

// 删除配额模式
export async function deleteQuotaMode(ctx) {
  const { id } = ctx.params
  const quotaModes = await settingsService.deleteQuotaMode(id)
  ctx.body = { quotaModes }
}

// 重置设置
export async function reset(ctx) {
  const settings = await settingsService.resetSettings()
  ctx.body = settings
}

// 更新环境变量（系统级别）
export async function updateEnvVariable(ctx) {
  const { key, value } = ctx.request.body

  if (!key || value === undefined) {
    ctx.status = 400
    ctx.body = { error: '缺少 key 或 value 参数' }
    return
  }

  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execPromise = promisify(exec)
    const os = await import('os')
    const platform = os.platform()

    let command
    let needsReload = false

    if (platform === 'win32') {
      // Windows: 使用 setx 设置用户级环境变量
      // 注意：setx 不支持包含特殊字符的值，需要用引号包裹
      command = `setx ${key} "${value}"`

      // 同时更新当前进程的环境变量
      process.env[key] = value

      needsReload = false // Windows 下新窗口会自动生效
    } else {
      // Mac/Linux: 修改 shell 配置文件
      const fs = await import('fs/promises')
      const path = await import('path')
      const homedir = os.homedir()

      // 检测使用的 shell
      const shell = process.env.SHELL || '/bin/bash'
      let rcFile

      if (shell.includes('zsh')) {
        rcFile = path.join(homedir, '.zshrc')
      } else {
        rcFile = path.join(homedir, '.bashrc')
      }

      // 读取现有文件内容
      let content = ''
      try {
        content = await fs.readFile(rcFile, 'utf-8')
      } catch (err) {
        // 文件不存在，创建新文件
        content = ''
      }

      // 检查是否已存在该环境变量的设置
      const envRegex = new RegExp(`^export ${key}=.*$`, 'gm')
      const newLine = `export ${key}="${value}"`

      if (envRegex.test(content)) {
        // 替换现有设置
        content = content.replace(envRegex, newLine)
      } else {
        // 添加新设置
        content += `\n# Added by Claude Proxy Switcher\n${newLine}\n`
      }

      // 写回文件
      await fs.writeFile(rcFile, content, 'utf-8')

      // 更新当前进程的环境变量
      process.env[key] = value

      needsReload = true // Mac/Linux 需要重新加载 shell
    }

    // 如果是 Windows，执行 setx 命令
    if (platform === 'win32') {
      await execPromise(command)
    }

    ctx.body = {
      success: true,
      message: `环境变量 ${key} 已更新`,
      key,
      value,
      platform,
      needsReload,
      reloadMessage: needsReload
        ? '请重新打开终端或执行 source ~/.zshrc (或 ~/.bashrc) 使环境变量生效'
        : '环境变量已生效，新打开的应用将使用新值'
    }
  } catch (error) {
    console.error('设置环境变量失败:', error)
    ctx.status = 500
    ctx.body = {
      error: '设置环境变量失败',
      message: error.message,
      details: '在 Windows 上可能需要管理员权限。在 Mac/Linux 上请确保有写入 shell 配置文件的权限。'
    }
  }
}

// 删除环境变量（系统级别）
export async function deleteEnvVariable(ctx) {
  const { key } = ctx.request.body

  if (!key) {
    ctx.status = 400
    ctx.body = { error: '缺少 key 参数' }
    return
  }

  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execPromise = promisify(exec)
    const os = await import('os')
    const platform = os.platform()

    let command
    let needsReload = false

    if (platform === 'win32') {
      // Windows: 使用 REG DELETE 删除环境变量
      // 删除用户环境变量
      command = `REG DELETE "HKCU\\Environment" /V ${key} /F`

      // 删除当前进程的环境变量
      delete process.env[key]

      needsReload = false
    } else {
      // Mac/Linux: 从 shell 配置文件中删除
      const fs = await import('fs/promises')
      const path = await import('path')
      const homedir = os.homedir()

      const shell = process.env.SHELL || '/bin/bash'
      let rcFile

      if (shell.includes('zsh')) {
        rcFile = path.join(homedir, '.zshrc')
      } else {
        rcFile = path.join(homedir, '.bashrc')
      }

      // 读取现有文件内容
      let content = ''
      try {
        content = await fs.readFile(rcFile, 'utf-8')
      } catch (err) {
        // 文件不存在
        throw new Error('配置文件不存在')
      }

      // 删除该环境变量的设置（包括注释行）
      const envRegex = new RegExp(`# Added by Claude Proxy Switcher\\nexport ${key}=.*\\n`, 'g')
      const envRegex2 = new RegExp(`export ${key}=.*\\n`, 'g')

      content = content.replace(envRegex, '')
      content = content.replace(envRegex2, '')

      // 写回文件
      await fs.writeFile(rcFile, content, 'utf-8')

      // 删除当前进程的环境变量
      delete process.env[key]

      needsReload = true
    }

    // 如果是 Windows，执行 REG DELETE 命令
    if (platform === 'win32') {
      try {
        await execPromise(command)
      } catch (err) {
        // 如果环境变量不存在，忽略错误
        if (!err.message.includes('找不到指定的注册表项或值')) {
          throw err
        }
      }
    }

    ctx.body = {
      success: true,
      message: `环境变量 ${key} 已删除`,
      key,
      platform,
      needsReload,
      reloadMessage: needsReload
        ? '请重新打开终端或执行 source ~/.zshrc (或 ~/.bashrc) 使更改生效'
        : '环境变量已删除，新打开的应用将不再包含此变量'
    }
  } catch (error) {
    console.error('删除环境变量失败:', error)
    ctx.status = 500
    ctx.body = {
      error: '删除环境变量失败',
      message: error.message,
      details: '在 Windows 上可能需要管理员权限。在 Mac/Linux 上请确保有写入 shell 配置文件的权限。'
    }
  }
}

// 更新 Claude 配置文件 (~/.claude/settings.json)
export async function updateClaudeSettings(ctx) {
  const { baseUrl, apiKey } = ctx.request.body

  if (!baseUrl || !apiKey) {
    ctx.status = 400
    ctx.body = { error: '缺少 baseUrl 或 apiKey 参数' }
    return
  }

  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const os = await import('os')

    const homedir = os.homedir()
    const claudeDir = path.join(homedir, '.claude')
    const settingsFile = path.join(claudeDir, 'settings.json')

    // 确保 .claude 目录存在
    try {
      await fs.mkdir(claudeDir, { recursive: true })
    } catch (err) {
      // 目录已存在，忽略错误
    }

    // 读取现有配置文件
    let existingSettings = {}
    try {
      const content = await fs.readFile(settingsFile, 'utf-8')
      existingSettings = JSON.parse(content)
    } catch (err) {
      // 文件不存在或解析失败，使用空对象
      existingSettings = {}
    }

    // 确保 env 对象存在
    if (!existingSettings.env) {
      existingSettings.env = {}
    }

    // 更新 ANTHROPIC_BASE_URL 和 ANTHROPIC_AUTH_TOKEN
    existingSettings.env.ANTHROPIC_BASE_URL = baseUrl
    existingSettings.env.ANTHROPIC_AUTH_TOKEN = apiKey

    // 写回文件
    await fs.writeFile(settingsFile, JSON.stringify(existingSettings, null, 2), 'utf-8')

    ctx.body = {
      success: true,
      message: 'Claude 配置文件已更新',
      file: settingsFile,
      updated: {
        ANTHROPIC_BASE_URL: baseUrl,
        ANTHROPIC_AUTH_TOKEN: apiKey
      }
    }
  } catch (error) {
    console.error('更新 Claude 配置文件失败:', error)
    ctx.status = 500
    ctx.body = {
      error: '更新 Claude 配置文件失败',
      message: error.message
    }
  }
}
