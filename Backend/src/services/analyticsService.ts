import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import Account from '../models/Account';
import mockPriceService from './mockPriceService';

/**
 * Returns current balances grouped by asset for a user's accounts
 */
export const getCurrentBalances = async (userId: string) => {
  const accounts = await Account.find({ userId }).select('_id').lean();
  const accountIds = accounts.map((a) => a._id);

  const pipeline: any[] = [
    { $match: { accountId: { $in: accountIds } } },
    {
      $group: {
        _id: '$assetSymbol',
        buys: {
          $sum: {
            $cond: [{ $eq: ['$type', 'BUY'] }, '$quantity', { $toDecimal: '0' }]
          }
        },
        sells: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SELL'] }, '$quantity', { $toDecimal: '0' }]
          }
        },
        totalBuyCost: {
          $sum: {
            $cond: [{ $eq: ['$type', 'BUY'] }, { $multiply: ['$quantity', '$priceAtDate'] }, { $toDecimal: '0' }]
          }
        }
      }
    },
    {
      $project: {
        assetSymbol: '$_id',
        _id: 0,
        buys: 1,
        sells: 1,
        netQuantity: { $subtract: ['$buys', '$sells'] },
        averageBuyPrice: {
          $cond: [
            { $gt: ['$buys', { $toDecimal: '0' }] },
            { $divide: ['$totalBuyCost', '$buys'] },
            null
          ]
        }
      }
    }
  ];

  const rows = await Transaction.aggregate(pipeline).exec();

  // Enrich with current price and compute value
  const enriched = rows.map((r: any) => {
    const price = mockPriceService.getLatestPrice(r.assetSymbol);
    const netQty = parseFloat(r.netQuantity.toString());
    const avgBuy = r.averageBuyPrice ? parseFloat(r.averageBuyPrice.toString()) : null;
    return {
      assetSymbol: r.assetSymbol,
      netQuantity: netQty,
      averageBuyPrice: avgBuy,
      currentPrice: price,
      currentValue: netQty * price
    };
  });

  return enriched;
};

/**
 * Returns asset allocation percentages and flags concentration risk
 */
export const getAssetAllocation = async (userId: string) => {
  const balances = await getCurrentBalances(userId);
  const totalValue = balances.reduce((s, b) => s + b.currentValue, 0);

  const allocation = balances.map((b) => ({
    assetSymbol: b.assetSymbol,
    value: b.currentValue,
    percent: totalValue > 0 ? (b.currentValue / totalValue) * 100 : 0
  }));

  const concentration = allocation.some((a) => a.percent > 25);

  return { totalValue, allocation, concentrationRisk: concentration };
};

/**
 * Time-series portfolio value by day between dates.
 * Uses aggregation to bucket transactions per day and windowing to compute cumulative holdings.
 */
export const getTimeSeries = async (userId: string, startDate: Date, endDate: Date) => {
  const accounts = await Account.find({ userId }).select('_id').lean();
  const accountIds = accounts.map((a) => a._id);

  const pipeline: any[] = [
    { $match: { accountId: { $in: accountIds }, date: { $gte: startDate, $lte: endDate } } },
    {
      $addFields: {
        day: { $dateTrunc: { date: '$date', unit: 'day' } }
      }
    },
    {
      $group: {
        _id: { day: '$day', asset: '$assetSymbol' },
        dayBuys: {
          $sum: { $cond: [{ $eq: ['$type', 'BUY'] }, '$quantity', { $toDecimal: '0' }] }
        },
        daySells: {
          $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, '$quantity', { $toDecimal: '0' }] }
        }
      }
    },
    {
      $project: {
        day: '$_id.day',
        asset: '$_id.asset',
        netChange: { $subtract: ['$dayBuys', '$daySells'] },
        _id: 0
      }
    },
    { $sort: { day: 1 } },
    {
      $setWindowFields: {
        partitionBy: '$asset',
        sortBy: { day: 1 },
        output: {
          cumulativeQty: {
            $sum: '$netChange',
            window: { documents: ['unbounded', 'current'] }
          }
        }
      }
    },
    {
      $group: {
        _id: '$day',
        assets: {
          $push: { asset: '$asset', quantity: '$cumulativeQty' }
        }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const rows = await Transaction.aggregate(pipeline).exec();

  // For each day, compute portfolio value using mockPriceService
  const series = rows.map((r: any) => {
    const day: Date = r._id;
    const totalValue = r.assets.reduce((sum: number, a: any) => {
      const price = mockPriceService.getPriceAt(a.asset, day);
      const qty = parseFloat(a.quantity.toString());
      return sum + qty * price;
    }, 0);
    return { date: day, value: totalValue };
  });

  return series;
};

export default { getCurrentBalances, getAssetAllocation, getTimeSeries };
