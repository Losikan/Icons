import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  name: string;
  iconUrl: string;
  description?: string;
}

const itemSchema = new Schema<IItem>({
  name:       { type: String, required: true },
  iconUrl:    { type: String, required: true },
  description:{ type: String }
}, { timestamps: true });

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);
export default Item;
