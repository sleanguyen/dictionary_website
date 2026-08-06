import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://dictionary-website-qntj.onrender.com/games/',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // GET all games
  getWords() {
    return apiClient.get('/')
  },

  // GET one game by ID
  getWord(id) {
    return apiClient.get(`/${id}`)
  },

  // POST create new game
  createWord(wordData) {
    return apiClient.post('/', wordData)
  },

  // PUT update game by ID
  updateWord(id, wordData) {
    return apiClient.put(`/${id}`, wordData)
  },

  // DELETE game by ID
  deleteWord(id) {
    return apiClient.delete(`/${id}`)
  }
}