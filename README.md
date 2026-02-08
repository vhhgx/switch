# Claude-Proxy-Switcher

🚀 **Claude Code CLI 多账号/多中转站自动故障转移网关**

一个基于 Koa2 的本地中间件工具，作为 Claude Code CLI 和 Anthropic API 之间的智能代理，实现多账号自动切换、故障转移和统一管理。

---

## ✨ 核心特性

### 1. **多中转站配置管理**

- 支持添加、删除、启用/禁用多个 API 中转站
- 配置持久化存储在 `providers.json`
- Web 界面可视化管理
- 支持配额模式管理（Quota Modes）

### 2. **智能故障转移（Failover）**

- 自动检测 API 错误（401/402/404/429/5xx）
- 失败时自动切换到下一个可用中转站
- 只有所有中转站都失败才返回错误
- 请求日志记录与查看

### 3. **流式传输支持**

- 完整支持 Server-Sent Events (SSE)
- 实时流式响应透传
- 正确处理 `text/event-stream`
- Anthropic 响应头透传（用于额度统计）

### 4. **环境配置管理**

- **系统环境变量管理**：支持跨平台（Windows/Mac/Linux）设置和删除环境变量
- **Claude 配置文件管理**：自动更新 `~/.claude/settings.json` 配置
- **多目标配置写入**：一键配置 Claude Code CLI 所需的所有环境变量

### 5. **用户账户功能**

- **余额查询**：查看 API 账户余额和使用情况
- **自动签到**：支持中转站的每日签到功能
- 多账户统一管理

### 6. **网络隔离保护**

- 强制禁用 Axios 代理（`proxy: false`）
- 避免环境变量导致的请求回环
- 防止系统代理干扰

### 7. **智能 URL 处理**

- 自动清洗重复的 `/v1/v1/` 路径
- 兼容带或不带 `/v1` 的 BaseURL
- 防止 URL 拼接错误

---

## 📦 安装

```bash
# 1. 克隆或下载项目
cd proxy-switcher

# 2. 安装依赖
npm install

# 3. 启动服务
npm start
```

---

## 🔧 配置

### 1. 启动管理界面

访问 http://localhost:5678，你会看到管理后台：

![管理界面](https://via.placeholder.com/600x300?text=Claude+Proxy+Switcher)

### 2. 添加中转站

在界面中填写：

- **名称**: 如 "反重力"、"站点A"
- **Base URL**: 如 `https://api.one-api.com` 或 `http://127.0.0.1:8045`
  - ✅ 可以带 `/v1`，也可以不带
  - ✅ 末尾有无斜杠都会自动处理
- **API Key**: 你的 API 密钥

点击"添加中转"即可。

### 3. 配置 Claude Code CLI

修改 Claude Code 的配置文件，将 API 地址指向本地代理：

**Linux/macOS**: `~/.config/claude/config.json`
**Windows**: `%APPDATA%\claude\config.json`

```json
{
  "apiUrl": "http://localhost:5678"
}
```

或使用环境变量：

```bash
export ANTHROPIC_BASE_URL=http://localhost:5678
```

### 4. 使用 Web 界面配置环境变量（推荐）

在管理界面的"设置"页面，你可以直接通过 Web 界面配置系统环境变量和 Claude 配置文件，无需手动编辑文件：

#### 配置系统环境变量

- **Windows**: 自动使用 `setx` 命令设置用户级环境变量
- **Mac/Linux**: 自动修改 `~/.zshrc` 或 `~/.bashrc` 文件

支持的操作：

- ✅ 添加/更新环境变量（如 `ANTHROPIC_BASE_URL`）
- ✅ 删除环境变量
- ✅ 自动检测操作系统并使用对应的配置方式

#### 配置 Claude 配置文件

自动更新 `~/.claude/settings.json` 文件：

- ✅ 一键设置 `ANTHROPIC_BASE_URL`
- ✅ 一键设置 `ANTHROPIC_AUTH_TOKEN`
- ✅ 自动创建配置目录（如果不存在）
- ✅ 保留现有配置，只更新指定字段

**优势**：

- 🎯 无需手动查找配置文件路径
- 🎯 跨平台兼容，自动适配不同操作系统
- 🎯 即时生效，无需重启应用
- 🎯 支持多目标配置（系统环境变量 + Claude 配置文件）

---

## 🎯 工作原理

```
Claude Code CLI
    ↓ 请求: POST /v1/messages
    ↓
[本地代理 localhost:3000]
    ├─ 尝试: 中转站A → ❌ 401 无效Key
    ├─ 尝试: 中转站B → ✅ 200 成功
    └─ 返回: 流式响应
```

### 故障转移逻辑

1. 读取所有 `enabled: true` 的中转站
2. 按顺序尝试每个中转站
3. 遇到以下错误时自动切换：
   - `401 Unauthorized` (API Key 无效)
   - `402 Payment Required` (余额不足)
   - `404 Not Found` (路径错误)
   - `429 Too Many Requests` (限流)
   - `5xx Server Error` (服务器错误)
   - 网络超时（30秒）
4. 成功响应后透传给客户端

---

## 📂 项目结构

```
claude-proxy-switcher/
├── app.js                  # 应用入口，Koa 应用初始化
├── server.js               # 服务器启动文件（已废弃，使用 app.js）
├── package.json            # 依赖配置
├── providers.json          # 中转站配置（自动生成）
├── settings.json           # 应用设置（自动生成）
├── config/
│   └── index.js            # 配置文件（端口等）
├── controller/             # 控制器层（MVC）
│   ├── log.js              # 日志控制器
│   ├── provider.js         # 中转站控制器
│   ├── proxy.js            # 代理控制器
│   ├── settings.js         # 设置控制器（环境变量、配额模式）
│   └── user.js             # 用户控制器（余额、签到）
├── services/               # 服务层（MVC）
│   ├── log.js              # 日志服务
│   ├── provider.js         # 中转站服务
│   ├── proxy.js            # 代理服务
│   ├── settings.js         # 设置服务
│   └── user.js             # 用户服务
├── routes/                 # 路由层（MVC）
│   ├── index.js            # 路由入口
│   ├── api.js              # API 路由
│   └── proxy.js            # 代理路由
├── public/                 # 静态资源
│   ├── index.html          # 管理界面
│   ├── css/                # 样式文件
│   ├── js/                 # JavaScript 文件
│   └── images/             # 图片资源
└── README.md               # 本文档
```

---

## 🛡️ 关键技术细节

### 1. 流式传输处理

```javascript
// SSE 响应头
ctx.set("Content-Type", "text/event-stream");
ctx.set("Cache-Control", "no-cache");
ctx.set("Connection", "keep-alive");

// 流式透传
ctx.body = response.data; // Axios stream
```

### 2. Anthropic 响应头透传

```javascript
// 透传 anthropic-* 开头的所有响应头（用于额度统计）
Object.keys(response.headers).forEach((key) => {
  if (key.toLowerCase().startsWith("anthropic-")) {
    ctx.set(key, response.headers[key]);
  }
});
```

---

## 🔍 故障排查

### 问题 1: 所有中转站都失败

**现象**: 控制台显示 "所有中转站均请求失败"

**排查步骤**:

1. 检查中转站的 Base URL 是否正确
2. 检查 API Key 是否有效
3. 查看控制台日志中的完整 Target URL
4. 确认中转站是否需要科学上网

### 问题 2: 流式响应中断

**可能原因**:

- 网络超时（默认 30 秒）
- 中转站不稳定
- 代理干扰

**解决**: 启用多个中转站，利用自动故障转移

---

## 🚀 高级配置

### 修改端口

编辑 [config/index.js](config/index.js)：

```javascript
export default {
  port: 5678, // 改为其他端口，如 8080
};
```

### 自定义超时时间

编辑代理服务文件，修改 axios 请求的 timeout 参数：

```javascript
timeout: 30000,  // 改为 60000（60秒）
```

### 配置文件说明

#### providers.json

存储所有中转站配置：

```json
[
  {
    "id": "uuid",
    "name": "中转站名称",
    "baseUrl": "https://api.example.com",
    "apiKey": "sk-xxxxx",
    "enabled": true
  }
]
```

#### settings.json

存储应用设置和配额模式：

```json
{
  "quotaModes": [
    {
      "id": "uuid",
      "name": "模式名称",
      "config": {}
    }
  ]
}
```

---

## 🛠️ 技术栈

- **后端框架**: Koa 3.x
- **路由**: @koa/router
- **HTTP 客户端**: Axios
- **文件系统**: fs-extra
- **中间件**: koa-bodyparser, koa-static
- **架构模式**: MVC（Model-View-Controller）

---

## 📝 更新日志

### v1.0.0 (2026-02-08)

- ✨ 添加 API 配置管理与多目标环境变量写入功能
- ✨ 添加获取余额 & 签到功能
- 🏗️ 按照 MVC 架构重新组织目录结构
- 🎨 页面样式调整
- 🎉 初始化仓库

---

## 📝 许可证

MIT License

---

## 🙏 致谢

- [Koa3](https://koajs.com/) - 优雅的 Node.js Web 框架
- [Axios](https://axios-http.com/) - 强大的 HTTP 客户端
- [Anthropic API](https://docs.anthropic.com/) - Claude AI 服务

---

## 📮 反馈与支持

如有问题或建议，请提交 Issue 或 Pull Request。

**享受智能的 Claude Code 体验！** 🎉
