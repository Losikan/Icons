import { Router } from 'express';
import Message from '../models/Message';
import User, { getFriendsOfUser } from '../models/User';
import mongoose from 'mongoose';

const router = Router();

router.get('/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Laden van berichten mislukt');
  }
});

router.post('/messages/:room/read', async (req, res) => {
  const userIdStr = req.session.userId;
  const room = req.params.room;

  if (!userIdStr) {
     res.status(401).send('Geen toegang');
     return;
  }

  try {
    const userId = new mongoose.Types.ObjectId(userIdStr);

    await Message.updateMany(
      { room, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { unreadRooms: room } }
    );

    res.status(200).send('Berichten als gelezen gemarkeerd');

  } catch (err) {
    console.error(err);
    res.status(500).send('Berichten als gelezen markeren mislukt');
  }
});


router.get('/unread-counts', async (req, res) => {
  const userIdStr = req.session.userId;
  if (!userIdStr) {
     res.status(401).send('Geen toegang');
     return;
  }

  try {
    const userId = new mongoose.Types.ObjectId(userIdStr);
    const friends = await getFriendsOfUser(userIdStr);

    const unreadCounts = await Promise.all(
      friends.map(async (friend) => {
        const friendIdStr = (friend._id as mongoose.Types.ObjectId).toString();
        const room = [friendIdStr, userIdStr].sort().join('-');
        const count = await Message.countDocuments({
          room,
          readBy: { $ne: userId },
        });
        return { friendId: friend._id, count };
      })
    );

    res.json(unreadCounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Mislukt om ongelezen count te krijgen');
  }
});

router.get('/unread-rooms', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
     res.status(401).send('Geen toegang');
     return;
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      res.status(404).send('Gebruiker niet gevonden');
      return;
    } 

    res.json(user.unreadRooms || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Mislukt om ongelezen rooms te krijgen');
  }
});

export default router;
