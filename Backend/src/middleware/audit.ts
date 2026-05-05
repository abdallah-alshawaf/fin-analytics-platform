import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Simple audit middleware: logs POST/PUT/DELETE requests as critical actions
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    // avoid logging bodies with sensitive fields in production
    logger.info('audit', { user: (req as any).user?._id ?? null, method, path: req.path, body: req.body });
  }
  next();
};

export default auditMiddleware;
