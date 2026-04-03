import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger.js';

// Centralised error class for operational errors.
// Use `new AppError(message, statusCode)` instead of throwing raw Errors
// so the handler can distinguish expected vs unexpected failures.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
    // Restores prototype chain in compiled JS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Shape of every error body returned by the API.
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    // Only present on validation errors
    details?: Array<{ path: string; message: string }>;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ── Zod validation errors ────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: err.errors.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
    res.status(400).json(body);
    return;
  }

  // ── Operational (expected) errors ────────────────────────────────────────
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      error: {
        code: err.code ?? 'APP_ERROR',
        message: err.message,
      },
    };
    if (err.statusCode >= 500) {
      logger.error({ err }, 'Operational error');
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // ── Unexpected errors ────────────────────────────────────────────────────
  logger.error({ err }, 'Unhandled error');
  const body: ErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Our team has been notified.',
    },
  };
  res.status(500).json(body);
}
