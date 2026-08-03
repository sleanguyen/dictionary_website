const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const { verifyToken, requireAdmin } = require('../../middleware/authMiddleware');

// Public
router.get('/', wordController.getAllWords);
router.get('/:id', wordController.getWordById);

// Protected — admin only
router.post('/', verifyToken, requireAdmin, wordController.createWord);
router.put('/:id', verifyToken, requireAdmin, wordController.updateWord);
router.delete('/:id', verifyToken, requireAdmin, wordController.deleteWord);

module.exports = router;