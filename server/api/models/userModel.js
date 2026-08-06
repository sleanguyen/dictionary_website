const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'admin'],
      default: 'viewer'
    },
    favorites: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word'
  }
]
  },
  { timestamps: true }
  
);

module.exports = mongoose.model('User', userSchema);