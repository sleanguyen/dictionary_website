<template>
  <form class="word-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="keyword">English Term</label>
      <input
        id="keyword"
        v-model="formData.keyword"
        type="text"
        class="form-input"
        placeholder="e.g. Petrichor"
        required
      />
    </div>

    <div class="form-group">
      <label for="partOfSpeech">Part of Speech</label>
      <select
        id="partOfSpeech"
        v-model="formData.partOfSpeech"
        class="form-input form-select"
        required
      >
        <option value="" disabled>Select a category</option>
        <option value="noun">Noun</option>
        <option value="verb">Verb</option>
        <option value="adjective">Adjective</option>
        <option value="adverb">Adverb</option>
        <option value="idiom">Idiom</option>
      </select>
    </div>

    <div class="translations-section">
      <div class="section-header">
        <label>Translations</label>
        <button type="button" class="add-trans-btn" @click="addTranslation">
          + Add Translation
        </button>
      </div>

      <p v-if="formData.translations.length === 0" class="no-trans-text">
        No translations added yet.
      </p>

      <div
        class="translation-row"
        v-for="(trans, index) in formData.translations"
        :key="index"
      >
        <input
          v-model="trans.lang"
          type="text"
          class="form-input lang-input"
          placeholder="e.g. vi"
          required
        />
        <input
          v-model="trans.text"
          type="text"
          class="form-input text-input"
          placeholder="Translated word"
          required
        />
        <button type="button" class="remove-btn" @click="removeTranslation(index)">
          Remove
        </button>
      </div>
    </div>

    <div class="action-row">
      <router-link to="/words" class="cancel-btn">Cancel</router-link>
      <button type="submit" class="save-btn" :disabled="isSubmitting">
        {{ isSubmitting ? savingLabel : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'WordForm',
  props: {
    // Dữ liệu ban đầu để đổ vào form. AddWord.vue truyền object rỗng,
    // Edit.vue truyền dữ liệu lấy về từ API SAU KHI fetch xong.
    initialData: {
      type: Object,
      default: () => ({ keyword: '', partOfSpeech: '', translations: [] })
    },
    submitLabel: { type: String, default: 'Save' },
    savingLabel: { type: String, default: 'Saving...' },
    isSubmitting: { type: Boolean, default: false }
  },
  emits: ['submit'],
  data() {
    return {
      // Clone dữ liệu vào state nội bộ để form có thể chỉnh sửa tự do
      formData: this.cloneData(this.initialData)
    };
  },
  watch: {
    // ĐÂY LÀ FIX CHÍNH CỦA BUG "vào Edit thì form trống":
    // Edit.vue gọi API bất đồng bộ (axios.get) rồi mới có dữ liệu, nên tại
    // thời điểm component này được tạo ra, initialData vẫn đang rỗng.
    // Nếu không có watch này, formData sẽ bị "đóng băng" ở giá trị rỗng ban đầu
    // mãi mãi, kể cả khi component cha (Edit.vue) đã nhận được dữ liệu thật.
    initialData: {
      handler(newVal) {
        this.formData = this.cloneData(newVal);
      },
      deep: true
    }
  },
  methods: {
    cloneData(data) {
      return {
        keyword: data?.keyword || '',
        partOfSpeech: data?.partOfSpeech || '',
        translations: Array.isArray(data?.translations)
          ? data.translations.map(t => ({ lang: t.lang, text: t.text }))
          : []
      };
    },
    addTranslation() {
      this.formData.translations.push({ lang: '', text: '' });
    },
    removeTranslation(index) {
      this.formData.translations.splice(index, 1);
    },
    handleSubmit() {
      const keyword = this.formData.keyword.trim();
      const partOfSpeech = this.formData.partOfSpeech.trim();

      const validTranslations = this.formData.translations
        .map(t => ({ lang: t.lang.trim(), text: t.text.trim() }))
        .filter(t => t.lang !== '' && t.text !== '');

      if (!keyword || !partOfSpeech || validTranslations.length === 0) {
        alert('Please fill in the English term, part of speech, and at least one translation.');
        return;
      }

      this.$emit('submit', { keyword, partOfSpeech, translations: validTranslations });
    }
  }
};
</script>

<style scoped>
.word-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label,
.section-header label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

.form-input:focus {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(207, 167, 110, 0.18);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A7C72' stroke-width='2'><polyline points='6 9 12 15 18 9'></polyline></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
}

.form-select option {
  background-color: var(--bg-espresso);
  color: var(--text-taupe);
}

.translations-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-trans-btn {
  background: transparent;
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-trans-btn:hover {
  background: rgba(207, 167, 110, 0.1);
}

.translation-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.lang-input {
  width: 25%;
}

.text-input {
  flex: 1;
}

.remove-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.remove-btn:hover {
  border-color: #c96a5a;
  color: #c96a5a;
}

.no-trans-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.action-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.cancel-btn {
  flex: 1;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 15px 0;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.cancel-btn:hover {
  border-color: var(--text-taupe);
  color: var(--text-taupe);
}

.save-btn {
  flex: 2;
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

@media (max-width: 600px) {
  .action-row {
    flex-direction: column;
  }
}
</style>