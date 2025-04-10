<template>
    <form @submit.prevent="submitForm">
      <div class="input-group">
        <label for="username">用户名:</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          :class="{ 'is-invalid': usernameError }"
          required 
        />
        <span v-if="usernameError" class="error">{{ usernameError }}</span>
      </div>
      <div class="input-group">
        <label for="password">密码:</label>
        <div class="password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            :class="{ 'is-invalid': passwordError }"
            required
          />
          <span v-if="passwordError" class="error">{{ passwordError }}</span>
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
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
    </form>
  </template>
  
  <script>
  import { login } from "@/api/auth";
  
  export default {
    data() {
      return {
        username: "",
        password: "",
        showPassword: false,
        isSubmitting: false,
        usernameError: "",
        passwordError: ""
      };
    },
    methods: {
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
      },
      validateForm() {
        let isValid = true;
        
        // 用户名验证
        if (!this.username.trim()) {
          this.usernameError = "请输入用户名";
          isValid = false;
        } else {
          this.usernameError = "";
        }
  
        // 密码验证
        if (!this.password) {
          this.passwordError = "请输入密码";
          isValid = false;
        } else {
          this.passwordError = "";
        }
  
        return isValid;
      },
      async submitForm() {
        if (!this.validateForm()) {
          return;
        }
  
        this.isSubmitting = true;
        try {
          const response = await login({
            username: this.username,
            password: this.password
          });
          
          if (response.data.code === 200) {
            const userData = response.data.data;
            
            // 存储用户信息
            localStorage.setItem("token", userData.token);
            localStorage.setItem("username", userData.username);
            localStorage.setItem("userRole", userData.role);
            localStorage.setItem("userId", userData.userId);
            
            // 通知父组件登录成功
            this.$emit("login-success", userData);
            
            this.$message({
              type: 'success',
              message: "登录成功"
            });
          } else {
            this.$message({
              type: 'error',
              message: response.data.message || "登录失败"
            });
          }
        } catch (error) {
          console.error("登录错误:", error);
          this.$message({
            type: 'error',
            message: error.response?.data?.message || "登录失败，请重试"
          });
        } finally {
          this.isSubmitting = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
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
  
  .is-invalid {
    border-color: #dc3545;
  }
  
  .error {
    color: #dc3545;
    font-size: 0.8rem;
    display: block;
    margin-top: 0.25rem;
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
  
  .submit-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>