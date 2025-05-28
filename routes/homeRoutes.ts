import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Item from '../models/Item'; 
import mongoose from 'mongoose';
import data from '../public/skins.json';


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
        // Haal gebruiker en items op
        const [user, items] = await Promise.all([
            User.findById(req.session.userId).select('inventory username').lean(),
            Item.find().lean()
        ]);

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect('/login');
        }

        const purchasedItems = new Set(user.inventory || []);

        const inventoryWithDetails = (user.inventory || []).map(itemId => {
            const item = items.find(i => i._id.toString() === itemId.toString());
            return item ? {...item, purchased: true} : null;
        }).filter(Boolean);

        res.render('home', {
            user: {
                ...user,
                inventory: inventoryWithDetails
            },
            purchasedItems: Array.from(purchasedItems)
        });
    } catch (error) {
        console.error('Home error:', error);
        res.status(500).send('Server error');
    }
});

// Exporteer de router
export default router;