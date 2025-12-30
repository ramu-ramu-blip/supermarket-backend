import express from 'express';
const router = express.Router();
import { registerUser, loginUser, updateProfile, createAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/create-admin', createAdmin);
router.put('/profile', protect, updateProfile);

export default router;
