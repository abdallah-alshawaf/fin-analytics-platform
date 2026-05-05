import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import Account from '../models/Account';
import { canSell } from '../services/validationService';
import { protect } from '../middleware/authMiddleware';
import { z } from 'zod';
import validateRequest from '../middleware/validate';

const router = express.Router();

/**
 * @openapi
 * /api/v1/transactions:
 *   post:
 *     summary: Create a transaction (BUY or SELL)
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *               assetSymbol:
 *                 type: string
 *               type:
 *                 type: string
 *               quantity:
 *                 type: string
 *               priceAtDate:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */

const txSchema = z.object({
  body: z.object({
    accountId: z.string().min(1),
    assetSymbol: z.string().min(1),
    type: z.enum(['BUY', 'SELL']),
    quantity: z.string().min(1),
    priceAtDate: z.string().min(1),
    date: z.string().optional()
  })
});

router.post('/', protect, validateRequest(txSchema), async (req, res) => {
  try {
    const { accountId, assetSymbol, type, quantity, priceAtDate, date } = req.body;

    if (!accountId || !assetSymbol || !type || !quantity || !priceAtDate || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    if (type === 'SELL') {
      const ok = await canSell(accountId, assetSymbol, quantity);
      if (!ok) return res.status(400).json({ error: 'Insufficient asset balance to sell' });
    }

    const tx = new Transaction({
      accountId: new mongoose.Types.ObjectId(accountId),
      assetSymbol,
      type,
      quantity: mongoose.Types.Decimal128.fromString(quantity.toString()),
      priceAtDate: mongoose.Types.Decimal128.fromString(priceAtDate.toString()),
      date: new Date(date)
    });

    await tx.save();
    return res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List transactions for the authenticated user
router.get('/', protect, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const accounts = await Account.find({ userId: user._id }).select('_id name').lean();
    const accountIds = accounts.map((a: any) => a._id);

    const rows = await Transaction.find({ accountId: { $in: accountIds } }).sort({ date: -1 }).lean();

    // attach account name and stringify Decimal128 fields
    const accountMap = new Map(accountIds.map((id: any, idx: number) => [String(id), accounts[idx]?.name]));
    const transactions = rows.map((r: any) => ({
      _id: String(r._id),
      accountId: String(r.accountId),
      accountName: accountMap.get(String(r.accountId)) || null,
      assetSymbol: r.assetSymbol,
      type: r.type,
      quantity: r.quantity ? r.quantity.toString() : null,
      priceAtDate: r.priceAtDate ? r.priceAtDate.toString() : null,
      date: r.date
    }));

    return res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

export default router;
