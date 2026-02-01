/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends APIError {
  constructor(message, details = {}) {
    super(message, 400, details);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized', details = {}) {
    super(message, 401, details);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', details = {}) {
    super(message, 403, details);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends APIError {
  constructor(message = 'Not found', details = {}) {
    super(message, 404, details);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends APIError {
  constructor(message = 'Conflict', details = {}) {
    super(message, 409, details);
  }
}

/**
 * 422 Unprocessable Entity Error (Validation)
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422, { errors });
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal server error', details = {}) {
    super(message, 500, details);
  }
}

/**
 * Database Error
 */
class DatabaseError extends APIError {
  constructor(message = 'Database error', originalError = null) {
    super(message, 500, {
      originalError: originalError ? originalError.message : null,
    });
  }
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      statusCode: 500,
    },
  });
}

module.exports = {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  DatabaseError,
  errorHandler,
};
