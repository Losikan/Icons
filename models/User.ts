import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  friends: Types.ObjectId[] | IUser[];
  unreadRooms: string[];
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  unreadRooms: [{ type: String }]
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export async function getFriendsOfUser(userId: string): Promise<IUser[]> {
  const user = await User.findById(userId).populate('friends');
  if (!user) return [];
  return user.friends as IUser[];
}

export default User;
