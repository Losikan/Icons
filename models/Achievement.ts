import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  iconUrl: string;
  description?: string;
}

const achievementSchema = new Schema<IAchievement>({
  name:       { type: String, required: true },
  iconUrl:    { type: String, required: true },
  description:{ type: String }
}, { timestamps: true });

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>('Achievement', achievementSchema);

export default Achievement;
