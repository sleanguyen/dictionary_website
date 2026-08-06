const apiClient = axios.create({
  baseURL: 'https://dictionary-website-qntj.onrender.com/api/words/',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  getWords() {
    return apiClient.get('/')
  },
  getWord(id) {
    return apiClient.get(`/${id}`)
  },
  createWord(wordData) {
    return apiClient.post('/', wordData)
  },
  updateWord(id, wordData) {
    return apiClient.put(`/${id}`, wordData)
  },
  deleteWord(id) {
    return apiClient.delete(`/${id}`)
  }
}