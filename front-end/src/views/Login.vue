<template>
  <div class="login-page">
    <div class="form-card">
      <h1 class="form-title">Welcome Back</h1>
      <p class="form-subtitle">Sign in to manage the Polyglot dictionary</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button type="submit" class="login-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="switch-link">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { setSession } from '../utils/auth';

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      isSubmitting: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleLogin() {
      this.errorMessage = '';
      this.isSubmitting = true;

      try {
        const response = await axios.post('https://dictionary-website-qntj.onrender.com/auth/login', {
          username: this.credentials.username,
          password: this.credentials.password
        });

        const { token, user } = response.data;

        setSession({
          token,
          role: user.role,
          username: user.username
        });

        this.$router.push('/words');
      } catch (error) {
        console.error('Login failed:', error);
        this.errorMessage =
          error.response?.data?.message || 'Invalid username or password.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background-color: var(--bg-mocha);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.form-title {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 2rem;
  color: var(--text-taupe);
  text-align: center;
  margin: 0 0 8px 0;
}

.form-subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0 0 32px 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
}

.form-input {
  background-color: var(--bg-espresso);
  color: var(--text-taupe);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

.form-input:focus {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(207, 167, 110, 0.18);
}

.error-text {
  color: #c96a5a;
  font-size: 0.82rem;
  margin: -8px 0 0 0;
  text-align: center;
}

.login-btn {
  margin-top: 8px;
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  border: none;
  border-radius: 999px;
  padding: 15px 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.login-btn:hover {
  background-color: #ddbb85;
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-link {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.switch-link a {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 600;
}

.switch-link a:hover {
  text-decoration: underline;
}
</style>