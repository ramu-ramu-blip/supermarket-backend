import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSuppliers).post(protect, admin, createSupplier);
router.route('/:id').put(protect, admin, updateSupplier).delete(protect, admin, deleteSupplier);

export default router;
