import mongoose from 'mongoose';
import Transaction from '../models/Transaction';

/**
 * Check if an account has enough balance of an asset to perform a SELL
 */
export const canSell = async (
  accountId: string | mongoose.Types.ObjectId,
  assetSymbol: string,
  sellQuantity: string | number
) => {
  const accountObjId = typeof accountId === 'string' ? new mongoose.Types.ObjectId(accountId) : accountId;

  const pipeline = [
    { $match: { accountId: accountObjId, assetSymbol } },
    {
      $group: {
        _id: null,
        buys: {
          $sum: {
            $cond: [{ $eq: ['$type', 'BUY'] }, '$quantity', { $toDecimal: '0' }]
          }
        },
        sells: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SELL'] }, '$quantity', { $toDecimal: '0' }]
          }
        }
      }
    },
    { $project: { balance: { $subtract: ['$buys', '$sells'] } } }
  ];

  const res = await Transaction.aggregate(pipeline).exec();
  const balance = res?.[0]?.balance ?? null;

  if (!balance) {
    // No existing holdings
    return false;
  }

  const balanceStr = balance.toString();
  const sellStr = sellQuantity.toString();

  // Compare as Decimal128 by converting to Numbers carefully (assumes reasonable precision)
  // For production, use a Decimal lib; here a string compare via BigInt is avoided for simplicity.
  const bal = parseFloat(balanceStr);
  const sell = parseFloat(sellStr);

  return bal >= sell;
};

export default { canSell };
