import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from '../utils/http-error';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.method === 'GET' || req.method === 'DELETE') {
        schema.parse({ ...req.params, ...req.query });
      } else {
        schema.parse(req.body);
      }
      next();
    } catch (err: any) {
      next(new HttpError(400, err.errors?.[0]?.message || 'Validation error'));
    }
  };
};
