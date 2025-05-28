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



import skinsData from '../public/skins.json';

router.get('/profile/id/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .select('username avatarUrl level inventory bannedItems favoriteItems stats friends unreadRooms createdAt updatedAt')
      .lean();

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    function getFullItems(itemIds: string[] = []) {
      return skinsData.data.items.br.filter(item => itemIds.includes(item.id));
    }

    const inventoryIds = Array.isArray(user.inventory) ? user.inventory : [];
    const favoriteIds = Array.isArray(user.favoriteItems) ? user.favoriteItems : [];

    const bannedIds = Array.isArray(user.bannedItems)
      ? user.bannedItems.map((b: any) => b.itemId)
      : [];

    const fullInventory = getFullItems(inventoryIds);
    const fullBannedItems = getFullItems(bannedIds).map(item => {
  const match = user.bannedItems.find(b => b.itemId === item.id);
  return { ...item, reason: match?.reason || '' };
});
    const fullFavoriteItems = getFullItems(favoriteIds);

    res.json({
      ...user,
      fullInventory,
      fullBannedItems,
      fullFavoriteItems
    });

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/profile/id/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { avatarUrl, level } = req.body;

  try {
    const updateData: any = {};
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (level !== undefined) updateData.level = level;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'username avatarUrl level' }
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

router.post('/profile/id/:userId/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    if (!req.session || req.session.userId !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
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

    req.session.avatarUrl = avatarUrl;

    res.json({ message: 'Avatar updated', avatarUrl });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/profile/id/:userId/inventory-updates', async (req: Request, res: Response) => {
  console.log('PATCH /inventory-updates called by:', req.session?.userId);
  console.log('Request body:', req.body);

  const { userId } = req.params;

  if (!req.session || req.session.userId !== userId) {
    console.warn('Unauthorized inventory update attempt:', req.session?.userId, '!==', userId);
     res.status(403).json({ message: 'Unauthorized' });
     return;
  }

  const { favoriteIds, bannedItems } = req.body;

  try {
    const updateData: any = {};

    if (Array.isArray(favoriteIds)) {
      updateData.favoriteItems = favoriteIds;
    }

    if (Array.isArray(bannedItems)) {
      const validBans = bannedItems.filter(
        (item: any) => typeof item.itemId === 'string' && typeof item.reason === 'string'
      );
      updateData.bannedItems = validBans;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true
    });

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    res.json({ message: 'Inventory preferences updated successfully' });
  } catch (err) {
    console.error('Error updating inventory preferences:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



export default router;
