import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  message: String,
  image: String,
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
