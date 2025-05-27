import { Router, Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import User from '../models/User';
import Item from '../models/Item';

const router = Router();

const uploadDir = path.join(__dirname, '../public/uploads/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/profile/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .select('username description avatarUrl level inventory stats achievements friends unreadRooms createdAt updatedAt')
      .populate('achievements')
      .populate('inventory.item')
      .lean();

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/profile/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { description, avatarUrl, level, achievements } = req.body;

  try {
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (level !== undefined) updateData.level = level;
    if (achievements !== undefined) updateData.achievements = achievements;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'username description avatarUrl level achievements' }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/profile/:userId/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    if (!req.session || req.session.userId !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return ;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return ;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '../public', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error('Error deleting old avatar:', err);
        });
      }
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ message: 'Avatar updated', avatarUrl });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
