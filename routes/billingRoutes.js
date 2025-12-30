import express from 'express';
const router = express.Router();
import { createBill, getInvoices, getInvoiceById, deleteBill } from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getInvoices).post(protect, createBill);
router.route('/:id').get(protect, getInvoiceById).delete(protect, deleteBill);

export default router;
