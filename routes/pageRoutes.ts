import { Router } from 'express';
const router = Router();

const pages = [
  'friendslist',
  'homePage',
  'inventaris',
  'landingspage',
  'login',
  'profiel',
  'registreren',
  'resetpassword',
  'settings',
  'shop'
];

pages.forEach(page => {
  const routePath = `/${page.replace('Page', '').toLowerCase()}`;
  router.get(routePath, (req, res) => {
    res.render(page);
  });
});

router.get('/', (req, res) => res.render('landingspage'));


export default router;