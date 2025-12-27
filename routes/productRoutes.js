const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getExpiringProducts, updateProduct, deleteProduct, bulkImportProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/').get(protect, getProducts).post(protect, createProduct);
router.post('/bulk-import', protect, upload.single('file'), bulkImportProducts);
router.get('/expiring', protect, getExpiringProducts);
router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);

module.exports = router;
