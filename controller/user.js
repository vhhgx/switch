import * as userService from "../services/user.js";

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

export { getSelf, checkIn };
