# 📋 项目画像：Claude-Proxy-Switcher

## 🎯 项目定位
Claude Code CLI 的本地智能代理网关，实现多账号/多中转站自动故障转移

---

## 🛠️ 技术栈

### 后端框架
- Koa 3.x (轻量级 Node.js Web 框架)
- @koa/router 15.3.0 (路由管理)
- ES6 Modules (type: "module")

### 核心依赖
- axios 1.6.5 (HTTP 客户端，处理流式请求)
- fs-extra 11.2.0 (文件系统增强)
- koa-bodyparser 4.4.1 (请求体解析)
- koa-static 5.0.0 (静态资源服务)

### 架构模式
- MVC 三层架构 (Controller → Service → Model)

---

## 📂 核心模块

### 1. 代理转发核心 (最关键)
- `routes/proxy.js` - 拦截所有 `/v1/*` 请求
- `controller/proxy.js:5` - `handleProxyRequest` 主流程入口
- `services/proxy.js:20` - `forwardRequest` 实际转发逻辑

### 2. 中转站管理
- `services/provider.js` - CRUD 操作 + providers.json 持久化
- `controller/provider.js` - 中转站增删改查接口

### 3. 日志系统
- `services/log.js` - 内存日志存储 (最多 100 条)
- 记录请求状态、耗时、Token 消耗

### 4. 用户功能
- `controller/user.js` - 余额查询、自动签到

### 5. 设置管理
- `services/settings.js` - 环境变量配置、配额模式管理
- 支持跨平台环境变量写入 (Windows/Mac/Linux)

### 6. Web 管理界面
- `public/index.html` - 单页面管理后台 (100KB)

---

## 🔄 主流程入口

### 启动流程 (`app.js:74`)
```
startServer()
  → initializeConfigFiles() (初始化 providers.json/settings.json)
  → app.listen(5678)
```

### 请求转发流程 (`controller/proxy.js:5`)
```
Claude CLI 请求 → /v1/messages
  ↓
handleProxyRequest (controller/proxy.js:5)
  ↓
遍历 enabled 中转站 (controller/proxy.js:36)
  ↓
forwardRequest (services/proxy.js:20)
  ↓
检测错误码 401/402/404/429/5xx → 自动切换
  ↓
成功 → 流式透传 + 日志记录
```

### 特殊拦截 (`server.js:164`)
- `count_tokens` 请求直接返回默认响应 (不转发到中转站)

---

## ⚠️ 关键依赖与配置

### 配置文件
- `providers.json` - 中转站列表 (自动创建)
- `settings.json` - 应用设置 (自动创建)
- `config/index.js` - 端口 5678、超时 180 秒

### 关键参数
- 请求超时: 180 秒 (config/index.js:4)
- 流式超时: 180 秒 (config/index.js:5)
- 最大日志: 100 条 (config/index.js:3)

### 网络隔离
- 强制 `proxy: false` (services/proxy.js:41) 防止回环

---

## 🚨 风险点

### 1. 代码重复 (高优先级)
- `server.js` 是废弃文件但仍存在 (README:234 标注已废弃)
- 与 `app.js` + MVC 架构功能重复
- **风险**: 误修改错误文件、维护混乱

### 2. 流式传输错误处理 (中优先级)
- `controller/proxy.js:109-133` 流错误监听
- 一旦开始传输就无法切换中转站 (controller/proxy.js:116)
- **风险**: 网络中断导致部分响应丢失

### 3. 内存日志存储 (低优先级)
- 日志存储在内存 (services/log.js)
- 重启后丢失，无持久化
- **风险**: 无法追溯历史问题

### 4. 配置文件无备份
- providers.json 直接覆盖写入
- **风险**: 误操作导致配置丢失

### 5. 超时时间过长
- 180 秒超时可能导致请求堆积
- **风险**: 高并发时资源耗尽

---

## 🎯 改动建议切入点

### 立即处理
1. **删除 server.js** - 避免维护混乱 (已标注废弃)
2. **添加配置备份机制** - providers.json 写入前备份

### 短期优化
3. **日志持久化** - 改为文件存储或数据库
4. **健康检查接口** - 添加 `/health` 端点监控中转站状态
5. **超时配置分级** - 区分普通请求 (30s) 和流式请求 (180s)

### 中期增强
6. **中转站优先级** - 支持手动排序或自动根据成功率排序
7. **请求重试策略** - 非流式请求支持同一中转站重试
8. **监控告警** - 中转站连续失败时通知

### 长期规划
9. **负载均衡** - 支持轮询、加权轮询
10. **缓存层** - 对非流式响应添加缓存
11. **多实例部署** - 支持集群模式

---

## 📊 代码质量评估

### 优点
- MVC 架构清晰，职责分离良好
- 流式传输处理完整 (SSE 支持)
- 错误处理详细 (controller/proxy.js:159-189)
- 自动配置初始化 (app.js:54)

### 待改进
- 缺少单元测试
- 缺少 TypeScript 类型定义
- 日志级别不可配置
- 缺少 API 文档 (Swagger)

---

## 📈 性能指标

### 当前配置
- 单请求超时: 180 秒
- 最大日志条数: 100 条
- 默认端口: 5678

### 建议监控指标
- 中转站平均响应时间
- 故障转移成功率
- Token 消耗统计
- 请求成功率

---

## 🔧 快速定位指南

### 修改端口
编辑 `config/index.js:2`

### 修改超时时间
编辑 `config/index.js:4-5`

### 添加新的 API 路由
1. 在 `routes/api.js` 添加路由
2. 在 `controller/` 添加控制器
3. 在 `services/` 添加业务逻辑

### 调试代理转发
查看 `controller/proxy.js:5` 的 `handleProxyRequest` 函数

---

**文档生成时间**: 2026-02-13
**项目版本**: v1.0.0
