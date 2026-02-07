import axios from "axios";

/**
 * 获取用户自身信息
 * @param {string} apiUrl - API 基础地址
 * @param {string} apiKey - API Key (Bearer token)
 * @returns {Promise<Object>} 用户信息
 */
const getUserSelf = async (apiUrl, apiKey) => {
  //   /
  // api
  // /
  // data
  // /
  // self
  try {
    const response = await axios({
      method: "GET",
      url: `${apiUrl}/api/data/self`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "New-Api-User": "138145",
      },
      timeout: 10000,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};

export { getUserSelf };
