<template>
  <div id="app">
    <DefaultLayout 
      v-if="!isAdminRoute" 
      :is-logged-in="isLoggedIn"
      :is-admin="isAdmin"
      @logout="logout"
    >
      <router-view @login="handleLogin"></router-view>
    </DefaultLayout>
    <AdminLayout v-else>
      <router-view @login="handleLogin"></router-view>
    </AdminLayout>
  </div>
</template>
  
<script>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import authService from '@/services/authService';

export default {
  name: "App",
  components: {
    DefaultLayout,
    AdminLayout
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false
    };
  },
  methods: {
    handleLogin(userData) {
      this.isLoggedIn = true;
      this.isAdmin = userData.role === "admin";
      authService.saveUserData(userData);
    },
    logout() {
      authService.logout();
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.$eventBus.$emit('logout');
    }
  },
  created() {
    // 监听登出事件
    this.$eventBus.$on('logout', () => {
      this.isLoggedIn = false;
      this.isAdmin = false;
    });

    // 初始化登录状态
    if (authService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.isAdmin = authService.isAdmin();
    }
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith("/admin");
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('logout');
  }
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
  padding-bottom: 60px;
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
</style>