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
  'homePage',
  'inventaris',
  'landingspage',
  'login',
  'registreren',
  'resetpassword',
  'settings'
];

pages.forEach(page => {
  const routePath = `/${page.replace('Page', '').toLowerCase()}`;
  
  router.get(routePath, async (req: Request, res: Response) => {
    try {
      if (protectedPages.includes(page) && !req.session.userId) {
        return res.redirect("/login");
      }
      
      const user = req.session.userId 
        ? await User.findById(req.session.userId)
              .select('username email coins inventory') // 🔄 Updated
              .lean()
        : null;

      res.render(page, { 
        user: {
          ...user,
          inventory: user?.inventory || [] // 🔄 Updated
        }
      });
    } catch (error) {
      console.error(`${page} Route Error:`, error);
      res.status(500).render("error", { message: "Laadfout" });
    }
  });
});

// ---------------------------
// Shop Route
// ---------------------------
router.get('/shop', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId)
      .select('username coins inventory') // 🔄 Updated
      .lean();

    if (!user) {
      req.session.destroy(() => {});
      return res.redirect("/login");
    }

    res.render("shop", { 
      user: {
        ...user,
        inventory: user.inventory || [] // 🔄 Updated
      },
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
  res.render('landingspage', { 
    user: req.session.userId ? { 
      coins: req.session.coins,
      inventory: [] // 🔄 Standaard lege array
    } : null 
  });
});

export default router;