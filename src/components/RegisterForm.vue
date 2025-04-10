<template>
  <form @submit.prevent="submitForm">
    <div class="input-group">
      <label for="username">用户名:</label>
      <input 
        type="text" 
        id="username" 
        v-model="username" 
        @input="validateUsername"
        :class="{ 'is-invalid': usernameError }" 
        required 
      />
      <span v-if="usernameError" class="error">{{ usernameError }}</span>
    </div>
    <div class="input-group">
      <label for="email">邮箱:</label>
      <input 
        type="email" 
        id="email" 
        v-model="email" 
        @input="validateEmail"
        :class="{ 'is-invalid': emailError }" 
        required 
      />
      <span v-if="emailError" class="error">{{ emailError }}</span>
    </div>
    <div class="input-group">
      <label for="password">密码:</label>
      <div class="password-input">
        <input
          :type="showPassword ? 'text' : 'password'"
          id="password"
          v-model="password"
          @input="validatePassword"
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
    <div class="input-group">
      <label for="verificationCode">验证码:</label>
      <div class="verification-input">
        <input
          type="text"
          id="verificationCode"
          v-model="verificationCode"
          required
        />
        <button
          type="button"
          class="send-code-btn"
          @click="sendVerificationCode"
          :disabled="countdown > 0"
        >
          {{ countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码" }}
        </button>
      </div>
    </div>
    <button type="submit" class="submit-btn" :disabled="isSubmitting">注册</button>
  </form>
</template>

<script>
import { sendVerificationCode, registerUser } from "@/api/auth";

export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      verificationCode: "",
      showPassword: false,
      countdown: 0,
      timer: null,
      isSubmitting: false,
      usernameError: "",
      emailError: "",
      passwordError: ""
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateUsername() {
      const regex = /^[a-zA-Z0-9_]{3,16}$/;
      this.usernameError = regex.test(this.username)
        ? ""
        : "用户名只能包含字母、数字和下划线，长度在3到16之间";
    },
    validateEmail() {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = regex.test(this.email) ? "" : "请输入有效的邮箱地址";
    },
    validatePassword() {
      const regex = /^[a-zA-Z0-9_.]{6,16}$/;
      this.passwordError = regex.test(this.password)
        ? ""
        : "密码只能包含字母、数字、下划线和点，长度在6到16之间";
    },
    async sendVerificationCode() {
      if (this.email === "") {
        this.emailError = "请先输入邮箱地址";
        return;
      }
      
      this.validateEmail();
      if (this.emailError) {
        return;
      }

      try {
        const response = await sendVerificationCode(this.email);
        if (response.data.code === 200) {
          this.$message({
            type: 'success',
            message: "验证码已发送到您的邮箱，请查收"
          });
          this.startCountdown();
        } else {
          this.$message({
            type: 'error',
            message: response.data.message || "发送验证码失败"
          });
        }
      } catch (error) {
        console.error("Error:", error);
        this.$message({
          type: 'error',
          message: error.response?.data?.message || "发送验证码失败，请重试"
        });
      }
    },
    startCountdown() {
      this.countdown = 60;
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
        }
      }, 1000);
    },
    async submitForm() {
      this.validateUsername();
      this.validateEmail();
      this.validatePassword();
      
      if (this.usernameError || this.emailError || this.passwordError) {
        return;
      }

      this.isSubmitting = true;
      try {
        const response = await registerUser({
          username: this.username,
          email: this.email,
          password: this.password,
          verificationCode: this.verificationCode
        });

        if (response.data.code === 200) {
          this.$message({
            type: 'success',
            message: "注册成功！"
          });
          this.$emit('register-success');
        } else {
          this.$message({
            type: 'error',
            message: response.data.message || "注册失败"
          });
        }
      } catch (error) {
        console.error("Error:", error);
        this.$message({
          type: 'error',
          message: error.response?.data?.message || "注册失败，请重试"
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
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

.password-input,
.verification-input {
  position: relative;
}

.toggle-password,
.send-code-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.send-code-btn {
  background-color: #007aff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.send-code-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
