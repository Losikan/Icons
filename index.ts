import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import Message from './models/Message';
import User, { getFriendsOfUser, IUser } from './models/User';
import { NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import pageRoutes from './routes/pageRoutes';
import friendRoutes from './routes/friendRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import './models/User';
import profileRoutes from './routes/profileRoutes';
import Achievement from './models/Achievement';
import { IAchievement } from './models/Achievement';
import './models/User';
import './models/Item';
import './models/Achievement';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    coins?: number;
    avatarUrl?: string;
    inventory?: any[]; // Adjust type as needed
  }
}

mongoose.connect(process.env.MONGO_URI!)
  .then(async () => {
    console.log('Connected to MongoDB')})
  .catch(err => console.error('MongoDB connection error:', err));

app.use(sessionMiddleware);

io.use((socket, next: (err?: any) => void) => {
  sessionMiddleware(socket.request as any, {} as any, next as NextFunction);
});

const userSocketsMap = new Map<string, Set<string>>();

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  const session = (socket.request as any).session;
  const userId = session?.userId;
  const username = session?.username || 'Unknown';

  if (userId) {
    if (!userSocketsMap.has(userId)) {
      userSocketsMap.set(userId, new Set());
    }
    userSocketsMap.get(userId)!.add(socket.id);

    try {
      const friends: IUser[] = await getFriendsOfUser(userId);
      friends.forEach(friend => {
         const friendId = (friend._id as mongoose.Types.ObjectId).toString();
        const room = [userId, friendId].sort().join('-');
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });
    } catch (err) {
      console.error('Error joining friend rooms:', err);
    }
  }

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
  });

 socket.on('chatMessage', async ({ room, type = 'text', message = '', image = '' }) => {
  try {
    const newMessage = new Message({
      room,
      sender: username,
      type,
      message: type === 'text' ? message : '',
      image: type === 'image' ? image : '',
      readBy: [userId],
    });
    await newMessage.save();

    const [userId1, userId2] = room.split('-');
    const recipientId = userId1 === userId ? userId2 : userId1;

    await User.updateOne(
      { _id: recipientId, unreadRooms: { $ne: room } },
      { $push: { unreadRooms: room } }
    );

    [userId1, userId2].forEach((uid) => {
      const sockets = userSocketsMap.get(uid);
      if (sockets) {
        sockets.forEach(sid => {
          io.to(sid).emit('chatMessage', {
            sender: username,
            type,
            message: type === 'text' ? message : '',
            image: type === 'image' ? image : '',
            timestamp: newMessage.timestamp,
            room,
          });

          io.to(sid).emit('newMessageNotification', {
            room,
            sender: username,
            type,
            message: type === 'text' ? message : '',
            image: type === 'image' ? image : '',
            timestamp: newMessage.timestamp,
          });
        });
      }
    });

  } catch (err) {
    console.error('Error saving message:', err);
  }
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (userId && userSocketsMap.has(userId)) {
      userSocketsMap.get(userId)!.delete(socket.id);
      if (userSocketsMap.get(userId)!.size === 0) {
        userSocketsMap.delete(userId);
      }
    }
  });
});

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', friendRoutes);
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', profileRoutes);


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
