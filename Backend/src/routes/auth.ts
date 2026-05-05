import express from 'express';
import User from '../models/User';
import Account from '../models/Account';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import validateRequest from '../middleware/validate';
import { z } from 'zod';
import { AppError } from '../errors/AppError';

const router = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created user (id and email)
 */

const registerSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) })
});

const loginSchema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) });

const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });

const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', { expiresIn: '7d' });

router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
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

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and receive access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns access token and sets refresh cookie
 */
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    const access = signAccessToken(user._id.toString());
    const refresh = signRefreshToken(user._id.toString());
    res.cookie('refreshToken', refresh, { httpOnly: true, secure: false, sameSite: 'lax' });
    return res.json({ accessToken: access });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Exchange refresh token for new access token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Returns new access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('Missing refresh token', 401, 'NO_REFRESH');
    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshsecret');
    const access = signAccessToken(payload.sub);
    return res.json({ accessToken: access });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear refresh token cookie
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Ok
 */
router.post('/logout', async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});

export default router;
