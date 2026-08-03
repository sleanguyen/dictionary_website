const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  lang: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const wordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, trim: true },
  sourceLanguage: { type: String, default: 'en' },
  partOfSpeech: { type: String, default: '' },
  translations: { type: [translationSchema], default: [] },
  examples: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Word', wordSchema);
