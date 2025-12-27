const express = require('express');
const router = express.Router();
const { createBill, getInvoices, getInvoiceById, deleteBill } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInvoices).post(protect, createBill);
router.route('/:id').get(protect, getInvoiceById).delete(protect, deleteBill);

module.exports = router;
