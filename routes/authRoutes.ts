import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';


declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

const router = Router();

// ======================
// Authenticatie Middleware
// ======================
const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};

// ======================
// Login Functionaliteit
// ======================
router.get('/login', (req: Request, res: Response) => {
  res.render('login');
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }]
    }).select('+password');

    if (!user) return res.redirect('/login?error=email');
    if (!await bcrypt.compare(req.body.password, user.password)) 
      return res.redirect('/login?error=password');

    req.session.userId = user._id.toString();
    return res.redirect('/home');
  } catch (error) {
    console.error('Login error:', error);
    return res.redirect('/login?error=server');
  }
});

// ======================
// Registratie Functionaliteit
// ======================
router.get('/register', (req: Request, res: Response) => {
  res.render('registreren');
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('registreren', { 
        error: 'Wachtwoorden komen niet overeen',
        formData: req.body 
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }]
    });

    if (existingUser) {
      const errorMessage = existingUser.email === req.body.email 
        ? 'E-mailadres is al in gebruik' 
        : 'Gebruikersnaam is al in gebruik';
      return res.render('registreren', { error: errorMessage, formData: req.body });
    }

    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      coins: 1000,
      inventory: [] // 🔄 Changed from purchasedItems
    });

    req.session.userId = newUser._id.toString();
    return res.redirect('/home');
  } catch (error: any) {
    console.error('Registratiefout:', error);
    const errorMessage = error.code === 11000 
      ? 'Deze gegevens zijn al in gebruik' 
      : 'Registratiefout - probeer andere gegevens';
    return res.render('registreren', { error: errorMessage, formData: req.body });
  }
});

// ======================
// Winkel Functionaliteit
// ======================
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

// ======================
// Uitloggen
// ======================
router.get('/logout', (req: Request, res: Response): void => {
  req.session.destroy(() => res.redirect('/login'));
});

export default router;