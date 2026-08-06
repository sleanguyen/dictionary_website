<template>
  <div class="account-page">
    <div class="form-card">
      <h1 class="form-title">Account Settings</h1>
      <p class="form-subtitle">Signed in as <strong>{{ currentUsername }}</strong></p>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

      <form class="account-form" @submit.prevent="handleUpdate">
        <div class="form-group">
          <label for="newUsername">New Username</label>
          <input
            id="newUsername"
            v-model="form.newUsername"
            type="text"
            class="form-input"
            :placeholder="currentUsername"
          />
          <p class="field-note">Leave blank to keep your current username.</p>
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            class="form-input"
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            v-model="form.currentPassword"
            type="password"
            class="form-input"
            placeholder="Required to confirm changes"
            required
          />
        </div>

        <button type="submit" class="save-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getUsername, updateStoredUsername } from '../utils/auth';

export default {
  name: 'Account',
  data() {
    return {
      form: {
        newUsername: '',
        newPassword: '',
        currentPassword: ''
      },
      isSubmitting: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  computed: {
    currentUsername() {
      return getUsername();
    }
  },
  methods: {
    async handleUpdate() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.form.currentPassword) {
        this.errorMessage = 'Please enter your current password to confirm changes.';
        return;
      }

      if (!this.form.newUsername.trim() && !this.form.newPassword.trim()) {
        this.errorMessage = 'Enter a new username or a new password to update.';
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await axios.put('https://dictionary-website-qntj.onrender.com/auth/profile', {
          newUsername: this.form.newUsername.trim() || undefined,
          newPassword: this.form.newPassword.trim() || undefined,
          currentPassword: this.form.currentPassword
        });

        if (this.form.newUsername.trim()) {
          updateStoredUsername(response.data.user.username);
        }

        this.successMessage = 'Your account has been updated.';
        this.form.newUsername = '';
        this.form.newPassword = '';
        this.form.currentPassword = '';
      } catch (error) {
        console.error('Failed to update profile:', error);
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
.account-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.form-card {
  width: 100%;
  max-width: 460px;
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
  margin: 0 0 28px 0;
}

.form-subtitle strong {
  color: var(--accent-gold);
}

.error-text {
  color: #c96a5a;
  font-size: 0.82rem;
  margin: 0 0 16px 0;
  text-align: center;
  background-color: rgba(201, 106, 90, 0.08);
  border: 1px solid rgba(201, 106, 90, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
}

.success-text {
  color: var(--accent-gold);
  font-size: 0.82rem;
  margin: 0 0 16px 0;
  text-align: center;
  background-color: rgba(207, 167, 110, 0.1);
  border: 1px solid var(--accent-gold);
  border-radius: 8px;
  padding: 10px 14px;
}

.account-form {
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

.field-note {
  font-size: 0.72rem;
  color: var(--text-muted);
  opacity: 0.8;
  margin: 0;
}

.save-btn {
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

.save-btn:hover {
  background-color: #ddbb85;
}

.save-btn:active {
  transform: scale(0.98);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>