import { Router } from 'express';
import User from '../models/User';

const router = Router();

router.get('/user-by-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
       res.status(404).send('User not found');
       return;
    }

    res.json({ userId: user._id });
  } catch (error) {
    console.error('Error in /user-by-username:', error);
    res.status(500).send('Server error');
  }
});

export default router;
