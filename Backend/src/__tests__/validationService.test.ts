import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from '../utils/db';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { canSell } from '../services/validationService';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Account.deleteMany({}), Transaction.deleteMany({})]);
});

test('canSell returns false when no holdings', async () => {
  const user = await User.create({ email: 'a@b.com', passwordHash: 'h' });
  const account = await Account.create({ userId: user._id, name: 'Test', type: 'BROKERAGE', currency: 'USD' });

  const ok = await canSell(account._id, 'AAPL', '1');
  expect(ok).toBe(false);
});

test('canSell returns true when sufficient holdings after buys and sells', async () => {
  const user = await User.create({ email: 'c@d.com', passwordHash: 'h' });
  const account = await Account.create({ userId: user._id, name: 'Test2', type: 'BROKERAGE', currency: 'USD' });

  await Transaction.create({ accountId: account._id, assetSymbol: 'AAPL', type: 'BUY', quantity: mongoose.Types.Decimal128.fromString('5'), priceAtDate: mongoose.Types.Decimal128.fromString('100'), date: new Date() });
  await Transaction.create({ accountId: account._id, assetSymbol: 'AAPL', type: 'SELL', quantity: mongoose.Types.Decimal128.fromString('2'), priceAtDate: mongoose.Types.Decimal128.fromString('120'), date: new Date() });

  const ok = await canSell(account._id, 'AAPL', '2');
  expect(ok).toBe(true);
  const ok2 = await canSell(account._id, 'AAPL', '4');
  expect(ok2).toBe(false);
});
