import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = Router();

const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};


router.get('/shop', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.session.userId)
      .select('username coins inventory')
      .lean();

    if (!user) {
      req.session.destroy(() => {});
      res.redirect('/login');
      return;
    }

    res.render('shop', { 
      user: {
        ...user,
        coins: user.coins || 0,
        inventory: user.inventory || []
      }
    });
  } catch (error) {
    console.error('Shop error:', error);
    res.redirect('/login');
  }
});

router.post('/purchase', isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, price } = req.body;
    
    // Validatie
    if (!itemId || typeof price !== 'number' || price <= 0) {
      res.status(400).json({ error: 'Ongeldige aanvraag' });
      return;
    }

    // Atomic update
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: req.session.userId,
        coins: { $gte: price },
        inventory: { $ne: itemId }
      },
      { 
        $inc: { coins: -price },
        $push: { inventory: itemId }
      },
      { new: true, select: 'coins inventory' }
    );

    if (!updatedUser) {
      const errorMsg = updatedUser === null 
        ? 'Onvoldoende saldo of item al in bezit' 
        : 'Item niet gevonden';
      res.status(400).json({ error: errorMsg });
      return;
    }

    res.json({
      success: true,
      coins: updatedUser.coins,
      inventory: updatedUser.inventory
    });
  } catch (error) {
    console.error('Aankoopfout:', error);
    res.status(500).json({ error: 'Interne serverfout' });
  }
});

export default router;