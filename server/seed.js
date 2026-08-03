const mongoose = require('mongoose');
const Word = require('./api/models/wordModel');
const wordsData = require('./words.json');

const MONGO_URI = 'mongodb+srv://seojax2:xmEPcQmNPRFrRaKy@cluster0.tyr4v68.mongodb.net/polyglot_dictionary?appName=Cluster0';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    await Word.deleteMany({});
    console.log('Existing word data cleared.');

    await Word.insertMany(wordsData);
    console.log(`Successfully seeded ${wordsData.length} words into the database.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();