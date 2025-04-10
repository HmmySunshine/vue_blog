import axios from "axios";
/**
 * 获取文章列表
 * @param {number} page 当前页码
 * @param {number} pageSize 每页显示数量
 * @returns {Promise} 包含文章列表和总数的Promise对象
 */
export function getArticleList(page, pageSize) {
    return axios.get(`/api/articles`, {
      params: {
        page,
        pageSize,
      },
    }).then(response => response.data.data);
  }
  
  /**
   * 获取网站统计数据
   * @returns {Promise} 包含统计数据的Promise对象
   */
  export function getStats() {
    return axios.get(`/api/stats`)
      .then(response => {
        const { totalVisits, todayVisits, popularArticles } = response.data;
        return {
          totalVisits,
          todayVisits,
          popularArticles,
          topReads: Math.max(...popularArticles.map(article => article.views))
        };
      });
  }