import dotenv from 'dotenv';
import connectDB from './utils/db';
import User from './models/User';
import Account from './models/Account';
import Transaction from './models/Transaction';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log('Seeding database...');

  // Clear existing
  await Promise.all([User.deleteMany({}), Account.deleteMany({}), Transaction.deleteMany({})]);

  const user = await User.create({ email: 'norman@example.com', passwordHash: 'fakehash' });

  const accounts = await Account.create([
    { userId: user._id, name: 'Vanguard', type: 'BROKERAGE', currency: 'USD' },
    { userId: user._id, name: 'Binance', type: 'CRYPTO', currency: 'USD' }
  ]);

  const [vanguard, binance] = accounts;

  const now = new Date();

  // Add some realistic transactions
  const txs = [
    // Vanguard - AAPL buys
    { accountId: vanguard._id, assetSymbol: 'AAPL', type: 'BUY', quantity: '10', priceAtDate: '150', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60) },
    { accountId: vanguard._id, assetSymbol: 'AAPL', type: 'BUY', quantity: '5', priceAtDate: '160', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30) },
    { accountId: vanguard._id, assetSymbol: 'TSLA', type: 'BUY', quantity: '2', priceAtDate: '800', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10) },
    // Binance - BTC buys
    { accountId: binance._id, assetSymbol: 'BTC', type: 'BUY', quantity: '0.005', priceAtDate: '40000', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 200) },
    { accountId: binance._id, assetSymbol: 'ETH', type: 'BUY', quantity: '0.1', priceAtDate: '2000', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90) },
    { accountId: binance._id, assetSymbol: 'BTC', type: 'SELL', quantity: '0.001', priceAtDate: '45000', date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20) }
  ];

  for (const t of txs) {
    await Transaction.create({
      accountId: new mongoose.Types.ObjectId(t.accountId),
      assetSymbol: t.assetSymbol,
      type: t.type,
      quantity: mongoose.Types.Decimal128.fromString(t.quantity.toString()),
      priceAtDate: mongoose.Types.Decimal128.fromString(t.priceAtDate.toString()),
      date: t.date
    });
  }

  console.log('Seeding complete');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
