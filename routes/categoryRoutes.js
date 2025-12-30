import express from 'express';
const router = express.Router();
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';

import { protect } from '../middleware/authMiddleware.js';

router.get('/', protect, getCategories);
router.post('/', protect, createCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
