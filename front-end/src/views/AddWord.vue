<template>
  <div class="add-word-page">
    <div class="form-card">
      <h1 class="form-title">Add a New Expression</h1>
      <p class="form-subtitle">Contribute a new word to the Polyglot dictionary</p>

      <WordForm
        :key="formKey"
        :initial-data="newWord"
        submit-label="Create Word"
        saving-label="Saving..."
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import WordForm from '../components/WordForm.vue';

const emptyWord = () => ({
  keyword: '',
  partOfSpeech: '',
  translations: [
    { lang: 'vi', text: '' },
    { lang: 'fr', text: '' }
  ]
});

export default {
  name: 'AddWord',
  components: { WordForm },
  data() {
    return {
      newWord: emptyWord(),
      isSubmitting: false,
      // Tăng formKey để buộc Vue tạo lại WordForm từ đầu sau khi submit
      // thành công, đảm bảo form được reset sạch sẽ.
      formKey: 0
    };
  },
  methods: {
    async handleSubmit(payload) {
      this.isSubmitting = true;

      try {
        await axios.post('https://dictionary-website-qntj.onrender.com/api/words', payload);
        alert('Word added successfully!');
        this.newWord = emptyWord();
        this.formKey++;
      } catch (error) {
        console.error('Failed to add word:', error);
        alert('Failed to add word.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.add-word-page {
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

@media (max-width: 600px) {
  .form-card {
    padding: 36px 28px;
  }
}
</style>