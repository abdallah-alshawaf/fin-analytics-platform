import express from 'express';
import Account from '../models/Account';
import { protect } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['SAVINGS', 'BROKERAGE', 'CRYPTO']),
    currency: z.string().min(1).default('USD')
  })
});

/**
 * @openapi
 * /api/v1/accounts:
 *   get:
 *     summary: List accounts for the authenticated user
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of accounts
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const accounts = await Account.find({ userId: user._id }).select('_id name type currency').lean();
    return res.json({ accounts });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/accounts:
 *   post:
 *     summary: Create an account for the authenticated user
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SAVINGS, BROKERAGE, CRYPTO]
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created account
 */
router.post('/', protect, validateRequest(createAccountSchema), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const { name, type, currency } = req.body;
    const account = await Account.create({ userId: user._id, name, type, currency: currency || 'USD' });
    return res.status(201).json({ account });
  } catch (err) {
    next(err);
  }
});

export default router;
