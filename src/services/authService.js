import router from '@/router';

export default {
  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * 获取用户角色
   * @returns {string} 用户角色
   */
  getUserRole() {
    return localStorage.getItem('userRole') || '';
  },

  /**
   * 判断用户是否是管理员
   * @returns {boolean} 是否是管理员
   */
  isAdmin() {
    return this.getUserRole() === 'admin';
  },

  /**
   * 保存用户登录数据
   * @param {Object} userData 用户数据
   */
  saveUserData(userData) {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userId", userData.userId);
  },

  /**
   * 用户登出
   */
  logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      
      router.push("/").catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }
};