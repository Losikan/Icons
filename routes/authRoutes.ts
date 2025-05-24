import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = Router();

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.email }]
    });

    if (user && await bcrypt.compare(req.body.password, user.password)) {
      (req.session as any).userId = user._id;
      (req.session as any).username = user.username;  // ADD THIS LINE
      return res.redirect('/home');
    }
    res.render('login', { error: 'Ongeldige inloggegevens' });
  } catch (error) {
    res.status(500).render('login', { error: 'Serverfout' });
  }
});

router.get('/register', (req, res) => res.render('registreren'));

router.post('/register', async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('registreren', { error: 'Wachtwoorden komen niet overeen' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    res.redirect('/login');
  } catch (error: any) {
    let errorMessage = 'Registratiefout';
    if (error.code === 11000) {
      errorMessage = error.keyValue.email ? 'Email bestaat al' : 'Gebruikersnaam bestaat al';
    }
    res.render('registreren', { error: errorMessage });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Could not log out.');
    }
    res.clearCookie('connect.sid'); // clear the session cookie
    res.redirect('/login'); // redirect to login or landing page
  });
});

router.post('/resetpassword', async (req, res) => {
  res.render('resetpassword', { message: 'Resetlink verstuurd naar je e-mail' });
});

export default router;