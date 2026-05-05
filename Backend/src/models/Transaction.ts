import mongoose, { Document, Schema } from 'mongoose';

export type TxType = 'BUY' | 'SELL';

export interface ITransaction extends Document {
  accountId: mongoose.Types.ObjectId;
  assetSymbol: string;
  type: TxType;
  quantity: mongoose.Types.Decimal128;
  priceAtDate: mongoose.Types.Decimal128;
  date: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  assetSymbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Schema.Types.Decimal128, required: true },
  priceAtDate: { type: Schema.Types.Decimal128, required: true },
  date: { type: Date, required: true }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
