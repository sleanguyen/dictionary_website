const Word = require('../models/wordModel');
const User = require('../models/userModel');

// GET /words/random - one random word, for the auto-popup on page load
exports.getRandomWord = async (req, res) => {
  try {
    const result = await Word.aggregate([{ $sample: { size: 1 } }]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No words found.' });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /words - create a new word
exports.createWord = async (req, res) => {
  try {
    const newWord = new Word(req.body);
    const savedWord = await newWord.save();
    res.status(201).json(savedWord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /words/:id - read a single word
exports.getWordById = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.status(200).json(word);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /words/:id - update a word
exports.updateWord = async (req, res) => {
  try {
    const updatedWord = await Word.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.status(200).json(updatedWord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /words/:id - delete a word
exports.deleteWord = async (req, res) => {
  try {
    const result = await Word.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.status(200).json({ message: 'Word successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /words?page=1&limit=10&pos=noun&sort=asc
exports.getAllWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pos = req.query.pos;
    const query = {};
    if (pos) query.partOfSpeech = pos;

    let sortOption = {};
    if (req.query.sort === 'asc') {
      sortOption = { keyword: 1 };
    } else if (req.query.sort === 'desc') {
      sortOption = { keyword: -1 };
    }

    const [words, totalItems] = await Promise.all([
      Word.find(query)
        .collation({ locale: 'en', strength: 2 })
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Word.countDocuments(query)
    ]);

    let favoriteIds = new Set();
    if (req.user) {
      const user = await User.findById(req.user.id).select('favorites');
      if (user) {
        favoriteIds = new Set(user.favorites.map((id) => id.toString()));
      }
    }

    const wordsWithFavoriteFlag = words.map((word) => ({
      ...word.toObject(),
      isFavorite: favoriteIds.has(word._id.toString())
    }));

    res.status(200).json({
      data: wordsWithFavoriteFlag,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Failed to fetch words:', error);
    res.status(500).json({ message: 'Server error while fetching words.' });
  }
};