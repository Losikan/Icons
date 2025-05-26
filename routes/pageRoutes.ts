import { Router } from 'express';
import { Request, Response } from "express";
import User from "../models/User";
import data from '../public/skins.json';

const router = Router();

// ---------------------------
// Dynamische Pagina Routes
// ---------------------------
const protectedPages = ['profiel', 'settings', 'inventaris', 'friendslist'];

const pages = [
  'friendslist',
  'homePage',
  'inventaris',
  'landingspage',
  'login',
  'profiel',
  'registreren',
  'resetpassword',
  'settings'
];

pages.forEach(page => {
  const routePath = `/${page.replace('Page', '').toLowerCase()}`;
  
  router.get(routePath, async (req: Request, res: Response) => {
    try {
      // Authenticatie check voor beveiligde pagina's
      if (protectedPages.includes(page) && !req.session.userId) {
        return res.redirect("/login");
      }
      
      // Geef altijd de laatste user-data door
      const user = req.session.userId 
        ? await User.findById(req.session.userId).lean()
        : null;

      res.render(page, { user });
    } catch (error) {
      console.error(`${page} Route Error:`, error);
      res.status(500).render("error", { message: "Laadfout" });
    }
  });
});

// ---------------------------
// Shop Route (gecorrigeerd)
// ---------------------------
router.get('/shop', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId).lean();
    if (!user) {
      req.session.destroy(() => {});
      return res.redirect("/login");
    }

    res.render("shop", { 
      user,
      items: data.data.items.br
    });
  } catch (error) {
    console.error("Shop Route Error:", error);
    res.status(500).render("error", { message: "Serverfout" });
  }
});



// ---------------------------
// Overige Routes
// ---------------------------
router.get('/', (req: Request, res: Response) => {
  res.render('landingspage', { user: req.session.userId ? { coins: req.session.coins } : null });
});

export default router;