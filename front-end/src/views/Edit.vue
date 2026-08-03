<template>
  <div class="edit-word-page">
    <div class="form-card">
      <h1 class="form-title">Edit Expression</h1>
      <p class="form-subtitle">Update this entry in the Polyglot dictionary</p>

      <div v-if="isLoading" class="state-message">Loading word data...</div>
      <div v-else-if="loadError" class="state-message error">{{ loadError }}</div>

      <!-- Chỉ mount WordForm SAU KHI đã có dữ liệu (v-else), nên
           initialData truyền vào luôn là dữ liệu thật ngay từ đầu -->
      <WordForm
        v-else
        :initial-data="wordData"
        submit-label="Update Word"
        saving-label="Updating..."
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import WordForm from '../components/WordForm.vue';

export default {
  name: 'Edit',
  components: { WordForm },
  data() {
    return {
      wordData: {
        keyword: '',
        partOfSpeech: '',
        translations: []
      },
      isLoading: true,
      loadError: null,
      isSubmitting: false
    };
  },
  mounted() {
    this.fetchWord();
  },
  methods: {
    async fetchWord() {
      const id = this.$route.params.id;
      this.isLoading = true;
      this.loadError = null;

      try {
        const response = await axios.get(`http://localhost:3000/words/${id}`);
        const data = response.data;

        this.wordData = {
          keyword: data.keyword || '',
          partOfSpeech: data.partOfSpeech || '',
          translations: Array.isArray(data.translations)
            ? data.translations.map(t => ({ lang: t.lang, text: t.text }))
            : []
        };
      } catch (error) {
        console.error('Failed to fetch word:', error);
        this.loadError = 'Could not load this word. It may have been deleted.';
      } finally {
        this.isLoading = false;
      }
    },
    async handleSubmit(payload) {
      const id = this.$route.params.id;
      this.isSubmitting = true;

      try {
        await axios.put(`http://localhost:3000/words/${id}`, payload);
        alert('Word updated successfully!');
        this.$router.push('/words');
      } catch (error) {
        console.error('Failed to update word:', error);
        alert('Failed to update word.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.edit-word-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.form-card {
  width: 100%;
  max-width: 600px;
  background-color: var(--bg-mocha);
  border-radius: 20px;
  padding: 48px 44px;
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
  margin: 0 0 36px 0;
}

.state-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.state-message.error {
  color: #c96a5a;
}

@media (max-width: 600px) {
  .form-card {
    padding: 36px 28px;
  }
}
</style>