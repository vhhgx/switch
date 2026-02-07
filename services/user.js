import axios from "axios";

/**
 * 获取用户自身信息
 * @param {string} baseUrl - API 基础地址
 * @param {string} token - 系统访问令牌 (Bearer token)
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 用户信息
 */
const getUserSelf = async (baseUrl, token, userId) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${baseUrl}api/user/self`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "New-Api-User": userId,
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

/**
 * 用户签到
 * @param {string} baseUrl - API 基础地址
 * @param {string} token - 系统访问令牌 (Bearer token)
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 签到结果
 */
const userCheckIn = async (baseUrl, token, userId) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${baseUrl}api/user/checkin`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "New-Api-User": userId,
      },
      timeout: 10000,
    });

    console.log("后端签到", response);

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

export { getUserSelf, userCheckIn };
