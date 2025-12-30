import express from 'express';
const router = express.Router();
import { createProduct, getProducts, getExpiringProducts, updateProduct, deleteProduct, bulkImportProducts } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.route('/').get(protect, getProducts).post(protect, createProduct);
router.post('/bulk-import', protect, upload.single('file'), bulkImportProducts);
router.get('/expiring', protect, getExpiringProducts);
router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);

export default router;
