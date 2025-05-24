import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import FriendRequest from '../models/FriendRequest';
import Message from '../models/Message';

const router = express.Router();

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) return next();
  res.redirect('/login');
}

router.post('/friend-request/:toUserId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const fromUserId = req.session.userId;
    const toUserId = req.params.toUserId;

    if (fromUserId === toUserId) {
      res.status(400).send('Kan geen verzoek naar jezelf sturen');
      return;
    }

    const existing = await FriendRequest.findOne({ from: fromUserId, to: toUserId, status: 'pending' });
    if (existing) {
      res.status(400).send('Al verzonden');
      return;
    }

    await FriendRequest.create({ from: fromUserId, to: toUserId });
    res.status(200).send('Verzoek verzonden');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/friend-request/:requestId/accept', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request || request.to.toString() !== req.session.userId) {
      res.status(403).send('Geen toegang');
      return;
    }

    request.status = 'accepted';
    await request.save();

    await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

    res.status(200).send('Vriend toegevoegd');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/friend-request/:requestId/reject', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request || request.to.toString() !== req.session.userId) {
      res.status(403).send('Geen toegang');
      return;
    }

    request.status = 'declined';
    await request.save();

    res.status(200).send('Verzoek geweigerd');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/friend-request/:requestId/cancel', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request || request.from.toString() !== req.session.userId) {
      res.status(403).send('Geen toegang');
      return;
    }

    await request.deleteOne();
    res.status(200).send('Verzoek geannuleerd');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/friend-requests/incoming', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requests = await FriendRequest.find({ to: req.session.userId, status: 'pending' })
      .populate('from', 'username');
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/friend-requests/outgoing', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requests = await FriendRequest.find({ from: req.session.userId, status: 'pending' })
      .populate('to', 'username');
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/friends', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userIdStr = req.session.userId;
    const userId = new mongoose.Types.ObjectId(userIdStr);

    const user = await User.findById(userIdStr).populate('friends', 'username');

    if (!user || !user.friends) {
       res.json([]);
       return;
    }

    const enrichedFriends = await Promise.all(
      user.friends.map(async (friend: any) => {
        const friendIdStr = friend._id.toString();
        const room = [userIdStr, friendIdStr].sort().join('-');

        const lastMessage = await Message.findOne({ room })
          .sort({ timestamp: -1 })
          .select('timestamp');

        return {
          _id: friend._id,
          username: friend.username,
          lastMessageTimestamp: lastMessage?.timestamp || null
        };
      })
    );

    enrichedFriends.sort((a, b) => {
      const aTime = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
      const bTime = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
      return bTime - aTime;
    });

    res.json(enrichedFriends);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/api/search-users', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || '';
    if (!query.trim()) {
      res.json([]);
    } else {
      const users = await User.find({
        username: { $regex: new RegExp(query, 'i') },
        _id: { $ne: req.session?.userId },
      })
        .limit(10)
        .select('_id username');

      res.json(users);
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});


export default router;
