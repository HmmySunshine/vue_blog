import axios from "axios";

/**
 * 获取文件列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回Promise对象
 */
export function getFileList(params) {
  return axios.get(`/api/files/getAllFiles`, { params })
    .then(response => {
      if (response.data.code === 200 && response.data.data) {
        return {
          files: response.data.data.pageList,
          total: response.data.data.total
        };
      }
      return { files: [], total: 0 };
    });
}

/**
 * 下载文件
 * @param {string} fileId 文件ID
 * @returns {Promise} 返回Promise对象
 */
export function downloadFile(fileId) {
  const token = localStorage.getItem("token");
  return axios.get(`/api/files/download/${fileId}`, {
    responseType: "blob",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

/**
 * 更新文件下载计数
 * @param {string} fileId 文件ID
 * @returns {Promise} 返回Promise对象
 */
export function updateDownloadsCount(fileId) {
  const token = localStorage.getItem("token");
  return axios.put(`/api/files/updateDownloadsCount/${fileId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}