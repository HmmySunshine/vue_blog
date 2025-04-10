/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(size) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

/**
 * 格式化日期为YYYY-MM-DD
 * @param {string|number|Date} timestamp 时间戳或日期对象
 * @returns {string} 格式化的日期字符串
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * 格式化日期时间为YYYY-MM-DD HH:MM:SS
 * @param {string|number|Date} value 时间戳或日期对象
 * @returns {string} 格式化的日期时间字符串
 */
export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 添加这个新函数
/**
 * 格式化日期数组为YYYY-MM-DD HH:MM格式
 * @param {Array} dateArray 包含[year, month, day, hour, minute]的数组
 * @returns {string} 格式化的日期时间字符串
 */
export function formatDateArray(dateArray) {
  if (!dateArray || dateArray.length < 5) return "";
  
  const [year, month, day, hour, minute] = dateArray;
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}