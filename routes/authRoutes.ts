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
      coins: 0,
      inventory: [] 
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
// Uitloggen
// ======================
router.get('/logout', (req: Request, res: Response): void => {
  req.session.destroy(() => res.redirect('/login'));
});

export default router;