import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../errors/AppError';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) throw new AppError('Not authorized', 401, 'NOT_AUTH');
    const token = auth.split(' ')[1];
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) throw new AppError('User not found', 401, 'NOT_AUTH');
    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default protect;
