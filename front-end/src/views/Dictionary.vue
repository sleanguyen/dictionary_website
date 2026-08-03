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
              <div class="keyword">{{ word.keyword }}</div>
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

export default {
  name: 'Dictionary',
  data() {
    return {
      searchQuery: '',
      allWords: [],
      deletingId: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10
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
  methods: {
    async fetchWords() {
      try {
        const response = await axios.get(
          `http://localhost:3000/words?page=${this.currentPage}&limit=${this.limit}`
        );

        this.allWords = response.data.data;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
        this.currentPage = response.data.currentPage;
      } catch (error) {
        console.error('Failed to fetch words from the backend:', error);
        this.allWords = [];
      }
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
        await axios.delete(`http://localhost:3000/words/${word._id}`);
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

.keyword {
  font-weight: 700;
  color: var(--text-taupe);
  font-size: 1rem;
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