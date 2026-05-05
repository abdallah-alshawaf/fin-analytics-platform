import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    return next(new ValidationError(message));
  }
  // attach parsed
  req.body = result.data.body;
  req.query = result.data.query;
  req.params = result.data.params;
  next();
};

export default validateRequest;
