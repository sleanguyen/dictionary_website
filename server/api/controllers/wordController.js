const Word = require('../models/wordModel');

// GET /words - list all words, with optional search
exports.getAllWords = async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { keyword: regex },
          { 'translations.text': regex }
        ]
      };
    }

    const words = await Word.find(query).sort({ keyword: 1 });
    res.status(200).json(words);
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

// GET /words?page=1&limit=10
exports.getAllWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [words, totalItems] = await Promise.all([
      Word.find().skip(skip).limit(limit),
      Word.countDocuments()
    ]);

    res.status(200).json({
      data: words,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Failed to fetch words:', error);
    res.status(500).json({ message: 'Server error while fetching words.' });
  }
};