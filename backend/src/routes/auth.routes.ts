import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example protected route for testing
router.get('/me', protect, (req, res) => {
  res.json({ message: 'Protected route access successful', userId: req.user });
});

export default router;
