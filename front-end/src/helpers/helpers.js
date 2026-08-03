import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/games/',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // GET all games
  getGames() {
    return apiClient.get('/')
  },

  // GET one game by ID
  getGame(id) {
    return apiClient.get(`/${id}`)
  },

  // POST create new game
  createGame(gameData) {
    return apiClient.post('/', gameData)
  },

  // PUT update game by ID
  updateGame(id, gameData) {
    return apiClient.put(`/${id}`, gameData)
  },

  // DELETE game by ID
  deleteGame(id) {
    return apiClient.delete(`/${id}`)
  }
}