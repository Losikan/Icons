import { Schema, model, Document, Types, Model } from 'mongoose';
import skinsData from '../public/skins.json';
import { IItem } from './Item';

export interface IInventoryItem {
  item: Types.ObjectId | IItem;
  quantity: number;
}

export interface IStats {
  highScore: number;
  totalScore: number;
  gamesPlayed: number;
}

export interface IBannedItem {
  itemId: string;
  reason: string;
  bannedAt: Date;
}

const bannedItemSchema = new Schema({
  itemId: { type: String, required: true },
  reason: { type: String, default: '' },
  bannedAt: { type: Date, default: Date.now }
}, { _id: false });

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  coins: number;
  friends: Types.ObjectId[] | IUser[];
  unreadRooms: string[];
  resetToken?: string;
  resetTokenExpiration?: Date;

  avatarUrl?: string;
  level?: number;

  inventory: string[];
  bannedItems: IBannedItem[];
  favoriteItems: string[];

  stats?: IStats;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    validate: {
      validator: function (v: Types.ObjectId) {
        return skinsData.data.items.br.some(item => item.id === v.toString());
      },
      message: 'Item met ID {VALUE} bestaat niet in de shop'
    }
  },
  quantity: { type: Number, default: 1 }
});

const statsSchema = new Schema<IStats>({
  highScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 }
});

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Gebruikersnaam is verplicht'],
    unique: true,
    trim: true,
    minlength: [3, 'Minimaal 3 karakters'],
    maxlength: [20, 'Maximaal 20 karakters']
  },
  email: {
    type: String,
    required: [true, 'E-mail is verplicht'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Ongeldig e-mailformaat']
  },
  password: {
    type: String,
    required: [true, 'Wachtwoord is verplicht'],
    minlength: [8, 'Minimaal 8 karakters']
  },
  coins: {
    type: Number,
    default: 0,
    min: 0
  },
  inventory: [{
    type: String
  }],
  favoriteItems: [{
    type: String,
    default: []
  }],
  bannedItems: {
    type: [bannedItemSchema],
    default: []
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  unreadRooms: [{ type: String }],
  resetToken: { type: String, select: false },
  resetTokenExpiration: { type: Date, select: false },
  avatarUrl: { type: String, default: '' },
  level: { type: Number, default: 1 },
  stats: statsSchema
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.resetToken;
      delete ret.resetTokenExpiration;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.resetToken;
      delete ret.resetTokenExpiration;
      return ret;
    }
  }
});

userSchema.index({ username: 'text', email: 'text' });
userSchema.index({ inventory: 1 });

userSchema.virtual('purchaseHistory').get(function () {
  if (!this.inventory) return [];
  return this.inventory.map(invItemId =>
    skinsData.data.items.br.find(item => item.id === invItemId)
  ).filter(Boolean);
});

export async function getFriendsOfUser(userId: string): Promise<IUser[]> {
  const user = await User.findById(userId).populate('friends');
  return user?.friends as IUser[] || [];
}

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
