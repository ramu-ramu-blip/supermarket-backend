import express from 'express';
const router = express.Router();
import { addExpense, getExpenses } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, addExpense)
    .get(protect, getExpenses);

export default router;
