import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';

const router = Router();

// Login functionaliteit
router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }]
    });

    if (!user) return res.redirect('/login?error=email');
    if (!await bcrypt.compare(req.body.password, user.password)) 
      return res.redirect('/login?error=password');

    (req.session as any).userId = user._id;
    res.redirect('/home');
  } catch (error) {
    res.redirect('/login?error=server');
  }
});

// Registratie functionaliteit
router.get('/register', (req, res) => res.render('registreren'));

router.post('/register', async (req, res) => {
  try {
    // Eerste validaties
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('registreren', { 
        error: 'Wachtwoorden komen niet overeen',
        formData: req.body 
      });
    }

    // Dubbele gebruikers check
    const existingUser = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    });

    if (existingUser) {
      let errorMessage = 'Gebruikersnaam of e-mail bestaat al';
      if (existingUser.email === req.body.email) errorMessage = 'E-mailadres is al in gebruik';
      if (existingUser.username === req.body.username) errorMessage = 'Gebruikersnaam is al in gebruik';
      
      return res.render('registreren', { 
        error: errorMessage,
        formData: req.body 
      });
    }

    // Gebruiker aanmaken
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect('/login');
  } catch (error: any) {
    let errorMessage = 'Registratiefout - probeer andere gegevens';
    if (error.code === 11000) {
      errorMessage = 'Deze gegevens zijn al in gebruik';
    }
    res.render('registreren', { 
      error: errorMessage,
      formData: req.body 
    });
  }
});

// Uitloggen
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));

});



const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session.id) return next(); // Gebruiker is ingelogd
  res.redirect("/login"); // Stuur door naar login als niet ingelogd
};
// Voeg dit toe aan je authRoutes.ts
router.get('/shop', isAuthenticated, async (req, res) => {
  try {
    // 1. Haal de gebruiker op via de SESSIE-ID
    const user = await User.findById(req.session.id);
    
    // 2. Geef een fout als de gebruiker niet bestaat
    if (!user) return res.redirect('/login?error=user_not_found');

    // 3. Debug: Log de coins en het type
    console.log("[DEBUG] Coins:", user.coins, "Type:", typeof user.coins);

    // 4. Render de shop met de gebruikersdata
    res.render('shop', { 
      user: {
        username: user.username,
        coins: user.coins // 🚨 Zorg dat dit een NUMBER is!
      }
    });
  } catch (error) {
    console.error("[Fout in /shop]:", error);
    res.redirect('/login?error=server');
  }
});


export default router;
