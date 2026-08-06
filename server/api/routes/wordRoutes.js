const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const { verifyToken, requireAdmin, optionalAuth } = require('../../middleware/authMiddleware');


router.get('/', optionalAuth, wordController.getAllWords);


router.get('/random', wordController.getRandomWord);

router.get('/:id', wordController.getWordById);

// Protected — admin only
router.post('/', verifyToken, requireAdmin, wordController.createWord);
router.put('/:id', verifyToken, requireAdmin, wordController.updateWord);
router.delete('/:id', verifyToken, requireAdmin, wordController.deleteWord);

module.exports = router;