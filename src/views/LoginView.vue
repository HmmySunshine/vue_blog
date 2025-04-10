<template>
    <div class="login-register-container">
      <div class="login-register-form">
        <h2>登录</h2>
        <LoginForm @login-success="handleLoginSuccess" />
        <div class="toggle-mode">
          没有账号?
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import LoginForm from '@/components/LoginForm.vue';
  
  export default {
  components: {
    LoginForm
  },
  methods: {
    handleLoginSuccess(userData) {
      // 将登录成功的用户数据传递给 App.vue
      this.$emit('login', userData);
      
      // 根据用户角色跳转到不同页面
      const targetPath = userData.role === 'admin' ? '/admin' : '/';
      
      // 只有当当前路径不是目标路径时才进行导航
      if (this.$route.path !== targetPath) {
        this.$router.push(targetPath).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        });
      } else {
        // 如果已经在目标路径，可以发送一个事件通知应用刷新数据
        this.$eventBus.$emit('user-logged-in', userData);
      }
    }
  }
};
</script>
  
  <style scoped>
  .login-register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url("../assets/background-image.png");
    background-size: cover;
    background-position: center;
  }
  
  .login-register-form {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }
  
  .toggle-mode {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
    color: #666;
  }
  
  .toggle-mode a {
    color: #007aff;
    text-decoration: none;
  }
  
  .toggle-mode a:hover {
    text-decoration: underline;
  }
  </style>