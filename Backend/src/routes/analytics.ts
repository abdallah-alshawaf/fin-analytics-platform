import express from 'express';
import { z } from 'zod';
import validateRequest from '../middleware/validate';
import { protect } from '../middleware/authMiddleware';
import analyticsService from '../services/analyticsService';

const router = express.Router();

/**
 * @openapi
 * /api/v1/analytics/summary:
 *   get:
 *     summary: Get current portfolio balances
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Current balances per asset with current price and value
 */
router.get('/summary', protect, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const balances = await analyticsService.getCurrentBalances(user._id.toString());
    return res.json({ balances });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/analytics/allocation:
 *   get:
 *     summary: Get asset allocation and concentration risk
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Allocation percentages and concentration flag
 */
router.get('/allocation', protect, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const allocation = await analyticsService.getAssetAllocation(user._id.toString());
    return res.json(allocation);
  } catch (err) {
    next(err);
  }
});

const tsSchema = z.object({ query: z.object({ start: z.string().optional(), end: z.string().optional() }) });

/**
 * @openapi
 * /api/v1/analytics/timeseries:
 *   get:
 *     summary: Get portfolio value time series between dates
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *         description: ISO date string for start
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *         description: ISO date string for end
 *     responses:
 *       200:
 *         description: Array of {date, value}
 */
router.get('/timeseries', protect, validateRequest(tsSchema), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const start = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 90);
    const end = req.query.end ? new Date(req.query.end as string) : new Date();
    const series = await analyticsService.getTimeSeries(user._id.toString(), start, end);
    return res.json({ series });
  } catch (err) {
    next(err);
  }
});

export default router;
