import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message, code: err.code });
  }

  console.error(err);
  return res.status(500).json({ status: 'error', message: 'Internal Server Error', code: 'INTERNAL_ERROR' });
};

export default errorHandler;
