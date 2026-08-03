<template>
  <div class="register-page">
    <div class="form-card">
      <h1 class="form-title">Join Polyglot</h1>
      <p class="form-subtitle">Create an account to explore the dictionary</p>

      <div v-if="successMessage" class="success-box">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <form v-else class="register-form" @submit.prevent="handleRegister">
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Choose a username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Create a password"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="Re-enter your password"
            required
          />
          <p v-if="passwordMismatch" class="field-hint">Passwords do not match.</p>
        </div>

        <button type="submit" class="register-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="switch-link">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      isSubmitting: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  computed: {
    passwordMismatch() {
      return (
        this.form.password.length > 0 &&
        this.form.confirmPassword.length > 0 &&
        this.form.password !== this.form.confirmPassword
      );
    }
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';

      const username = this.form.username.trim();
      const { password, confirmPassword } = this.form;

      if (!username || !password || !confirmPassword) {
        this.errorMessage = 'Please fill in all fields.';
        return;
      }

      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      this.isSubmitting = true;

      try {
        await axios.post('http://localhost:3000/auth/register', {
          username,
          password
        });

        this.successMessage = 'Account created successfully! Redirecting to sign in...';

        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (error) {
        console.error('Registration failed:', error);
        this.errorMessage =
          error.response?.data?.message || 'Something went wrong. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.register-page {
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

.register-form {
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

.field-hint {
  font-size: 0.75rem;
  color: #c96a5a;
  margin: 0;
}

.error-text {
  color: #c96a5a;
  font-size: 0.82rem;
  margin: -4px 0 0 0;
  text-align: center;
  background-color: rgba(201, 106, 90, 0.08);
  border: 1px solid rgba(201, 106, 90, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
}

.success-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(207, 167, 110, 0.1);
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 0.9rem;
}

.register-btn {
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

.register-btn:hover {
  background-color: #ddbb85;
}

.register-btn:active {
  transform: scale(0.98);
}

.register-btn:disabled {
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