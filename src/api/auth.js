import axios from "axios";

/**
 * 发送验证码
 * @param {string} email 用户邮箱
 * @returns {Promise} API响应
 */
export function sendVerificationCode(email) {
  return axios.post("/api/auth/verification-code", { email });
}

/**
 * 用户注册
 * @param {Object} userData 用户注册数据
 * @returns {Promise} API响应
 */
export function registerUser(userData) {
  return axios.post("/api/auth/register", userData);
}

/**
 * 验证用户名是否可用
 * @param {string} username 用户名
 * @returns {Promise} API响应
 */
export function checkUsernameAvailability(username) {
  return axios.post("/api/auth/username-validation", { username });
}

