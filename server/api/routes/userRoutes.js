const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../../middleware/authMiddleware');
router.get('/favorites', verifyToken, userController.getFavorites);
router.post('/favorites/:wordId', verifyToken, userController.toggleFavorite);

module.exports = router;