const User = require('../models/userModel');
const Word = require('../models/wordModel');

// POST /api/user/favorites/:wordId  (protected — any logged-in role)
// Toggles a word in/out of the current user's favorites list.
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id; // set by verifyToken middleware
    const { wordId } = req.params;

    // Confirm the word actually exists before favouriting it — avoids
    // silently storing dangling references to deleted/invalid words.
    const wordExists = await Word.exists({ _id: wordId });
    if (!wordExists) {
      return res.status(404).json({ message: 'Word not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingIndex = user.favorites.findIndex(
      (favId) => favId.toString() === wordId
    );

    let isFavorite;
    if (existingIndex === -1) {
      user.favorites.push(wordId);
      isFavorite = true;
    } else {
      user.favorites.splice(existingIndex, 1);
      isFavorite = false;
    }

    await user.save();

    res.status(200).json({
      message: isFavorite ? 'Word added to favorites.' : 'Word removed from favorites.',
      isFavorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error while toggling favorite.' });
  }
};

// GET /api/user/favorites  (protected — any logged-in role)
// Returns the current user's favourite words, fully populated (not just
// the raw ObjectIds), ready to render directly in the Favourites page.
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      data: user.favorites,
      totalItems: user.favorites.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error while fetching favorites.' });
  }
};
