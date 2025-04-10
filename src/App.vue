<template>
    <div id="app">
      <div v-if="!isAdminRoute" class="app-container">
        <div
          v-if="showVantaBackground"
          ref="vantaRef"
          class="vanta-background"
        ></div>
        <nav
          class="navbar"
          :class="{ 'navbar-hover': isNavbarHovered }"
          @mouseenter="isNavbarHovered = true"
          @mouseleave="isNavbarHovered = false"
        >
          <div class="navbar-brand">天行健，君子以自强不息</div>
          <div class="navbar-menu">
            <router-link to="/" class="navbar-item">
              <i class="fas fa-home"></i> 首页
            </router-link>
            <div class="has-dropdown">
              <router-link to="/articles" class="navbar-item">
                <i class="fas fa-book"></i> 文章
              </router-link>
              <div class="navbar-dropdown">
                <div class="dropdown-content">
                  <router-link to="/articles" class="navbar-item">
                    <i class="fas fa-paw"></i> 文章列表
                  </router-link>
                  <router-link to="/categories" class="navbar-item">
                    <i class="fas fa-folder"></i> 分类
                  </router-link>
                  <router-link to="/tags" class="navbar-item">
                    <i class="fas fa-tags"></i> 标签
                  </router-link>
                </div>
              </div>
            </div>
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
        <main class="main-content">
          <router-view @login="handleLogin"></router-view>
        </main>
        <SiteFooter v-if="showFooter" />
      </div>
      <div v-else class="admin-container">
        <router-view @login="handleLogin"></router-view>
      </div>
    </div>
  </template>
  
  <script>
  import SiteFooter from "./components/SiteFooter.vue";
  import * as THREE from "three";
  import BIRDS from "vanta/src/vanta.birds";
  
  export default {
    name: "App",
    components: {
        SiteFooter
    },
    data() {
      return {
        isLoggedIn: false,
        isAdmin: false,
        isNavbarHovered: false,
        vantaEffect: null,
        showVantaBackground: false,
        showFooter: true
      };
    },
    watch: {
      $route(to) {
        this.updateVantaBackground(to.path);
        this.showFooter = !to.path.startsWith('/admin');
      },
    },
    methods: {
      handleLogin(userData) {
        this.isLoggedIn = true;
        this.isAdmin = userData.role === "admin";
        localStorage.setItem("userRole", userData.role);
        if (this.isAdmin) {
          this.$router.push("/admin");
        } else {
          this.$router.push("/");
        }
      },
      logout() {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userRole");
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.$router.push("/").catch((err) => {
            if (err.name !== "NavigationDuplicated") {
              throw err;
            }
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
      updateVantaBackground(path) {
        if (this.isAdminRoute) {
          this.showVantaBackground = false;
          if (this.vantaEffect) {
            this.vantaEffect.destroy();
            this.vantaEffect = null;
          }
          return;
        }
  
        if (path === "/") {
          this.showVantaBackground = true;
          this.$nextTick(() => {
            if (!this.vantaEffect) {
              this.initVantaEffect();
            }
          });
        } else {
          this.showVantaBackground = false;
          if (this.vantaEffect) {
            this.vantaEffect.destroy();
            this.vantaEffect = null;
          }
        }
      },
      initVantaEffect() {
        this.vantaEffect = BIRDS({
          el: this.$refs.vantaRef,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 0.8,
          backgroundColor: 0xf5f5f7,
          color1: 0x0066cc,
          color2: 0x5856d6,
          colorMode: "variance",
          birdSize: 1.0,
          wingSpan: 12.0,
          speedLimit: 2.0,
          separation: 35.0,
          alignment: 25.0,
          cohesion: 25.0,
          quantity: 3.0
        });
      },
    },
    mounted() {
      this.updateVantaBackground(this.$route.path);
    },
    beforeDestroy() {
      if (this.vantaEffect) {
        this.vantaEffect.destroy();
        this.$eventBus.$off('logout')
      }
    },
    created() {
      // 监听登出事件
      this.$eventBus.$on('logout', () => {
        this.isLoggedIn = false
        this.isAdmin = false
      })

      // 初始化登录状态
      const token = localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')
      if (token) {
        this.isLoggedIn = true
        this.isAdmin = userRole === 'admin'
      }
    },
    computed: {
      isAdminRoute() {
        return this.$route.path.startsWith("/admin");
      },
    },
   
  };
  </script>
  
  <style>
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    overflow-x: hidden;
    background-color: #f5f5f7;
  }
  
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #1d1d1f;
    min-height: 100vh;
    position: relative;
    padding-bottom: 60px; /* 为备案信息预留空间 */
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .vanta-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1;
  }
  
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
    display: none;
    position: absolute;
    top: calc(100% + 15px);
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    min-width: 160px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px;
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
  
  .has-dropdown:hover .navbar-dropdown,
  .navbar-dropdown:hover {
    display: block;
    animation: fadeIn 0.2s ease;
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
    padding: 10px 16px;
    margin: 2px 0;
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
  
  .main-content {
    flex: 1;
    padding-top: 44px;
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 84px); /* 减去导航栏和底部的高度 */
    display: flex;
    flex-direction: column;
    padding-bottom: 40px; /* 为备案信息留出空间 */
  }

  /* 确保路由视图占满剩余空间 */
  .main-content > * {
    flex: 1;
  }
  
  /* 确保底部在内容较少时固定在底部 */
  .site-footer {
    margin-top: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    z-index: 1000;
  }
  
  .admin-container {
    min-height: 100vh;
  }
  </style>