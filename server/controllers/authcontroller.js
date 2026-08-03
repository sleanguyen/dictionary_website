const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'polyglot_dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // SECURITY: role is never taken from req.body — always forced to 'viewer'
    // on registration. Promotion to 'admin' must happen manually (e.g. directly
    // in the database or via a separate admin-only endpoint), never via signup.
    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'viewer'
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
// PUT /auth/profile  (protected — requires valid token)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Require current password to confirm identity before ANY change.
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    if (newUsername && newUsername.trim() !== '') {
      const existing = await User.findOne({ username: newUsername.trim() });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      user.username = newUsername.trim();
    }

    if (newPassword && newPassword.trim() !== '') {
      user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};