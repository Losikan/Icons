import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { IItem } from './Item';
import { IAchievement } from './Achievement';

export interface IInventoryItem {
  item: Types.ObjectId | IItem;
  quantity: number;
}

export interface IStats {
  highScore: number;
  totalScore: number;
  gamesPlayed: number;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  friends: Types.ObjectId[] | IUser[];
  unreadRooms: string[];

  description?: string;
  avatarUrl?: string;
  level?: number;
  inventory?: IInventoryItem[];
  stats?: IStats;
  achievements?: (Types.ObjectId | IAchievement)[];
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  item:     { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1 }
});

const statsSchema = new Schema<IStats>({
  highScore:    { type: Number, default: 0 },
  totalScore:   { type: Number, default: 0 },
  gamesPlayed:  { type: Number, default: 0 }
});

const userSchema = new Schema<IUser>({
  username:     { type: String, required: true, unique: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },

  friends:      [{ type: Schema.Types.ObjectId, ref: 'User' }],
  unreadRooms:  [{ type: String }],

  description:  { type: String, default: '' },
  avatarUrl:    { type: String, default: '' },
  level:        { type: Number, default: 1 },
  inventory:    [inventoryItemSchema],
  stats:        statsSchema,
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }]
}, {
  timestamps: true
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export async function getFriendsOfUser(userId: string): Promise<IUser[]> {
  const user = await User.findById(userId).populate('friends');
  if (!user) return [];
  return user.friends as IUser[];
}

export default User;
