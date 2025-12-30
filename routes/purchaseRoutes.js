import express from 'express';
import { getPurchases, createPurchase, deletePurchase } from '../controllers/purchaseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPurchases).post(protect, admin, createPurchase);
router.route('/:id').delete(protect, admin, deletePurchase);

export default router;
