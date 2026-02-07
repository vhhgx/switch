import * as userService from "../services/user.js";

/**
 * 获取用户自身信息
 * 从请求体中获取 apiUrl 和 apiKey
 */
const getSelf = async (ctx) => {
  // const { apiUrl, apiKey } = ctx.request.body
  const apiUrl = "https://api.gemai.cc";
  const apiKey = "XIHM8IRv202tHvnVLQbLwM/NpkXxQA==";

  if (!apiUrl || !apiKey) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: "apiUrl 和 apiKey 是必需的参数",
    };
    return;
  }

  const result = await userService.getUserSelf(apiUrl, apiKey);

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

export { getSelf };
