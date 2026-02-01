/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

const { verifyToken } = require('../utils/jwt');

/**
 * Verify JWT Token Middleware
 * Checks for valid token in Authorization header
 */
const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
        code: 'NO_TOKEN',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Verify Role Middleware
 * Checks if user has required role
 * @param {string|Array} roles - Required role(s)
 */
const verifyRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${roleArray.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Optional JWT Middleware
 * Verifies token if provided, but doesn't fail if missing
 */
const verifyJWTOptional = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Optional auth, so don't fail
    next();
  }
};

module.exports = {
  verifyToken: verifyJWT,
  verifyJWT,
  verifyRole,
  checkRole: verifyRole,
  verifyJWTOptional,
};
