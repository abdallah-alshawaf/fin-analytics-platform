import mongoose, { Document, Schema } from 'mongoose';

export type AccountType = 'SAVINGS' | 'BROKERAGE' | 'CRYPTO';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;
  currency: string;
}

const AccountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['SAVINGS', 'BROKERAGE', 'CRYPTO'], required: true },
  currency: { type: String, default: 'USD' }
});

export default mongoose.model<IAccount>('Account', AccountSchema);
