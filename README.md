# Claude-Proxy-Switcher

🚀 **Claude Code CLI 多账号/多中转站自动故障转移网关**

一个基于 Koa2 的本地中间件工具，作为 Claude Code CLI 和 Anthropic API 之间的智能代理，实现多账号自动切换、故障转移和统一管理。


XIHM8IRv202tHvnVLQbLwM/NpkXxQA==   软陶的

---

## ✨ 核心特性

1. **多中转站配置管理**
   - 支持添加、删除、启用/禁用多个 API 中转站
   - 配置持久化存储在 `providers.json`
   - Web 界面可视化管理

2. **智能故障转移（Failover）**
   - 自动检测 API 错误（401/402/404/429/5xx）
   - 失败时自动切换到下一个可用中转站
   - 只有所有中转站都失败才返回错误

3. **流式传输支持**
   - 完整支持 Server-Sent Events (SSE)
   - 实时流式响应透传
   - 正确处理 `text/event-stream`

4. **网络隔离保护**
   - 强制禁用 Axios 代理（`proxy: false`）
   - 避免环境变量导致的请求回环
   - 防止系统代理干扰

5. **智能 URL 处理**
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

访问 http://localhost:3000，你会看到管理后台：

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
  "apiUrl": "http://localhost:3000/v1"
}
```

或使用环境变量：
```bash
export ANTHROPIC_BASE_URL=http://localhost:3000/v1
```

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
proxy-switcher/
├── server.js           # 核心服务器逻辑
├── package.json        # 依赖配置
├── providers.json      # 中转站配置（自动生成）
├── public/
│   └── index.html      # 管理界面
└── README.md           # 本文档
```

---

## 🛡️ 关键技术细节

### 1. 防止代理回环
```javascript
axios({
  proxy: false,  // 强制禁用代理，防止读取 HTTP_PROXY 环境变量
  // ...
})
```

### 2. 智能 URL 拼接
```javascript
function buildTargetUrl(baseUrl, requestPath) {
  // 清洗 BaseURL: "https://api.x.com/v1/" → "https://api.x.com"
  let cleanBase = baseUrl.trim().replace(/\/+$/, '')
  if (cleanBase.endsWith('/v1')) {
    cleanBase = cleanBase.substring(0, cleanBase.length - 3)
  }

  // 确保路径以 /v1 开头
  let cleanPath = requestPath.replace('/v1/v1/', '/v1/')
  if (!cleanPath.startsWith('/v1/')) {
    cleanPath = '/v1' + cleanPath
  }

  return `${cleanBase}${cleanPath}`
}
```

### 3. 流式传输处理
```javascript
// SSE 响应头
ctx.set('Content-Type', 'text/event-stream')
ctx.set('Cache-Control', 'no-cache')
ctx.set('Connection', 'keep-alive')

// 流式透传
ctx.body = response.data  // Axios stream
```

### 4. Anthropic 响应头透传
```javascript
// 透传 anthropic-* 开头的所有响应头（用于额度统计）
Object.keys(response.headers).forEach((key) => {
  if (key.toLowerCase().startsWith('anthropic-')) {
    ctx.set(key, response.headers[key])
  }
})
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

### 问题 2: 请求返回 `/v1/v1/messages` 错误
**原因**: URL 拼接重复

**解决**: 本工具已自动修复，确保使用最新版本

### 问题 3: 流式响应中断
**可能原因**:
- 网络超时（默认 30 秒）
- 中转站不稳定
- 代理干扰

**解决**: 启用多个中转站，利用自动故障转移

---

## 📊 API 接口文档

### 获取所有中转站
```http
GET /api/providers
```

### 添加中转站
```http
POST /api/providers
Content-Type: application/json

{
  "name": "站点A",
  "baseUrl": "https://api.example.com",
  "apiKey": "sk-xxxxx"
}
```

### 切换启用/禁用
```http
PATCH /api/providers/{id}/toggle
```

### 删除中转站
```http
DELETE /api/providers/{id}
```

### 代理请求
```http
POST /v1/messages
(所有请求自动转发到配置的中转站)
```

---

## 🚀 高级配置

### 修改端口
编辑 `server.js` 第 150 行：
```javascript
app.listen(3000, () => {  // 改为其他端口，如 8080
```

### 自定义超时时间
编辑 `server.js` 第 109 行：
```javascript
timeout: 30000,  // 改为 60000（60秒）
```

### 添加请求日志
在转发逻辑中添加：
```javascript
console.log('请求体:', ctx.request.body)
console.log('响应头:', response.headers)
```

---

## 📝 许可证

MIT License

---

## 🙏 致谢

- [Koa2](https://koajs.com/) - 优雅的 Node.js Web 框架
- [Axios](https://axios-http.com/) - 强大的 HTTP 客户端
- [Anthropic API](https://docs.anthropic.com/) - Claude AI 服务

---

## 📮 反馈与支持

如有问题或建议，请提交 Issue 或 Pull Request。

**享受智能的 Claude Code 体验！** 🎉
