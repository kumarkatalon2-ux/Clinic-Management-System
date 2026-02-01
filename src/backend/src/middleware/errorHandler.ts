import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    error: err,
    path: req.path,
    method: req.method,
  }, 'Request error');

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        statusCode: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { details: err.details }),
      },
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && { message: err.message }),
    },
  });
};

export class BadRequestError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}
