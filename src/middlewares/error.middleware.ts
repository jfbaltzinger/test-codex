import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http-error';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : 'Internal server error';
  logger.error('Request failed', { status, message, stack: err.stack });
  res.status(status).json({ message });
};
