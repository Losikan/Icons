import { Router } from 'express';
import data from '../public/skins.json';
const router = Router();

const pages = [
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
  router.get(routePath, (req, res) => {
    res.render(page);
  });
});

router.get('/shop', (req, res) => {
  const items = data.data.items.br;
  res.render('shop', { items });
});

router.get('/friendslist', (req, res) => {
  if (!req.session?.username) {
    return res.redirect('/login');
  }
  res.render('friendslist', {
    username: req.session.username,
    userId: req.session.userId,
    session: req.session
  });
});

router.get('/', (req, res) => res.render('landingspage'));


export default router;