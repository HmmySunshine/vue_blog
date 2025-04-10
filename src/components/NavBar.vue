<template>
  <nav class="navbar" :class="{ 'navbar-hover': isNavbarHovered }" @mouseenter="isNavbarHovered = true" @mouseleave="isNavbarHovered = false">
    <div class="navbar-brand">天行健，君子以自强不息</div>
    <div class="navbar-menu">
      <router-link to="/" class="navbar-item">
        <i class="fas fa-home"></i> 首页
      </router-link>
      
      <!-- 修改这部分，使用点击事件控制下拉菜单 -->
      <div class="has-dropdown">
        <div @click="toggleDropdown" class="navbar-item clickable">
          <i class="fas fa-book"></i> 文章
          <i :class="['dropdown-arrow', {'dropdown-arrow-up': showDropdown}]" class="fas fa-chevron-down"></i>
        </div>
        <div v-show="showDropdown" class="navbar-dropdown">
          <div class="dropdown-content">
            <router-link to="/articles" class="navbar-item" @click="showDropdown = false">
              <i class="fas fa-paw"></i> 文章列表
            </router-link>
            <router-link to="/categories" class="navbar-item" @click="showDropdown = false">
              <i class="fas fa-folder"></i> 分类
            </router-link>
            <router-link to="/tags" class="navbar-item" @click="showDropdown = false">
              <i class="fas fa-tags"></i> 标签
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- 其他菜单项不变 -->
      <router-link to="/timeline" class="navbar-item">
        <i class="fas fa-clock"></i> 时光轴
      </router-link>
      <router-link to="/alist" class="navbar-item">
        <i class="fas fa-file"></i> 文件下载中心
      </router-link>
      <router-link to="/chat" class="navbar-item">
        <i class="fas fa-comments"></i> AI聊天室
      </router-link>
      <router-link to="/photos" class="navbar-item">
        <i class="fas fa-images"></i> 照片墙
      </router-link>
      <router-link to="/find" class="navbar-item">
        <i class="fas fa-search"></i>搜索
      </router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="navbar-item">
        <i class="fas fa-user"></i>登录
      </router-link>
      <router-link v-if="isAdmin" to="/admin" class="navbar-item">
        <i class="fas fa-cog"></i>后台管理
      </router-link>
      <a v-if="isLoggedIn" @click="logout" class="navbar-item">
        <i class="fas fa-sign-out-alt"></i>登出
      </a>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isNavbarHovered: false,
      showDropdown: false
    };
  },
  methods: {
    logout() {
      this.$emit('logout');
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    closeDropdown() {
      this.showDropdown = false;
    }
  },
  created() {
    // 点击页面其他区域时关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) {
        this.closeDropdown();
      }
    });
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdown);
  }
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  transition: all 0.3s ease;
  z-index: 1000;
  height: 48px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-hover {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-size: 1.2rem;
  font-weight: 500;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-item {
  padding: 6px 12px;
  border-radius: 100px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 400;
  text-decoration: none !important;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.navbar-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

.navbar-item i {
  margin-right: 0.25rem;
}

.has-dropdown {
  position: relative;
}

.has-dropdown::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 20px;
}

.navbar-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.95);
  min-width: 300px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px; /* 增加内边距使菜单项更易点击 */
  animation: fadeIn 0.2s ease;
}

/* 使用 @supports 条件规则为支持 backdrop-filter 的浏览器添加模糊效果 */
@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .navbar-dropdown {
    background-color: rgba(255, 255, 255, 0.8);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}

/* Firefox 特定修复 */
@-moz-document url-prefix() {
  .navbar-dropdown {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

.navbar-dropdown::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  height: 20px;
  background: transparent;
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

.navbar-dropdown .navbar-item {
  padding: 12px 16px; /* 增加内边距 */
  margin: 4px 0;
  border-radius: 8px; /* 添加圆角 */
}

.dropdown-content {
  min-width: 160px;
}

/* 确保路由链接没有下划线 */
a.router-link-active,
a.router-link-exact-active {
  text-decoration: none !important;
  color: #1d1d1f;
}

/* 当前活动项的样式 */
.router-link-active {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 添加这些新样式 */
.clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-arrow {
  margin-left: 5px;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.dropdown-arrow-up {
  transform: rotate(180deg);
}

/* 其他样式保持不变 */
</style>