const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = 'your-secret-key'; // In a real app, use environment variables

console.log('Auth feature loaded');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Auth] Registration attempt for username: ${username}`);
    
    if (!username || !password) {
      console.warn('[Auth] Registration failed: Username and password are required.');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.warn(`[Auth] Registration failed: User '${username}' already exists.`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    console.log(`[Auth] User '${username}' registered successfully.`);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('[Auth] Error registering user:', error.message);
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Auth] Login attempt for username: ${username}`);
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn(`[Auth] Login failed for username '${username}': Invalid credentials.`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`[Auth] User '${username}' logged in successfully. Token generated.`);
    res.json({ token });
  } catch (error) {
    console.error('[Auth] Error logging in:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
