import axios from "axios";

/**
 * 获取照片列表
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise} 返回Promise对象
 */
export function getPhotoList(page, pageSize) {
  return axios.get(`/api/photos`, {
    params: {
      page,
      pageSize,
    },
  }).then(response => {
    if (response.data.code === 200) {
      return {
        photos: response.data.data.pageList,
        total: response.data.data.total
      };
    }
    return { photos: [], total: 0 };
  });
}