import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

const router = Router();


const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};

router.get('/home', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('inventory')
            .lean();

        res.render('home', {
            user: {
                ...user,
                inventory: user?.inventory || []
            }
        });
    } catch (error) {
        console.error('Home error:', error);
        res.status(500).send('Server error');
    }
});
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
    
    if (!itemId || typeof price !== 'number' || price <= 0) {
      res.status(400).json({ error: 'Ongeldige aanvraag' });
      return;
    }

    const updateQuery = {
      $inc: { coins: -price },
      $addToSet: { inventory: itemId } 
    };

    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: req.session.userId,
        coins: { $gte: price },
        inventory: { $ne: itemId }
      },
      updateQuery,
      { new: true, select: 'coins inventory' }
    );

    if (!updatedUser) {
      res.status(400).json({ 
        error: 'Onvoldoende saldo of item al in bezit',
        details: {
          requiredPrice: price,
          currentCoins: (await User.findById(req.session.userId))?.coins
        }
      });
      return;
    }

    res.json({
      success: true,
      coins: updatedUser.coins,
      inventory: updatedUser.inventory
    });
  } catch (error) {
    console.error('Aankoopfout:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Interne serverfout',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    });
  }
});

export default router;


