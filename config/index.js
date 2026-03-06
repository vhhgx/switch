export default {
  port: process.env.PORT || 5678,
  maxLogs: 1000,        // 内存缓存条数上限
  maxLogFile: 10000,    // 文件行数上限，超出后自动裁剪到 maxLogs 条
  requestTimeout: 180000,
  streamTimeout: 180000
}
