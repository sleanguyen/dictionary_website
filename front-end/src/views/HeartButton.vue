<script setup>
import { ref } from 'vue'
import axios from 'axios'

// --- Props -----------------------------------------------------------
// wordId:          the _id of the word this button belongs to
// initialFavorite: whatever your GET /words response already says about
//                   this word (e.g. word.isFavorite). Defaults to false
//                   if your backend doesn't send that field yet.
const props = defineProps({
  wordId: { type: String, required: true },
  initialFavorite: { type: Boolean, default: false }
})

// Lets a parent (like the Favourites list) react immediately when a
// word is un/favourited — e.g. removing the row without waiting for
// the user to navigate away and back.
const emit = defineEmits(['toggled'])

// Local reactive state — this is all the state management this needs.
// No Vuex/Pinia required: each button owns its own favourite flag,
// and the backend is the single source of truth for what "true" means.
const isFavorite = ref(props.initialFavorite)
const isLoading = ref(false) // prevents double-click spamming the API

// A user "counts as logged in" if a JWT is sitting in localStorage.
// (Any authenticated role — viewer or admin — can favourite words;
// this is an authentication check, not a role/RBAC check.)
function isLoggedIn() {
  return !!localStorage.getItem('token')
}

async function toggleFavorite() {
  // Guests never reach the API — they get nudged to log in instead.
  if (!isLoggedIn()) {
    alert('Please log in to save favourite words.')
    return
  }

  if (isLoading.value) return
  isLoading.value = true

  try {
    const token = localStorage.getItem('token')

    // The endpoint IS the toggle — one POST call flips the state,
    // so the frontend never has to track "add" vs "remove" itself.
    // NOTE: full URL, not a relative path — there is no Vite proxy
    // configured, so a relative "/api/..." call would hit the Vite dev
    // server on :5173 instead of Express on :3000.
    const { data } = await axios.post(
      `http://localhost:3000/api/user/favorites/${props.wordId}`,
      {}, // no body needed, the wordId is in the URL
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // Trust the backend's answer, not an optimistic local flip —
    // this keeps the UI correct even if the toggle logic on the
    // server ever changes.
    isFavorite.value = data.isFavorite
    emit('toggled', { wordId: props.wordId, isFavorite: data.isFavorite })
  } catch (error) {
    console.error('Failed to toggle favourite:', error)
    if (error.response?.status === 401) {
      alert('Your session has expired. Please log in again.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button
    class="heart-btn"
    :class="{ 'is-favorite': isFavorite }"
    :disabled="isLoading"
    :title="isFavorite ? 'Remove from favourites' : 'Add to favourites'"
    type="button"
    @click="toggleFavorite"
  >
    <!--
      One SVG, two looks: when isFavorite is true we fill the heart
      with currentColor; when false we leave fill="none" so only the
      outline (stroke) shows. No need to swap between two separate
      icon files.
    -->
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      :fill="isFavorite ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
      />
    </svg>
  </button>
</template>

<style scoped>
.heart-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted, #9c8f7d); /* muted by default, fits a dark theme */
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.2s ease, transform 0.15s ease, background-color 0.2s ease;
}

.heart-btn:hover:not(:disabled) {
  color: #c0392b;
  background-color: rgba(192, 57, 43, 0.1);
}

/* Filled red heart once favourited */
.heart-btn.is-favorite {
  color: #c0392b;
}

.heart-btn:active:not(:disabled) {
  transform: scale(0.88);
}

.heart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>