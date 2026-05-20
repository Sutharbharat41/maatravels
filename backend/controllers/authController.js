const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/supabase');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const envEmail = process.env.ADMIN_EMAIL || 'admin@maatravels.com';
    const envPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const jwtSecret = process.env.JWT_SECRET || 'maa_travels_super_secret_jwt_token_key_2026';

    let user = null;
    let isMatch = false;

    // 1. First check if static env variables match the input credentials
    if (email.toLowerCase() === envEmail.toLowerCase() && password === envPassword) {
      user = {
        id: 'env-admin-id',
        email: envEmail,
        name: 'MAA Travels Admin (Env)',
        role: 'admin'
      };
      isMatch = true;
    } else {
      // 2. Otherwise search in database
      const users = await db.query('users', { eq: { email: email.toLowerCase() } });
      if (users && users.length > 0) {
        const foundUser = users[0];
        isMatch = await bcrypt.compare(password, foundUser.password_hash);
        if (isMatch) {
          user = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role || 'admin'
          };
        }
      }
    }

    if (!isMatch || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const envEmail = process.env.ADMIN_EMAIL || 'admin@maatravels.com';
    
    // Check if env user
    if (req.user.id === 'env-admin-id') {
      return res.status(200).json({
        user: {
          id: 'env-admin-id',
          email: envEmail,
          name: 'MAA Travels Admin (Env)',
          role: 'admin'
        }
      });
    }

    // Query database
    const users = await db.query('users', { eq: { id: req.user.id } });
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User session not found.' });
    }

    const foundUser = users[0];
    return res.status(200).json({
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
};
