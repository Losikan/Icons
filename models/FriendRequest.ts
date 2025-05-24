import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface IFriendRequest extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { timestamps: true });

const FriendRequest: Model<IFriendRequest> =
  mongoose.models.FriendRequest || mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);

export default FriendRequest;
