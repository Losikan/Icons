import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
coins: { 
    type: Number, 
    min: 0 
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date
}, { timestamps: true });

export default model('User', userSchema);
