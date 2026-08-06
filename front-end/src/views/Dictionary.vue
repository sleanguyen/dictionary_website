<template>
  <div class="dictionary-page">
    <section class="hero">
      <h1 class="hero-title">Define your expression.</h1>

      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search across all languages..."
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">Search</button>
      </div>

      <p class="hero-meta">
        {{ totalItems ? totalItems.toLocaleString() + ' ENTRIES' : '0 ENTRIES' }}
        <span class="dot">•</span>
        LATEST SYNC: 2M AGO
      </p>
    </section>

    <section class="table-card">
      <div class="filter-bar">
        <label for="pos-filter" class="filter-label">Filter by Part of Speech</label>
        <select
          id="pos-filter"
          v-model="selectedPos"
          class="pos-select"
          @change="handleFilterChange"
        >
          <option value="">All</option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="interjection">Interjection</option>
        </select>

        <label class="filter-label">Sort</label>
        <div class="sort-toggle">
          <button
            type="button"
            class="sort-btn"
            :class="{ 'sort-btn-active': sortOrder === 'asc' }"
            @click="setSortOrder('asc')"
          >
            A–Z
          </button>
          <button
            type="button"
            class="sort-btn"
            :class="{ 'sort-btn-active': sortOrder === 'desc' }"
            @click="setSortOrder('desc')"
          >
            Z–A
          </button>
        </div>
      </div>

      <table class="word-table">
        <thead>
          <tr>
            <th>English Term</th>
            <th>Translations</th>
            <th>Part of Speech</th>
            <th v-if="userIsAdmin" class="th-actions"></th>
            <th class="th-chevron"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(word, index) in filteredWords" :key="word._id || index" class="table-row">
            <td class="col-english">
              <div class="keyword-row">
                <div class="keyword">{{ word.keyword }}</div>
                <button
                  class="speaker-btn"
                  type="button"
                  title="Pronounce"
                  :disabled="!ttsSupported"
                  @click="playAudio(word.keyword, 'en')"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 010 7.07"></path>
                    <path d="M18.36 5.64a9 9 0 010 12.73"></path>
                  </svg>
                </button>
                <HeartButton :word-id="word._id" :initial-favorite="word.isFavorite" />
              </div>
              <div class="phonetic">/{{ word.keyword }}/</div>
            </td>
            <td class="col-translations">
              <div class="translations-list">
                <span
                  v-for="(t, tIndex) in word.translations"
                  :key="tIndex"
                  class="translation-chip"
                >
                  <span class="lang-badge">{{ t.lang }}</span>
                  <span class="translation-text">{{ t.text }}</span>
                  <button
                    class="speaker-btn speaker-btn-chip"
                    type="button"
                    title="Pronounce"
                    :disabled="!ttsSupported"
                    @click="playAudio(t.text, t.lang)"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 010 7.07"></path>
                      <path d="M18.36 5.64a9 9 0 010 12.73"></path>
                    </svg>
                  </button>
                </span>
                <span v-if="!word.translations || word.translations.length === 0" class="no-translations">
                  No translations yet
                </span>
              </div>
            </td>
            <td class="col-pos">
              <span class="pos-badge">{{ word.partOfSpeech }}</span>
            </td>
            <td v-if="userIsAdmin" class="col-actions">
              <router-link :to="`/words/${word._id}/edit`" class="edit-btn" title="Edit word">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </router-link>
              <button
                class="delete-btn"
                title="Delete word"
                :disabled="deletingId === word._id"
                @click="handleDelete(word)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
                </svg>
              </button>
            </td>
            <td class="col-chevron">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <span class="footer-info">
          Page {{ currentPage }} of {{ totalPages }} (Total: {{ totalItems.toLocaleString() }} words)
        </span>
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            Previous
          </button>
          <button class="page-btn page-btn-active" :disabled="currentPage === totalPages" @click="nextPage">
            Next
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { isAdmin } from '../utils/auth';
import HeartButton from './HeartButton.vue'
export default {
  components: { HeartButton },
  name: 'Dictionary',
  data() {
    return {
      searchQuery: '',
      selectedPos: '',
      sortOrder: '',
      allWords: [],
      deletingId: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10,
      ttsSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
      langLocaleMap: {
        en: 'en-US',
        vi: 'vi-VN',
        fr: 'fr-FR',
        es: 'es-ES',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-PT',
        ru: 'ru-RU',
        ja: 'ja-JP',
        ko: 'ko-KR',
        zh: 'zh-CN'
      }
    };
  },
  computed: {
    userIsAdmin() {
      return isAdmin();
    },
    filteredWords() {
      // NOTE: this only filters within the words already loaded for the
      // current page — it is NOT a server-side search across all 221+
      // entries. See the flag at the end of this response for why, and
      // what to do if you want full-database search instead.
      if (!this.searchQuery.trim()) {
        return this.allWords;
      }

      const query = this.searchQuery.trim().toLowerCase();

      return this.allWords.filter(word => {
        const keywordMatch = word.keyword && word.keyword.toLowerCase().includes(query);
        const translationMatch =
          word.translations &&
          word.translations.some(t => t.text && t.text.toLowerCase().includes(query));
        return keywordMatch || translationMatch;
      });
    }
  },
  mounted() {
    this.fetchWords();
  },
  beforeUnmount() {
    // Avoid leaving an utterance talking to itself after the user
    // navigates away from this view.
    if (this.ttsSupported) {
      window.speechSynthesis.cancel();
    }
  },
  methods: {
    /**
     * Speaks `text` aloud using the browser's native Web Speech API,
     * pronounced in the locale that corresponds to `langCode`.
     * No external audio files or backend calls are involved.
     */
    playAudio(text, langCode) {
      if (!this.ttsSupported || !text) return;

      // Cancel anything currently queued/speaking so overlapping clicks
      // don't stack utterances on top of each other.
      window.speechSynthesis.cancel();

      const locale = this.langLocaleMap[(langCode || '').toLowerCase()] || 'en-US';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    },
    async fetchWords() {
      try {
        let url = `https://dictionary-website-qntj.onrender.com/words?page=${this.currentPage}&limit=${this.limit}`;
        if (this.selectedPos) {
          url += `&pos=${encodeURIComponent(this.selectedPos)}`;
        }
        if (this.sortOrder) {
          url += `&sort=${this.sortOrder}`;
        }

        // Sending the token here is optional on the backend (optionalAuth) —
        // guests still get the word list back either way. But when a token
        // IS present, the backend uses it to mark isFavorite per word so
        // the heart icons render correctly filled on page load.
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(url, { headers });

        this.allWords = response.data.data;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
        this.currentPage = response.data.currentPage;
      } catch (error) {
        console.error('Failed to fetch words from the backend:', error);
        this.allWords = [];
      }
    },

    handleFilterChange() {
      this.currentPage = 1;
      this.fetchWords();
    },

    setSortOrder(order) {
      // Clicking the already-active sort button turns sorting off again.
      this.sortOrder = this.sortOrder === order ? '' : order;
      this.currentPage = 1;
      this.fetchWords();
    },

    handleSearch() {
      // Search resets to page 1 conceptually, but since search is
      // client-side over the current page only, we just re-filter —
      // no need to refetch here.
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchWords();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchWords();
      }
    },
    async handleDelete(word) {
      const confirmed = window.confirm(
        `Delete "${word.keyword}"? This action cannot be undone.`
      );
      if (!confirmed) return;

      this.deletingId = word._id;

      try {
        await axios.delete(`https://dictionary-website-qntj.onrender.com/words/${word._id}`);
        // Refetch the current page instead of filtering locally — deleting
        // an item shifts what "page 2" even means server-side, so a local
        // splice would leave totalItems/totalPages out of sync.
        await this.fetchWords();
      } catch (error) {
        console.error('Failed to delete word:', error);
        alert('Failed to delete word. Please try again.');
      } finally {
        this.deletingId = null;
      }
    }
  }
};
</script>

<style scoped>
.dictionary-page {
  padding-bottom: 60px;
}

.hero {
  text-align: center;
  padding: 80px 24px 40px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 2.6rem;
  color: var(--text-taupe);
  margin: 0 0 36px 0;
  letter-spacing: 0.3px;
}

.search-bar {
  display: flex;
  align-items: center;
  max-width: 620px;
  margin: 0 auto;
  background-color: var(--bg-mocha);
  border-radius: 999px;
  padding: 8px 8px 8px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-right: 14px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-taupe);
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  padding: 12px 0;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.search-btn:hover {
  background-color: #ddbb85;
}

.search-btn:active {
  transform: scale(0.97);
}

.hero-meta {
  margin-top: 20px;
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.hero-meta .dot {
  margin: 0 8px;
  opacity: 0.6;
}

.table-card {
  max-width: 900px;
  margin: 40px auto 0;
  background-color: var(--bg-mocha);
  border-radius: 20px;
  padding: 8px 8px 0;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px 4px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 600;
}

.pos-select {
  appearance: none;
  -webkit-appearance: none;
  background-color: var(--bg-espresso);
  color: var(--text-taupe);
  border: 1px solid rgba(207, 167, 110, 0.35);
  border-radius: 999px;
  padding: 8px 36px 8px 16px;
  font-size: 0.82rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23cfa76e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pos-select:hover {
  border-color: var(--accent-gold);
}

.pos-select:focus {
  outline: none;
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(207, 167, 110, 0.15);
}

.pos-select option {
  background-color: var(--bg-espresso);
  color: var(--text-taupe);
}

.sort-toggle {
  display: flex;
  gap: 6px;
}

.sort-btn {
  background-color: var(--bg-espresso);
  color: var(--text-muted);
  border: 1px solid rgba(207, 167, 110, 0.35);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.sort-btn:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.sort-btn-active {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  border-color: var(--accent-gold);
}

.sort-btn-active:hover {
  background-color: #ddbb85;
  color: var(--bg-espresso);
}

.word-table {
  width: 100%;
  border-collapse: collapse;
}

.word-table thead th {
  text-align: left;
  padding: 20px 24px 14px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
}

.th-chevron {
  width: 40px;
}

.th-actions {
  width: 96px;
}

.table-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.word-table td {
  padding: 18px 24px;
  vertical-align: middle;
  font-size: 0.95rem;
}

.col-english {
  min-width: 140px;
}

.keyword-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.keyword {
  font-weight: 700;
  color: var(--text-taupe);
  font-size: 1rem;
}

.speaker-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 3px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.75;
  transition: color 0.2s ease, opacity 0.2s ease, background-color 0.2s ease, transform 0.1s ease;
}

.speaker-btn:hover:not(:disabled) {
  color: var(--accent-gold);
  opacity: 1;
  background-color: rgba(207, 167, 110, 0.1);
}

.speaker-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.speaker-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.speaker-btn-chip {
  color: var(--text-muted);
  opacity: 0.6;
}

.phonetic {
  font-size: 0.78rem;
  font-style: italic;
  color: var(--text-muted);
  margin-top: 2px;
}

.col-translations {
  min-width: 260px;
}

.translations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.translation-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-espresso);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 4px 12px 4px 4px;
}

.lang-badge {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: 999px;
  line-height: 1.4;
}

.translation-text {
  font-size: 0.85rem;
  color: var(--text-taupe);
  font-style: italic;
}

.no-translations {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.pos-badge {
  display: inline-block;
  background-color: var(--bg-espresso);
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.col-actions {
  width: 96px;
  text-align: center;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.edit-btn:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  background-color: rgba(207, 167, 110, 0.08);
}

.delete-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.delete-btn:hover {
  border-color: #c96a5a;
  color: #c96a5a;
  background-color: rgba(201, 106, 90, 0.08);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.col-chevron {
  text-align: right;
  color: var(--text-muted);
  width: 40px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-info {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  gap: 10px;
}

.page-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-taupe);
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn-active {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  border-color: var(--accent-gold);
  font-weight: 700;
}

.page-btn-active:hover:not(:disabled) {
  background-color: #ddbb85;
  color: var(--bg-espresso);
}

.page-btn-active:disabled {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  opacity: 0.4;
}

@media (max-width: 768px) {
  .hero {
    padding: 48px 16px 32px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .search-bar {
    flex-wrap: wrap;
    border-radius: 20px;
    padding: 16px;
  }

  .search-input {
    width: 100%;
    order: 3;
    padding: 10px 0;
  }

  .search-btn {
    width: 100%;
    margin-top: 8px;
  }

  .table-card {
    margin: 32px 12px 0;
  }

  .word-table thead {
    display: none;
  }

  .word-table tr {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .word-table td {
    padding: 6px 0;
  }

  .col-chevron {
    display: none;
  }

  .col-actions {
    align-self: flex-end;
    width: auto;
  }
}
</style>