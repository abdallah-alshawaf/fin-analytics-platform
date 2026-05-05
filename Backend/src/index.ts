import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import argon2 from 'argon2';
import { z } from 'zod';
import transactionsRouter from './routes/transactions';
import authRouter from './routes/auth';
import analyticsRouter from './routes/analytics';
import accountsRouter from './routes/accounts';
import User from './models/User';
import Account from './models/Account';
import connectDB from './utils/db';
import validateRequest from './middleware/validate';
import { AppError } from './errors/AppError';
import { errorHandler } from './middleware/errorHandler';
import { auditMiddleware } from './middleware/audit';
import setupSwagger from './swagger';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(auditMiddleware);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));

const registerSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) })
});

app.post('/api/v1/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('User already exists', 400, 'USER_EXISTS');

    const hash = await argon2.hash(password);
    const user = await User.create({ email, passwordHash: hash });
    const linkedAccount = await Account.create({
      userId: user._id,
      name: 'Primary Brokerage',
      type: 'BROKERAGE',
      currency: 'USD'
    });

    return res.status(201).json({ id: user._id, email: user.email, accountId: linkedAccount._id });
  } catch (err) {
    next(err);
  }
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/accounts', accountsRouter);

setupSwagger(app);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });

// global error handler
app.use(errorHandler);
