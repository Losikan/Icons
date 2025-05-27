import { Router } from 'express';
import data from '../public/skins.json';
import User from '../models/User';
const router = Router();

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

router.get('/profile', (req, res) => {
  if (!req.session?.username) {
    return res.redirect('/login');
  }

  res.redirect(`/profile/${req.session.username}`);
});

router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select('_id username').lean();
    if (!user) {
      res.status(404).send('User not found');
      return;
    } 

    res.render('profiel', {
      username: user.username,
      userId: user._id.toString(),
      session: req.session
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/', (req, res) => res.render('landingspage'));


export default router;