/**
 * Authentication Routes
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * POST /api/auth/logout - Logout user
 * POST /api/auth/refresh - Refresh access token
 * GET /api/auth/verify - Verify token and get user info
 * GET /api/auth/profile - Get current user profile
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateTokens, verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

// ============================================
// REGISTER - POST /api/auth/register
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    console.log('📝 REGISTRATION REQUEST RECEIVED:');
    console.log('   Email:', email);
    console.log('   Name:', firstName, lastName);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password must be at least 8 characters',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format',
      });
    }

    console.log('✅ Input validation passed');

    // Create user in database
    console.log('💾 Creating user in database...');
    const newUser = await User.create({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'patient',
    });

    console.log('✅ USER REGISTERED');
    console.log('   User ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role);

    // Generate tokens
    const tokens = generateTokens({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    
    if (error.message.includes('Email already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// LOGIN - POST /api/auth/login
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 LOGIN REQUEST RECEIVED:');
    console.log('   Email:', email);
    console.log('   Password:', password ? '***' : 'empty');

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    // Find user in database
    console.log('🔍 Searching for user in database...');
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('❌ USER NOT FOUND - Email:', email);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    console.log('✅ User found:', user.email);

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log('❌ PASSWORD MISMATCH');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    console.log('✅ PASSWORD VERIFIED');

    // Check if user is active
    if (user.status !== 'active') {
      console.log('❌ USER INACTIVE - Status:', user.status);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User account is not active',
      });
    }

    // Generate tokens
    console.log('🎟️  Generating tokens...');
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('✅ LOGIN SUCCESSFUL');
    console.log('   User:', user.first_name, user.last_name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Access Token:', tokens.accessToken.substring(0, 20) + '...');

    res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// VERIFY TOKEN - GET /api/auth/verify
// ============================================
router.get('/verify', verifyJWT, async (req, res) => {
  try {
    console.log('🔍 VERIFYING TOKEN for user:', req.user.email);

    // Load full user data from database
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    if (user.status !== 'active') {
      console.log('❌ User inactive');
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User account is not active',
      });
    }

    console.log('✅ Token verified for:', user.email);
    
    res.status(200).json({
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
        },
        token: {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// GET PROFILE - GET /api/auth/profile
// ============================================
router.get('/profile', verifyJWT, async (req, res) => {
  try {
    console.log('👤 FETCHING PROFILE for user:', req.user.userId);

    // Load full user profile from database
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    console.log('✅ Profile retrieved for:', user.email);
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// ============================================
// LOGOUT - POST /api/auth/logout
// ============================================
router.post('/logout', verifyJWT, (req, res) => {
  // In a stateless JWT system, logout is primarily client-side
  // You may implement token blacklist if needed
  res.status(200).json({
    message: 'Logout successful',
    data: {
      userId: req.user.userId,
    },
  });
});

// ============================================
// REFRESH TOKEN - POST /api/auth/refresh
// ============================================
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token type',
      });
    }

    // Generate new access token
    const newTokens = generateTokens({ id: decoded.userId });

    res.status(200).json({
      message: 'Token refreshed (Phase 2)',
      data: {
        tokens: newTokens,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
});

module.exports = router;
