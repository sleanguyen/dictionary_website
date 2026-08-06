<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Reactive state — plain ref()s are enough here, no Vuex/Pinia needed
// since nothing outside this component cares about this state.
const showModal = ref(false)
const randomWord = ref(null)

async function fetchRandomWord() {
  try {
    const { data } = await axios.get('http://localhost:3000/words/random')
    randomWord.value = data
    showModal.value = true // only reveal the modal once we actually have a word
  } catch (error) {
    console.error('Failed to fetch random word:', error)
    // Fails silently on purpose — a broken popup shouldn't block the
    // rest of the page from loading and being usable.
  }
}

// onMounted() is a Vue 3 lifecycle hook: the callback inside it runs
// exactly once, right after this component has been inserted into the
// DOM for the first time. It's the Composition API equivalent of the
// mounted() option in Options API.
//
// This is the correct place for a "run once when the page loads" side
// effect like an API call — as opposed to putting the fetch directly in
// <script setup>'s top-level code, which would run during component
// SETUP (before the DOM exists) rather than after MOUNT.
onMounted(() => {
  fetchRandomWord()
})

function closeModal() {
  showModal.value = false
}
</script>

<template>
  <!-- v-if means this whole overlay doesn't exist in the DOM at all
       until showModal becomes true — nothing to accidentally click
       through before the word has loaded. -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-box">
      <button class="modal-close" type="button" @click="closeModal">&times;</button>

      <p class="modal-label">Word of the moment</p>
      <h2 class="modal-keyword">{{ randomWord?.keyword }}</h2>
      <span class="modal-pos">{{ randomWord?.partOfSpeech }}</span>

      <p v-if="randomWord?.translations?.length" class="modal-translation">
        <span class="modal-lang">{{ randomWord.translations[0].lang }}</span>
        {{ randomWord.translations[0].text }}
      </p>

      <button class="modal-btn" type="button" @click="closeModal">Close</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  position: relative;
  background-color: var(--bg-mocha, #29211c);
  border: 1px solid rgba(207, 167, 110, 0.35);
  border-radius: 16px;
  padding: 40px 32px 32px;
  width: 320px;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-muted, #8a7c72);
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  color: var(--accent-gold, #cfa76e);
}

.modal-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted, #8a7c72);
  margin: 0 0 8px;
}

.modal-keyword {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--text-taupe, #d6cfc9);
  font-size: 1.8rem;
  margin: 0 0 10px;
}

.modal-pos {
  display: inline-block;
  background-color: var(--bg-espresso, #1b1614);
  color: var(--text-muted, #8a7c72);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-translation {
  margin: 16px 0 24px;
  color: var(--text-taupe, #d6cfc9);
  font-style: italic;
}

.modal-lang {
  background-color: var(--accent-gold, #cfa76e);
  color: var(--bg-espresso, #1b1614);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  margin-right: 6px;
  font-style: normal;
}

.modal-btn {
  background-color: var(--accent-gold, #cfa76e);
  color: var(--bg-espresso, #1b1614);
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 10px 28px;
  border-radius: 999px;
  cursor: pointer;
}

.modal-btn:hover {
  background-color: #ddbb85;
}
</style>
