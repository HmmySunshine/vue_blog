<template>
  <div class="login-register-container">
    <div class="login-register-form">
      <h2>登录</h2>
      <form @submit.prevent="submitForm">
        <div class="input-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="input-group">
          <label for="password">密码:</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePasswordVisibility"
            >
              <svg
                v-if="showPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        <button type="submit" class="submit-btn">登录</button>
      </form>
      <div class="toggle-mode">
        没有账号?
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>
  
  <script>
import axios from "axios";

export default {
  data() {
    return {
      isLogin: true,
      username: "",
      password: "",
      showPassword: false, // 确保默认状态为false
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async submitForm() {
      try {
        const url = `${this.$baseUrl}/api/login`;
        const response = await axios.post(url, {
          username: this.username,
          password: this.password,
        });
        if (response.data.code === 200) {
          const userData = response.data.data;
          alert("登录成功");
          localStorage.setItem("token", userData.token);
          localStorage.setItem("username", userData.username);
          localStorage.setItem("userRole", userData.role);
          localStorage.setItem("userId", userData.userId);
          // 将用户数据传递给父组件
          this.$emit("login", userData);
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.response?.data?.message || "发生错误");
      }
    },
  },
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

.input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
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
  