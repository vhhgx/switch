export default {
  port: process.env.PORT || 5678,
  maxLogs: 100,
  requestTimeout: 120000, // 增加到 120 秒，适应 Claude API 流式响应
  streamTimeout: 180000 // Stream 传输超时：3 分钟
}
