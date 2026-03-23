import * as userService from "../services/user.js";
import * as providerService from "../services/provider.js";
import { c, ts } from "../utils/logger.js";

/**
 * 获取用户自身信息
 * 从请求体中获取 apiUrl 和 apiKey
 */
const getSelf = async (ctx) => {
  const { baseUrl, token, userId } = ctx.request.body;

  if (!baseUrl || !token) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: "baseUrl 和 token 是必需的参数",
    };
    return;
  }

  const result = await userService.getUserSelf(baseUrl, token, userId);

  if (result.success) {
    ctx.body = result.data;
  } else {
    ctx.status = result.error.status || 500;
    ctx.body = {
      success: false,
      error: result.error,
    };
  }
};

/**
 * 用户签到
 * 从请求体中获取 baseUrl、token 和 userId
 */
const checkIn = async (ctx) => {
  const { baseUrl, token, userId } = ctx.request.body;

  if (!baseUrl || !token) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: "baseUrl 和 token 是必需的参数",
    };
    return;
  }

  const result = await userService.userCheckIn(baseUrl, token, userId);

  if (result.success) {
    ctx.body = result.data;
  } else {
    ctx.status = result.error.status || 500;
    ctx.body = {
      success: false,
      error: result.error,
    };
  }
};

/**
 * 一键签到所有中转站
 * 遍历所有配置了 token 的中转站并执行签到
 */
const checkAll = async (ctx) => {
  const providers = providerService.getProviders();
  const checkableProviders = providers.filter(p => p.baseUrl && (p.token || p.apiKey));

  console.log(`${ts()}  ${c.cyan}↺${c.r}  开始批量签到 (${checkableProviders.length} 个站点)`);

  const results = [];
  const tasks = checkableProviders.map(async (p) => {
    // 优先使用 token，如果没有则尝试用 apiKey (部分站点通用)
    const token = p.token || p.apiKey;
    const result = await userService.userCheckIn(p.baseUrl, token, p.userId);

    const status = result.success ? `${c.green}成功${c.r}` : `${c.red}失败${c.r}`;
    console.log(`      ${c.gray}·${c.r}  ${p.name.padEnd(12)}  ${status}  ${result.success ? (result.data?.message || '已签到') : (result.error?.message || '请求失败')}`);

    return {
      id: p.id,
      name: p.name,
      success: result.success,
      message: result.success ? (result.data?.message || '签到成功') : (result.error?.message || '签到失败'),
      data: result.data || null
    };
  });

  const finalResults = await Promise.all(tasks);

  const successCount = finalResults.filter(r => r.success).length;
  console.log(`${ts()}  ${c.green}✓${c.r}  批量签到完成 (${successCount}/${checkableProviders.length} 成功)`);

  ctx.body = {
    success: true,
    results: finalResults,
    summary: {
      total: checkableProviders.length,
      success: successCount,
      failed: checkableProviders.length - successCount
    }
  };
};

export { getSelf, checkIn, checkAll };
