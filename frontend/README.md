# Claude Proxy Switcher - Vue 3 Frontend

这是 Claude Proxy Switcher 的 Vue 3 前端项目，已从单 HTML 文件迁移到现代化的 Vue 3 + Vite 架构。

## 技术栈

- **Vue 3.4** - 使用 Composition API (setup 语法糖)
- **Vite 5** - 极速开发服务器和构建工具
- **Pinia 2** - 官方状态管理库
- **Pinia Plugin Persistedstate** - 状态持久化插件
- **Axios** - HTTP 客户端
- **Day.js** - 日期处理
- **VueUse** - Vue 组合式工具集

## 项目结构

```
frontend/
├── public/                  # 静态资源
├── src/
│   ├── assets/             # 资源文件
│   │   └── styles/         # 全局样式
│   │       └── main.css    # 主样式文件（从原 HTML 迁移）
│   ├── components/         # 公共组件
│   │   └── provider/       # 中转站相关组件
│   │       ├── ProviderCard.vue    # 中转站卡片
│   │       └── ProviderModal.vue   # 添加/编辑中转站弹窗
│   ├── views/              # 页面视图
│   │   ├── Dashboard.vue   # 首页
│   │   ├── Logs.vue        # 日志页
│   │   └── Settings.vue    # 设置页
│   ├── stores/             # Pinia 状态管理
│   │   ├── provider.js     # 中转站状态
│   │   ├── logs.js         # 日志状态
│   │   ├── settings.js     # 设置状态
│   │   └── user.js         # 用户/统计状态
│   ├── api/                # API 服务层
│   │   ├── index.js        # Axios 实例配置
│   │   ├── provider.js     # 中转站 API
│   │   ├── logs.js         # 日志 API
│   │   ├── settings.js     # 设置 API
│   │   └── user.js         # 用户 API
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 开发环境运行

### 前提条件

1. 确保后端服务器正在运行（默认端口 5678）
2. Node.js 版本 >= 16

### 启动步骤

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 开发模式特点

- **即时启动**：无需打包，秒级启动
- **热模块替换 (HMR)**：修改代码后自动更新，无需刷新页面
- **按需编译**：只编译当前访问的页面
- **实时预览**：保存文件后立即看到效果

### 前后端联调

Vite 已配置代理，所有 `/api` 请求会自动转发到后端 `localhost:5678`：

```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5678',
      changeOrigin: true
    }
  }
}
```

## 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建后的文件在 `dist/` 目录，可以部署到任何静态文件服务器。

## 主要功能

### 1. Tab 切换

使用 `v-show` 实现 Tab 切换，保持组件状态：

```vue
<Dashboard v-show="activeTab === 'dashboard'" />
<Logs v-show="activeTab === 'logs'" />
<Settings v-show="activeTab === 'settings'" />
```

### 2. 状态管理

使用 Pinia 管理全局状态，并通过 `pinia-plugin-persistedstate` 实现持久化：

```javascript
// stores/provider.js
export const useProviderStore = defineStore('provider', () => {
  // ... store 逻辑
}, {
  persist: {
    key: 'provider-store',
    storage: localStorage,
    paths: ['providers']
  }
})
```

### 3. API 服务层

统一的 API 服务层，使用 Axios 拦截器处理请求和响应：

```javascript
// api/index.js
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})
```

## 设计保持

本项目严格遵循原 HTML 的设计和样式：

- ✅ 完全保留原有 CSS 样式
- ✅ 保持相同的布局和间距
- ✅ 保持相同的颜色和字体
- ✅ 保持相同的交互效果
- ✅ 保持相同的动画效果

## 注意事项

1. **Tab 切换**：使用 `v-show` 而不是 `v-if`，避免组件销毁导致状态丢失
2. **状态持久化**：重要数据会自动保存到 localStorage
3. **自动刷新**：日志页面支持自动刷新，可在设置中配置
4. **API 代理**：开发环境下所有 API 请求会自动代理到后端

## 常见问题

### 1. 端口冲突

如果 5173 端口被占用，可以修改 `vite.config.js` 中的端口：

```javascript
server: {
  port: 3000, // 修改为其他端口
  // ...
}
```

### 2. API 请求失败

确保后端服务器正在运行：

```bash
# 在项目根目录
node server.js
```

### 3. 热更新不生效

尝试重启开发服务器：

```bash
# Ctrl+C 停止服务器
npm run dev
```

## 迁移说明

本项目已完成从单 HTML 文件到 Vue 3 的完整迁移：

- ✅ 组件化拆分
- ✅ 状态管理（Pinia）
- ✅ API 服务层
- ✅ 样式迁移
- ✅ 功能保持
- ✅ 设计保持

所有功能和样式都与原 HTML 版本保持一致。
