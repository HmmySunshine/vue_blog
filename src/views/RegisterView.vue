<template>
  <div class="login-register-container">
    <div class="login-register-form">
      <h2>注册</h2>
      <RegisterForm @register-success="onRegisterSuccess" />
      <div class="toggle-mode">
        已有账号? <router-link to="/login">登录</router-link>
      </div>
    </div>
  </div>
</template>
  
<script>
import RegisterForm from '@/components/RegisterForm.vue';

export default {
  name: 'RegisterView',
  components: {
    RegisterForm
  },
  methods: {
    onRegisterSuccess() {
      this.$router.push("/login");
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
  background-image: url("@/assets/background-image.png");
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
