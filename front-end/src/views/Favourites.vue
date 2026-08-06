<template>
  <div class="favourites-page">
    <section class="hero">
      <h1 class="hero-title">Your favourite words.</h1>
      <p class="hero-meta">
        {{ favorites.length }} {{ favorites.length === 1 ? 'WORD' : 'WORDS' }} SAVED
      </p>
    </section>

    <section class="table-card">
      <div v-if="isLoading" class="state-message">Loading your favourites...</div>

      <div v-else-if="favorites.length === 0" class="state-message">
        You haven't favourited any words yet. Head to the
        <router-link to="/words" class="inline-link">Dictionary</router-link>
        and tap the heart icon on a word to save it here.
      </div>

      <table v-else class="word-table">
        <thead>
          <tr>
            <th>English Term</th>
            <th>Translations</th>
            <th>Part of Speech</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in favorites" :key="word._id" class="table-row">
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
                <!-- Already favourited by definition of being on this page,
                     so initial-favorite is always true here. Clicking it
                     again unfavourites and removes the row on next visit. -->
                <HeartButton
                  :word-id="word._id"
                  :initial-favorite="true"
                  @toggled="handleUnfavorite"
                />
              </div>
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
              </div>
            </td>
            <td class="col-pos">
              <span class="pos-badge">{{ word.partOfSpeech }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import HeartButton from './HeartButton.vue';

export default {
  name: 'Favourites',
  components: { HeartButton },
  data() {
    return {
      favorites: [],
      isLoading: true,
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
  mounted() {
    this.fetchFavorites();
  },
  beforeUnmount() {
    if (this.ttsSupported) {
      window.speechSynthesis.cancel();
    }
  },
  methods: {
    async fetchFavorites() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://dictionary-website-qntj.onrender.com/api/user/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.favorites = response.data.data;
      } catch (error) {
        console.error('Failed to fetch favourites:', error);
        this.favorites = [];
      } finally {
        this.isLoading = false;
      }
    },
    playAudio(text, langCode) {
      if (!this.ttsSupported || !text) return;
      window.speechSynthesis.cancel();
      const locale = this.langLocaleMap[(langCode || '').toLowerCase()] || 'en-US';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    // Every word on this page starts as favourited by definition, so the
    // only toggle event we ever care about here is "just unfavourited" —
    // splice it straight out instead of waiting for a refetch/revisit.
    handleUnfavorite({ wordId, isFavorite }) {
      if (isFavorite) return;
      this.favorites = this.favorites.filter((word) => word._id !== wordId);
    }
  }
};
</script>

<style scoped>
.hero {
  padding: 64px 24px 32px;
  text-align: center;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 2.2rem;
  color: var(--text-taupe);
  margin: 0 0 12px;
}

.hero-meta {
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.table-card {
  max-width: 960px;
  margin: 0 auto 64px;
  background-color: var(--bg-mocha);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.state-message {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.inline-link {
  color: var(--accent-gold);
  text-decoration: underline;
}

.word-table {
  width: 100%;
  border-collapse: collapse;
}

.word-table thead th {
  text-align: left;
  padding: 16px 24px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.75;
  transition: color 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.speaker-btn:hover:not(:disabled) {
  color: var(--accent-gold);
  opacity: 1;
  background-color: rgba(207, 167, 110, 0.1);
}

.speaker-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.speaker-btn-chip {
  color: var(--text-muted);
  opacity: 0.6;
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
</style>